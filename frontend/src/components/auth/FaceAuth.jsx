import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceAuth = ({ onVerified, userId, mode = 'verify' }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Initializing camera...');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus('Loading AI models...');
        // Load from /models/ (served via publicDir in vite config)
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        startVideo();
      } catch (err) {
        setError('Failed to load face recognition models.');
        console.error(err);
      }
    };
    loadModels();
  }, []);

  const startVideo = () => {
    setStatus('Starting camera...');
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        videoRef.current.srcObject = stream;
        setLoading(false);
        setStatus('Scanning face...');
      })
      .catch(err => {
        setError('Camera access denied or not found.');
        console.error(err);
      });
  };

  const handleScan = async () => {
    if (!videoRef.current || !userId) return;

    // Use more sensitive detection options
    const detections = await faceapi.detectSingleFace(
      videoRef.current, 
      new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.3 })
    ).withFaceLandmarks().withFaceDescriptor();

    if (detections) {
      setStatus('Face detected! Verifying...');
      const descriptor = Array.from(detections.descriptor);
      onVerified(descriptor);
    } else {
      setStatus('Scanning... Please keep your face clearly visible.');
    }
  };

  useEffect(() => {
    let interval;
    if (!loading && !error) {
      interval = setInterval(handleScan, 2000);
    }
    return () => clearInterval(interval);
  }, [loading, error]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary shadow-xl">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        />
        <canvas ref={canvasRef} className="absolute inset-0" />
        {loading && (
          <div className="absolute inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center text-white text-sm">
            {status}
          </div>
        )}
      </div>
      
      <p className="text-sm font-medium text-gray-600">{status}</p>
      {error && <p className="text-xs text-red-500">{error}</p>}
      
      <div className="flex space-x-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:0.2s]"></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
};

export default FaceAuth;
