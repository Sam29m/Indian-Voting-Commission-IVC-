import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import api from '../api/axios';
import './FaceCapture.css';

export default function FaceCapture({ onRegistered, onDisabled, isEnabled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState(isEnabled ? 'registered' : 'idle');
  const intervalRef = useRef(null);

  // Load face-api models
  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ]);
      setModelsLoaded(true);
    } catch (err) {
      setError('Failed to load face recognition models');
    } finally {
      setLoading(false);
    }
  }, []);

  const startCamera = async () => {
    try {
      if (!modelsLoaded) await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        setStep('capture');
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStreaming(false);
    setFaceDetected(false);
  };

  // Real-time face detection overlay
  useEffect(() => {
    if (!streaming || !modelsLoaded) return;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      const canvas = canvasRef.current;
      const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        setFaceDetected(true);
        const resized = faceapi.resizeResults(detection, displaySize);
        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceLandmarks(canvas, resized);
      } else {
        setFaceDetected(false);
      }
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [streaming, modelsLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !faceDetected) return;
    setLoading(true);
    setError(null);

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('No face detected. Please position your face in the frame.');
        setLoading(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      await api.post('/auth/face/register', { descriptor });

      setSuccess('Face registered successfully!');
      setStep('registered');
      stopCamera();
      onRegistered?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register face');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/face/disable');
      setStep('idle');
      setSuccess('Face authentication disabled');
      onDisabled?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="face-setup" id="face-setup">
      <div className="face-header">
        <div className="face-icon">👤</div>
        <div>
          <h3>Face Recognition</h3>
          <p className="face-desc">Biometric authentication via webcam</p>
        </div>
        {step === 'registered' && <span className="face-badge-on">Active</span>}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {step === 'idle' && (
        <button className="btn btn-primary" onClick={startCamera} disabled={loading} id="btn-enable-face">
          {loading ? 'Loading models...' : 'Enable Face Auth'}
        </button>
      )}

      {step === 'capture' && (
        <div className="face-capture-section animate-fade-in-scale">
          <p className="face-instruction">
            Position your face in the frame{' '}
            {faceDetected ? <span className="face-ok">— Face detected ✓</span> : <span className="face-searching">— Searching...</span>}
          </p>
          <div className="face-video-container">
            <video ref={videoRef} autoPlay muted playsInline className="face-video" />
            <canvas ref={canvasRef} className="face-canvas" />
            {!faceDetected && <div className="face-guide" />}
          </div>
          <div className="face-actions">
            <button
              className="btn btn-primary"
              onClick={handleCapture}
              disabled={!faceDetected || loading}
              id="btn-capture-face"
            >
              {loading ? '📸 Capturing...' : '📸 Capture & Register'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={stopCamera}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'registered' && (
        <div className="face-registered-section">
          <div className="face-status-active">
            <span className="face-check">✓</span>
            Face authentication is active
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleDisable} disabled={loading} id="btn-disable-face">
            Disable Face Auth
          </button>
        </div>
      )}
    </div>
  );
}
