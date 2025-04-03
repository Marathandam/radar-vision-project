
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ArrowLeft, RefreshCw, Check } from 'lucide-react';
import Layout from '../components/Layout';

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const navigate = useNavigate();
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setUploadedFileName(file.name);
      setConvertedImage(null);
    }
  };

  const handleConvert = () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay - in a real application this would be an API call
    setTimeout(() => {
      // For demo purposes, we're just using the same image
      // In a real app, this would be the converted SAR image from your backend
      setConvertedImage(selectedImage);
      setIsProcessing(false);
    }, 2500);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setConvertedImage(null);
    setUploadedFileName("");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate('/options')}
            className="flex items-center text-night-300 hover:text-radar-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to options</span>
          </button>
        </div>

        <h1 className="radar-title text-center">Optical to SAR Image Conversion</h1>
        <p className="text-center text-night-300 mb-12">
          Upload an optical image to convert it into a synthetic aperture radar representation
        </p>

        {!selectedImage ? (
          <div className="upload-zone flex flex-col items-center justify-center py-12">
            <input 
              type="file" 
              id="image-upload"
              accept="image/*" 
              onChange={handleImageUpload}
              className="hidden" 
            />
            <Upload className="w-16 h-16 text-night-500 mb-4" />
            <label 
              htmlFor="image-upload" 
              className="radar-button cursor-pointer"
            >
              Select an Image
            </label>
            <p className="mt-4 text-night-400 text-sm">JPG, PNG or GIF, max 10MB</p>
          </div>
        ) : (
          <div className="radar-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                {uploadedFileName}
              </h3>
              <button 
                onClick={handleClearImage}
                className="text-night-400 hover:text-radar-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <div className="mb-3 text-night-400 text-sm font-medium">Original Image</div>
                <div className="h-64 md:h-80 bg-night-800/50 rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={selectedImage} 
                    alt="Original" 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="mb-3 text-night-400 text-sm font-medium">SAR Representation</div>
                <div className="h-64 md:h-80 bg-night-800/50 rounded-lg overflow-hidden flex items-center justify-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center">
                      <RefreshCw className="w-12 h-12 text-radar-500 animate-spin" />
                      <p className="mt-4 text-night-300">Processing image...</p>
                    </div>
                  ) : convertedImage ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={convertedImage} 
                        alt="SAR" 
                        className="max-w-full max-h-full object-contain mx-auto" 
                      />
                      <div className="absolute top-2 right-2 bg-radar-600 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-night-400">Click "Convert to SAR" to generate</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <button 
                onClick={handleConvert}
                disabled={isProcessing}
                className={`radar-button ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : convertedImage ? (
                  'Generate New SAR Image'
                ) : (
                  'Convert to SAR'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ImageUpload;
