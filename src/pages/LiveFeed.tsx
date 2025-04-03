
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RefreshCw, Download, Radio } from 'lucide-react';
import Layout from '../components/Layout';

const LiveFeed = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [processingStats, setProcessingStats] = useState({
    fps: 0,
    frameCount: 0,
    processingTime: 0
  });
  const navigate = useNavigate();

  // Simulate updating stats when streaming is active
  useEffect(() => {
    if (!isStreaming) return;
    
    const interval = setInterval(() => {
      setProcessingStats(prevStats => ({
        fps: 12 + Math.floor(Math.random() * 8), // Random FPS between 12-20
        frameCount: prevStats.frameCount + 1,
        processingTime: 40 + Math.floor(Math.random() * 35) // Random time between 40-75ms
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isStreaming]);

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
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

        <h1 className="radar-title text-center">Live Feed SAR Generation</h1>
        <p className="text-center text-night-300 mb-12">
          Process real-time data streams for continuous SAR image generation
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="radar-card h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Live Feed Visualization</h3>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-night-500'}`}></span>
                  <span className="text-sm text-night-300">{isStreaming ? 'Stream active' : 'Stream inactive'}</span>
                </div>
              </div>
              
              <div className="flex-grow bg-night-800/70 rounded-lg overflow-hidden relative">
                {/* Simulated feed visualization */}
                <div className="absolute inset-0 bg-radar-pattern opacity-30"></div>
                {isStreaming && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border border-radar-700/30 rounded-full animate-pulse-slow"></div>
                      <div className="absolute w-48 h-48 border border-radar-600/40 rounded-full"></div>
                      <div className="absolute w-32 h-32 border border-radar-500/50 rounded-full"></div>
                      <div className="absolute w-1 h-32 bg-gradient-to-t from-radar-500 to-transparent origin-bottom animate-radar-scan"></div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-xs text-night-400">
                      Processing frame: {processingStats.frameCount}
                    </div>
                  </>
                )}
                
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Radio className="w-12 h-12 text-night-500 mx-auto mb-3" />
                      <p className="text-night-400">Click "Start Stream" to begin processing</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={toggleStream}
                  className={`radar-button flex-1 ${!isStreaming ? 'bg-gradient-to-r from-radar-600 to-radar-700' : 'bg-gradient-to-r from-night-600 to-night-700'}`}
                >
                  {isStreaming ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause Stream
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Stream
                    </>
                  )}
                </button>
                <button 
                  className="radar-button flex-1"
                  disabled={!isStreaming}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Save Current Frame
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="radar-card">
              <h3 className="text-lg font-medium text-white mb-4">Processing Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-night-400 mb-1">Frames Per Second</div>
                  <div className="text-2xl font-bold text-radar-400">
                    {isStreaming ? processingStats.fps : '-'}
                    <span className="text-sm text-night-400 ml-1">FPS</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-night-400 mb-1">Processing Time</div>
                  <div className="text-2xl font-bold text-radar-400">
                    {isStreaming ? processingStats.processingTime : '-'}
                    <span className="text-sm text-night-400 ml-1">ms</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-night-400 mb-1">Total Frames Processed</div>
                  <div className="text-2xl font-bold text-radar-400">
                    {processingStats.frameCount}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="radar-card">
              <h3 className="text-lg font-medium text-white mb-4">Stream Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-night-400 block mb-2">Resolution</label>
                  <select className="w-full bg-night-800 border border-night-600 rounded-md px-3 py-2 text-white">
                    <option>1080p (1920x1080)</option>
                    <option>720p (1280x720)</option>
                    <option>480p (854x480)</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-night-400 block mb-2">Processing Quality</label>
                  <select className="w-full bg-night-800 border border-night-600 rounded-md px-3 py-2 text-white">
                    <option>High (Slower)</option>
                    <option selected>Balanced</option>
                    <option>Fast (Lower quality)</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-night-400">Enable Enhancement</label>
                    <div className="w-10 h-5 bg-night-700 rounded-full relative">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-radar-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LiveFeed;
