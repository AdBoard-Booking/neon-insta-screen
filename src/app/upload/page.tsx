'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Instagram, User, CheckCircle, RotateCcw, MessageCircle, Upload, X } from 'lucide-react';
import Image from 'next/image';
import LoginDialog from '@/components/LoginDialog';
import { stackClientApp } from '@/stack/client';
import Link from 'next/link';
import { SignIn } from '@stackframe/stack';

export default function UploadPage() {
  const [formData, setFormData] = useState({
    name: '',
    instagramHandle: '',
    whatsappContact: '',
    image: null as File | null,
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [uploadMode, setUploadMode] = useState<'camera' | 'file'>('camera');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showReuploadMessage, setShowReuploadMessage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await stackClientApp.getUser();
        const isAuth = !!user;
        setIsAuthenticated(isAuth);
        
        // If user is authenticated and there's pending form data, show reupload message
        if (isAuth) {
          const pendingSubmission = localStorage.getItem('pendingSubmission');
          if (pendingSubmission) {
            try {
              const storedData = JSON.parse(pendingSubmission);
              // Restore form data (except image)
              setFormData(prev => ({
                ...prev,
                name: storedData.name || '',
                instagramHandle: storedData.instagramHandle || '',
                whatsappContact: storedData.whatsappContact || '',
                consent: storedData.consent || false,
              }));
              localStorage.removeItem('pendingSubmission');
              setShowReuploadMessage(true);
            } catch (error) {
              console.error('Error processing pending submission:', error);
              localStorage.removeItem('pendingSubmission');
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', // Use front camera for selfies
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please ensure camera permissions are granted.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
            setFormData(prev => ({ ...prev, image: file }));
            setIsCaptured(true);
            
            // Stop camera stream after capture
            if (cameraStream) {
              cameraStream.getTracks().forEach(track => track.stop());
              setCameraStream(null);
              setIsCameraActive(false);
            }
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const retakePhoto = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setIsCaptured(false);
    setIsCameraActive(false);
    // Don't automatically start camera, let user click button
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, image: file }));
      setIsCaptured(true);
    } else {
      alert('Please select a valid image file.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setIsCaptured(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const switchUploadMode = (mode: 'camera' | 'file') => {
    setUploadMode(mode);
    setFormData(prev => ({ ...prev, image: null }));
    setIsCaptured(false);
    setIsCameraActive(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.image || !formData.consent) {
      alert('Please fill in all required fields and accept the terms.');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store form data in localStorage for after login
      const formDataToStore = {
        ...formData,
        image: null, // Can't store File object in localStorage, will need to re-upload
      };
      localStorage.setItem('pendingSubmission', JSON.stringify(formDataToStore));
      setShowLoginDialog(true);
      return;
    }

    // Proceed with submission if authenticated
    await submitForm();
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('instagramHandle', formData.instagramHandle);
      submitData.append('whatsappContact', formData.whatsappContact);
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      submitData.append('source', 'web');
      submitData.append('consent', formData.consent.toString());

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          instagramHandle: '',
          whatsappContact: '',
          image: null,
          consent: false,
        });
        setIsCaptured(false);
        setIsCameraActive(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Don't automatically start camera, let user click button
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
         
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            {uploadMode === 'camera' ? (
              <Camera className="w-8 h-8 text-white" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {uploadMode === 'camera' ? 'Take Your Selfie' : 'Upload Your Photo'}
          </h1>
          <p className="text-gray-600">
            {uploadMode === 'camera' 
              ? 'Use your camera to take a selfie and see it on our billboard!'
              : 'Upload a photo from your device and see it on our billboard!'
            }
          </p>
        </div>

        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700">
              Your selfie has been submitted! We&apos;ll review it soon.
            </span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-700">
              Something went wrong. Please try again.
            </span>
          </div>
        )}

        {showReuploadMessage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="text-blue-700 font-medium">Welcome back!</p>
                <p className="text-blue-600 text-sm">
                  Your form data has been restored. Please upload your photo again to submit.
                </p>
              </div>
              <button
                onClick={() => setShowReuploadMessage(false)}
                className="ml-auto text-blue-500 hover:text-blue-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

       

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>

          

            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Handle (Optional)
            </label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="instagramHandle"
                name="instagramHandle"
                value={formData.instagramHandle}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="yourusername"
              />
            </div>
          </div>

          <div>
            <label htmlFor="whatsappContact" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Contact (Optional)
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="whatsappContact"
                name="whatsappContact"
                value={formData.whatsappContact}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="8558888888"
              />
            </div>
          </div>

           {/* Upload Mode Toggle */}
        <div className="mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => switchUploadMode('camera')}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
                uploadMode === 'camera'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </button>
            <button
              type="button"
              onClick={() => switchUploadMode('file')}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
                uploadMode === 'file'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </button>
          </div>
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {uploadMode === 'camera' ? 'Take Your Selfie *' : 'Upload Your Photo *'}
            </label>
            <div className="border-2 border-gray-300 rounded-lg p-4 text-center bg-gray-50">
              {uploadMode === 'camera' ? (
                // Camera Mode
                <>
                  {cameraError ? (
                    <div className="space-y-4">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-red-600">{cameraError}</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : isCaptured && formData.image ? (
                    <div className="space-y-4">
                      <Image
                        src={URL.createObjectURL(formData.image)}
                        alt="Captured selfie"
                        width={400}
                        height={300}
                        className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retake Photo
                      </button>
                    </div>
                  ) : isCameraActive ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Capture Selfie
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600 mb-4">
                        Click the button below to start your camera and take a selfie
                      </p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Start Camera
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // File Upload Mode
                <>
                  {isCaptured && formData.image ? (
                    <div className="space-y-4">
                      <Image
                        src={URL.createObjectURL(formData.image)}
                        alt="Uploaded photo"
                        width={400}
                        height={300}
                        className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                        unoptimized
                      />
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={removeFile}
                          className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Change Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                        isDragOver
                          ? 'border-purple-400 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">
                        Drag and drop your photo here, or click to select
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={formData.consent}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="consent" className="ml-2 text-sm text-gray-700">
              I consent to my selfie being displayed on the billboard and used for promotional purposes. *
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Submitting...' : uploadMode === 'camera' ? 'Submit Selfie' : 'Submit Photo'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center">
              Powered by
              <Link href={'https://www.adboardbooking.com'}>
            <Image
              src="https://ik.imagekit.io/teh6pz4rx/adboard-booking-web/AdBoardLogo/logo1.png"
              alt="AdBoard Logo"
              width={120}
              height={60}
              className="mx-auto"
              unoptimized
            />
            </Link>
          </div>

        {/* <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Or send your selfie via WhatsApp to{' '}
            <span className="font-medium text-purple-600">+1 (555) 123-4567</span>
          </p>
        </div> */}
      </div>

      {/* Login Dialog */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </div>
  );
}