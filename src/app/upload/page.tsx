'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Instagram, User, CheckCircle, RotateCcw, MessageCircle, Upload, X, Loader2, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import CelebrationOverlay from '@/components/CelebrationOverlay';

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
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [uploadMode, setUploadMode] = useState<'camera' | 'file'>('camera');
  const [isDragOver, setIsDragOver] = useState(false);
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

  // Phone verification functions
  const handleSendCode = async () => {
    if (!formData.whatsappContact) {
      alert('Please enter your WhatsApp contact');
      return;
    }

    setIsVerifying(true);
    
    try {
      const response = await fetch('/api/auth/phone/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.whatsappContact,
          submissionId: submissionId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsCodeSent(true);
        // Start cooldown timer (60 seconds)
        setResendCooldown(60);
        startCooldownTimer();
      } else {
        alert(result.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      alert('Failed to send verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!formData.whatsappContact) {
      alert('Please enter your WhatsApp contact');
      return;
    }

    if (resendCooldown > 0) {
      alert(`Please wait ${resendCooldown} seconds before requesting a new code`);
      return;
    }

    setIsResending(true);
    
    try {
      const response = await fetch('/api/auth/phone/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.whatsappContact,
          submissionId: submissionId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('New verification code sent successfully!');
        // Start cooldown timer (60 seconds)
        setResendCooldown(60);
        startCooldownTimer();
      } else {
        alert(result.error || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Error resending verification code:', error);
      alert('Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  const startCooldownTimer = () => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      alert('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    
    try {
      const response = await fetch('/api/auth/phone/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.whatsappContact,
          code: verificationCode,
          submissionId: submissionId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsAuthenticated(true);
        // Now create the actual submission after verification
        await createActualSubmission();
      } else {
        alert(result.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      alert('Failed to verify code');
    } finally {
      setIsVerifying(false);
    }
  };

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      // Cleanup any running timers when component unmounts
      setResendCooldown(0);
    };
  }, []);

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
    
    if (!formData.name || !formData.image || !formData.whatsappContact || !formData.consent) {
      alert('Please fill in all required fields and accept the terms.');
      return;
    }

    // First submit the form to get submission ID
    await submitForm();
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Generate a temporary submission ID for verification process
      const tempSubmissionId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSubmissionId(tempSubmissionId);
      
      // Now send verification code
      await handleSendCode();
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createActualSubmission = async () => {
    try {
      setIsSubmitting(true);
      setSubmitStatus('idle');
      setShowProgressDialog(true);

      // Step 1: Preparing submission
      setProgressMessage('Preparing your submission...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('instagramHandle', formData.instagramHandle);
      submitData.append('whatsappContact', formData.whatsappContact);
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      submitData.append('source', 'web');
      submitData.append('consent', formData.consent.toString());

      // Add authentication and terms acceptance to form data
      submitData.append('isAuthenticated', 'true');
      submitData.append('acceptTerms', 'true');

      // Step 2: Uploading image
      setProgressMessage('Uploading your image...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Processing submission
      setProgressMessage('Processing your submission...');
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        // Step 4: Success
        setProgressMessage('Submission successful! 🎉');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSubmitStatus('success');
        setShowProgressDialog(false);
        // Show celebration dialog
        setShowCelebration(true);
      } else {
        setProgressMessage('Submission failed. Please try again.');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSubmitStatus('error');
        setShowProgressDialog(false);
      }
    } catch (error) {
      console.error('Error creating submission:', error);
      setProgressMessage('An error occurred. Please try again.');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('error');
      setShowProgressDialog(false);
    }
  };


  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
         
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
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
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 font-semibold">
                Submission Successful! 🎉
              </span>
            </div>
            <p className="text-green-700 text-sm">
              Your selfie has been verified and submitted successfully! 
              We&apos;ll review it and notify you via WhatsApp once it&apos;s approved.
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-700">
              Something went wrong. Please try again.
            </span>
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="yourusername"
              />
            </div>
          </div>

          <div>
            <label htmlFor="whatsappContact" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Contact *
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="whatsappContact"
                name="whatsappContact"
                value={formData.whatsappContact}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1234567890"
                required
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
                  ? 'bg-white text-blue-600 shadow-sm'
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
                  ? 'bg-white text-blue-600 shadow-sm'
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg"
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
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg"
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
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                          ? 'border-blue-400 bg-blue-50'
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
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg"
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

          {/* Phone Verification Section */}
          {isCodeSent && !isAuthenticated && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-2">Verify Your WhatsApp Contact</h3>
              <p className="text-sm text-gray-600">
                We sent a verification code to {formData.whatsappContact}. Please enter the code below to complete your submission.
              </p>
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleVerifyCode}
                  disabled={!verificationCode || isVerifying}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Check className="w-4 h-4 mr-2" />
                      Verify Code
                    </div>
                  )}
                </button>
                
                <button
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isResending}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </div>
                  ) : resendCooldown > 0 ? (
                    `Resend Code (${resendCooldown}s)`
                  ) : (
                    'Resend Code'
                  )}
                </button>
                
                {resendCooldown > 0 && (
                  <p className="text-xs text-gray-500 text-center">
                    You can request a new code in {resendCooldown} seconds
                  </p>
                )}
              </div>
            </div>
          )}

          {isAuthenticated && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700 font-medium">WhatsApp contact verified successfully!</span>
              </div>
            </div>
          )}

          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={formData.consent}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="consent" className="ml-2 text-sm text-gray-700">
              I consent to my selfie being displayed on the billboard and used for promotional purposes. *
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isCodeSent || isAuthenticated}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending verification code...
              </div>
            ) : isCodeSent && !isAuthenticated ? (
              'Check your phone for verification code'
            ) : isAuthenticated ? (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verification Complete
              </div>
            ) : (
              uploadMode === 'camera' ? 'Verify & Submit Selfie' : 'Verify & Submit Photo'
            )}
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
            <span className="font-medium text-blue-600">+1 (555) 123-4567</span>
          </p>
        </div> */}
      </div>

      {/* Progress Dialog */}
      {showProgressDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mb-6">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Processing Submission
                </h3>
                <p className="text-gray-600">
                  {progressMessage}
                </p>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              
              <p className="text-sm text-gray-500">
                Please don&apos;t close this window...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Overlay */}
      <CelebrationOverlay
        isVisible={showCelebration}
        name={formData.name || 'You'}
        onComplete={handleCelebrationComplete}
      />

    </div>
  );
}