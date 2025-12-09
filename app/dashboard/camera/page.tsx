"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError("");
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure you have granted permission.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setImage(null);
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-sea-sub-blue rounded-lg shadow-xl p-6 border border-sea-gold/20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-sea-gold mb-6 text-center">Take Photo</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6">
          {!image ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={image} 
              alt="Captured" 
              className="w-full h-full object-contain" 
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-center space-x-4">
          {!image ? (
            <button
              onClick={takePhoto}
              className="px-6 py-3 bg-sea-gold text-sea-blue font-bold rounded-full hover:bg-yellow-500 transition-colors shadow-lg flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Capture
            </button>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="px-6 py-3 bg-sea-gray text-sea-blue font-bold rounded-lg hover:bg-gray-400 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={() => alert("Feature coming soon: Process this image")}
                className="px-6 py-3 bg-sea-gold text-sea-blue font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-lg"
              >
                Use Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
