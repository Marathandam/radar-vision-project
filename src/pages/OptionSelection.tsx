
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Radio, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

const OptionSelection = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="radar-title text-center">Select Generation Method</h1>
        <p className="text-center text-night-300 mb-12">
          Choose how you want to generate SAR images based on your available data source
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Upload Option */}
          <div 
            className="radar-card hover:border-radar-600 cursor-pointer transition-all duration-300 hover:translate-y-[-5px]"
            onClick={() => navigate('/image-upload')}
          >
            <div className="h-40 mb-6 flex items-center justify-center rounded-lg bg-night-800/50 overflow-hidden group">
              <Upload className="w-16 h-16 text-radar-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Image Upload</h2>
            <p className="text-night-200 mb-6">
              Upload an optical image from your device to convert it into a SAR representation using our advanced algorithms.
            </p>
            <div className="flex justify-end">
              <button className="flex items-center text-radar-400 hover:text-radar-300 transition-colors">
                <span>Get started</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>

          {/* Live Feed Option */}
          <div 
            className="radar-card hover:border-radar-600 cursor-pointer transition-all duration-300 hover:translate-y-[-5px]"
            onClick={() => navigate('/live-feed')}
          >
            <div className="h-40 mb-6 flex items-center justify-center rounded-lg bg-night-800/50 overflow-hidden group">
              <Radio className="w-16 h-16 text-radar-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Live Feed</h2>
            <p className="text-night-200 mb-6">
              Process a real-time data feed to continuously generate SAR images for monitoring and analysis.
            </p>
            <div className="flex justify-end">
              <button className="flex items-center text-radar-400 hover:text-radar-300 transition-colors">
                <span>Get started</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OptionSelection;
