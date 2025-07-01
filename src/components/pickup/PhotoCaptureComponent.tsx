
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, RotateCcw } from 'lucide-react';

interface PhotoCaptureComponentProps {
  onCapture: (photoData: string) => void;
}

const PhotoCaptureComponent: React.FC<PhotoCaptureComponentProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCamera, setIsCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    
    setCapturedPhoto(photoData);
    onCapture(photoData);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const photoData = event.target?.result as string;
      setCapturedPhoto(photoData);
      onCapture(photoData);
    };
    reader.readAsDataURL(file);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {capturedPhoto ? (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <img 
              src={capturedPhoto} 
              alt="Captured ID" 
              className="w-full h-48 object-cover"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={retakePhoto}
            className="flex items-center gap-2 w-full"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Photo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {isCamera ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="flex items-center gap-2 flex-1"
                >
                  <Camera className="h-4 w-4" />
                  Capture Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={stopCamera}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">Take a photo of the ID or upload from device</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={startCamera}
                  className="flex items-center gap-2 flex-1"
                >
                  <Camera className="h-4 w-4" />
                  Use Camera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 flex-1"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoCaptureComponent;
