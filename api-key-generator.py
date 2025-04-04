from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import datetime
import pyproj
import os
import cv2
import numpy as np
from requests_toolbelt.multipart import decoder

app = Flask(__name__)
CORS(app)

# --- Sentinel Hub Credentials ---
CLIENT_ID = "60c275fa-6351-4cad-866a-693780befc30"
CLIENT_SECRET = "BdcyiEAzBLkWgwEx1vyfONJcIamsQ3JW"
AUTH_URL = "https://services.sentinel-hub.com/oauth/token"
PROCESS_URL = "https://services.sentinel-hub.com/api/v1/process"

# Get access token from Sentinel Hub
def get_access_token():
    print("[INFO] Requesting access token...")
    response = requests.post(
        AUTH_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    response.raise_for_status()
    token = response.json()["access_token"]
    print("[INFO] Access token obtained.")
    return token

# Convert bounding box from EPSG:4326 (lat/lon) to EPSG:3857
def convert_bbox_epsg4326_to_3857(bbox):
    transformer = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
    return list(transformer.transform(bbox[0], bbox[1])) + list(transformer.transform(bbox[2], bbox[3]))

# Enhanced SAR image processing pipeline
def process_sar_image(input_path, output_path):
    try:
        # Read the image
        img = cv2.imread(input_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError("Failed to load image")
        
        # Step 1: Histogram equalization
        enhanced = cv2.equalizeHist(img)
        
        # Step 2: Denoising with median filter
        denoised = cv2.medianBlur(enhanced, 3)
        
        # Step 3: Contrast Limited Adaptive Histogram Equalization (CLAHE)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        final_image = clahe.apply(denoised)
        
        # Save the processed image
        cv2.imwrite(output_path, final_image)
        return True
        
    except Exception as e:
        print(f"[ERROR] Image processing failed: {e}")
        return False

# Preprocess image for model
def preprocess_for_model(input_path):
    img = cv2.imread(input_path, cv2.IMREAD_GRAYSCALE)

    if img is None:
        raise ValueError("Failed to load image.")

    # Resize to 256x256
    img = cv2.resize(img, (256, 256))

    # Convert to float32 and normalize to [-1, 1]
    img = img.astype(np.float32)
    img = (img / 127.5) - 1.0

    # Add channel and batch dimensions: (1, 1, 256, 256)
    img = np.expand_dims(img, axis=0)  # (1, 256, 256)
    img = np.expand_dims(img, axis=0)  # (1, 1, 256, 256)

    return img

# Main endpoint to get SAR image
@app.route("/get-sar-image", methods=["POST"])
def get_sar_image():
    data = request.json
    lat = data.get("latitude")
    lon = data.get("longitude")

    if not lat or not lon:
        return jsonify({"error": "Latitude and longitude are required."}), 400

    try:
        token = get_access_token()
    except Exception as e:
        return jsonify({"error": f"Failed to get token: {e}"}), 500

    margin = 0.05
    bbox = [lon - margin, lat - margin, lon + margin, lat + margin]
    bbox_3857 = convert_bbox_epsg4326_to_3857(bbox)

    now = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc)
    past = now - datetime.timedelta(days=365)

    print(f"[INFO] Searching SAR data from {past.date()} to {now.date()}...")

    evalscript = """
    //VERSION=3
    function setup() {
        return {
            input: ["VH"],
            output: { bands: 1 }
        };
    }

    function evaluatePixel(sample) {
        return [sample.VH];
    }
    """

    payload = {
        "input": {
            "bounds": {
                "bbox": bbox_3857,
                "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/3857"}
            },
            "data": [{
                "type": "S1GRD",
                "dataFilter": {
                    "timeRange": {
                        "from": past.isoformat(),
                        "to": now.isoformat()
                    }
                }
            }]
        },
        "evalscript": evalscript,
        "responses": [
            {"identifier": "default", "format": {"type": "image/png"}},
            {"identifier": "userdata", "format": {"type": "application/json"}}
        ],
        "output": {"width": 256, "height": 256}
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print("[INFO] Requesting SAR image from Sentinel Hub...")
    try:
        response = requests.post(PROCESS_URL, headers=headers, json=payload)
        response.raise_for_status()
    except requests.exceptions.HTTPError as err:
        print(f"[ERROR] HTTP Error: {err}")
        return jsonify({"error": f"HTTP Error: {err}", "details": response.text}), 500
    except Exception as e:
        print(f"[ERROR] Request failed: {e}")
        return jsonify({"error": f"Image request failed: {e}"}), 500

    print("[INFO] Image received from Sentinel Hub.")

    image_path = "latest_sar_image.png"
    processed_image_path = "processed_sar_image.png"
    metadata = {}

    content_type = response.headers.get("Content-Type", "")
    if "multipart" in content_type:
        multipart_data = decoder.MultipartDecoder.from_response(response)
        for part in multipart_data.parts:
            ctype = part.headers.get(b"Content-Type", b"").decode()
            if "image" in ctype:
                with open(image_path, "wb") as f:
                    f.write(part.content)
            elif "application/json" in ctype:
                metadata = part.content.decode()
    elif "image/png" in content_type:
        with open(image_path, "wb") as f:
            f.write(response.content)

    print("[INFO] Image saved successfully.")

    if process_sar_image(image_path, processed_image_path):
        print("[INFO] Image processed successfully.")

        try:
            model_input = preprocess_for_model(processed_image_path)
            print("[INFO] Image preprocessed for model. Shape:", model_input.shape)

            return jsonify({
                "message": "SAR image processed and ready for model",
                "shape": model_input.shape,
                "image_url": "http://localhost:5000/image",
                "metadata": metadata
            })
        except Exception as e:
            return jsonify({"error": f"Preprocessing failed: {e}"}), 500
    else:
        return jsonify({"error": "Failed to process SAR image."}), 500

# Serve the processed SAR image
@app.route("/image")
def serve_image():
    return send_file("processed_sar_image.png", mimetype="image/png")

# --- Run Flask App ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)