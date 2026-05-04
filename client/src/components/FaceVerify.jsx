import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import './FaceVerify.css';

export default function FaceVerify({ onVerify, loading: externalLoading, error: externalError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [matching, setMatching] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const intervalRef = useRef(null);

  const loadModels = useCallback(async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ]);
      setModelsLoaded(true);
    } catch {
      // Models may already be loaded
      setModelsLoaded(true);
    } finally {
      setLoadingModels(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch {
      // Camera error handled by parent
    }
  }, []);

  useEffect(() => {
    loadModels().then(() => startCamera());
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadModels, startCamera]);

  // Real-time detection + auto-capture
  useEffect(() => {
    if (!streaming || !modelsLoaded) return;

    let attemptCount = 0;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || matching) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      const canvas = canvasRef.current;
      const displaySize = { width: 320, height: 240 };
      faceapi.matchDimensions(canvas, displaySize);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        setFaceDetected(true);
        const resized = faceapi.resizeResults(detection, displaySize);
        faceapi.draw.drawDetections(canvas, resized);

        attemptCount++;
        // Auto-verify after detecting face for 3 consecutive frames
        if (attemptCount >= 3 && !matching) {
          setMatching(true);
          clearInterval(intervalRef.current);
          const descriptor = Array.from(detection.descriptor);
          onVerify(descriptor);
        }
      } else {
        setFaceDetected(false);
        attemptCount = 0;
      }
    }, 300);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [streaming, modelsLoaded, matching, onVerify]);

  return (
    <div className="face-verify animate-fade-in-scale" id="face-verify-step">
      <div className="face-verify-icon">👤</div>
      <h2>Face Recognition</h2>
      <p className="face-verify-desc">
        {loadingModels
          ? 'Loading face recognition models...'
          : matching || externalLoading
          ? 'Verifying your identity...'
          : faceDetected
          ? 'Face detected — verifying...'
          : 'Position your face in the camera'}
      </p>

      {externalError && <div className="alert alert-error">⚠️ {externalError}</div>}

      <div className="face-verify-container">
        <video ref={videoRef} autoPlay muted playsInline className="face-verify-video" />
        <canvas ref={canvasRef} className="face-verify-canvas" />
        <div className={`face-verify-ring ${faceDetected ? 'ring-detected' : ''} ${matching ? 'ring-matching' : ''}`} />
        {loadingModels && <div className="face-verify-loading"><div className="spinner" /></div>}
      </div>

      {(matching || externalLoading) && (
        <div className="face-matching-indicator">
          <span className="spinner-sm" /> Matching face...
        </div>
      )}
    </div>
  );
}
