'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Heart, Share2, Users, QrCode } from 'lucide-react';
import { useFOMOBanner, useBillboardUpdates } from '@/lib/useSocket';
import { usePageUnloadCleanup } from '@/lib/socket-cleanup';
import QRCode from 'qrcode';
import CelebrationOverlay from '@/components/CelebrationOverlay';

interface Submission {
  id: string;
  name: string;
  instagramHandle?: string;
  imageUrl: string;
  framedImageUrl?: string;
  status: 'approved';
  source: 'whatsapp' | 'web';
  createdAt: string;
  approvedAt?: string;
}

export default function BillboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationName, setCelebrationName] = useState('');
  const fomoBanner = useFOMOBanner();
  const { shouldRefresh, setShouldRefresh } = useBillboardUpdates();
  
  // Setup page unload cleanup
  usePageUnloadCleanup();

  useEffect(() => {
    fetchApprovedSubmissions();
  }, []);

  // Handle refresh when socket events are received
  useEffect(() => {
    console.log('shouldRefresh changed to:', shouldRefresh);
    if (shouldRefresh) {
      console.log('Refreshing submissions due to socket event');
      fetchApprovedSubmissions();
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  // Handle celebration when FOMO banner shows new upload
  useEffect(() => {
    if (fomoBanner) {
      setCelebrationName(fomoBanner.name);
      setShowCelebration(true);
    }
  }, [fomoBanner]);

  useEffect(() => {
    // Generate QR code for upload page - only once
    const generateQRCode = async () => {
      try {
        const uploadUrl = `${window.location.origin}/upload`;
        const qrCodeDataUrl = await QRCode.toDataURL(uploadUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    // Only generate QR code if not already generated
    if (!qrCodeUrl) {
      generateQRCode();
    }
  }, [qrCodeUrl]);

  useEffect(() => {
    if (submissions.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % submissions.length);
      }, 10000); // Change image every 5 seconds
      
      return () => clearInterval(timer);
    }
  }, [submissions]);

  const fetchApprovedSubmissions = async () => {
    try {
      console.log('Fetching approved submissions...');
      const response = await fetch('/api/billboard/approved');
      const data = await response.json();
      
      console.log('Fetched data:', data);
      if (data.submissions) {
        console.log('Setting submissions:', data.submissions.length);
        setSubmissions(data.submissions);
        setTotalCount(data.count);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading billboard...</p>
        </div>
      </div>
    );
  }

  const currentSubmission = submissions[currentIndex];

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Celebration Overlay */}
      <CelebrationOverlay
        isVisible={showCelebration}
        name={celebrationName}
        onComplete={() => setShowCelebration(false)}
      />

      {/* FOMO Banner */}
      <AnimatePresence>
        {fomoBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold"
            >
              {fomoBanner.message}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout - Split into 2/3 left and 1/3 right */}
      <div className="h-full flex">
        {/* Left Side - 2/3 width - Main Billboard Content */}
        <div className="w-2/3 h-screen relative p-8">
          {/* Header - Outside Frame */}
          <div className="absolute top-8 left-8 right-8 z-20">
            <div className="flex justify-between items-center text-white">
              <div>
                <h1 className="text-4xl font-bold">#MyBillboardMoment</h1>
                <p className="text-xl opacity-90">Live Selfie Wall</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-2xl font-bold">
                  <Users className="w-8 h-8" />
                  <span>{totalCount}</span>
                </div>
                <p className="text-sm opacity-90">selfies today</p>
              </div>
            </div>
          </div>

          {/* Content Layout - Side by Side */}
          <div className="flex h-full pt-0">
            {/* Left Content Area */}
            <div className="w-1/3 pr-6 flex flex-col justify-center">
              <div className="text-white space-y-8">
               

                {/* Stats and Info */}
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <h3 className="text-2xl font-bold mb-4">
                      Only {10 - totalCount} FREE spots left for today.
                    </h3>
                    
                  </div>

                  {/* Current User Info */}
                  {submissions.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4">Now Showing</h3>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-bold text-pink-300">{currentSubmission.name}</h4>
                        {currentSubmission.instagramHandle && (
                          <div className="flex items-center space-x-2">
                            <Instagram className="w-5 h-5" />
                            <span className="text-lg">@{currentSubmission.instagramHandle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                
                </div>
              </div>
            </div>

            <div className="w-2/3 flex h-full justify-center">
  {submissions.length > 0 ? (
    <div className="relative h-full flex items-center justify-center">
      <motion.div
        key={currentSubmission.id}
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative h-full inline-block"
      >
        {/* Instagram Style Frame - shrink to image width */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col w-fit">
          
          {/* Top Section - Profile Info */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              {/* Profile Picture */}
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300">
                <img
                  src={currentSubmission.framedImageUrl || currentSubmission.imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Username */}
              <div>
                <h3 className="font-semibold text-gray-900">{currentSubmission.name}</h3>
                {currentSubmission.instagramHandle && (
                  <p className="text-sm text-gray-600">@{currentSubmission.instagramHandle}</p>
                )}
              </div>
            </div>
            {/* Options Menu */}
            <div className="text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>
          </div>

          {/* Main Image Area - No horizontal padding */}
          <div className="block">
            <img
              src={currentSubmission.framedImageUrl || currentSubmission.imageUrl}
              alt={`${currentSubmission.name}'s selfie`}
              className="block object-contain"
              style={{ width: "auto", height: "auto" , maxHeight: "calc(100vh - 190px)"}}
            />
          </div>

          {/* Bottom Section - Interaction Buttons */}
          <div className="px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                {/* Like Button */}
                <button className="text-red-500 hover:text-red-600 transition-colors">
                  <Heart className="w-6 h-6 fill-current" />
                </button>
                {/* Comment Button */}
                <button className="text-gray-600 hover:text-gray-800 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </button>
                {/* Share Button */}
                <button className="text-gray-600 hover:text-gray-800 transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              {/* Save Button */}
              <button className="text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Image Counter - Outside Frame */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full">
          {currentIndex + 1} / {submissions.length}
        </div>
      </motion.div>
    </div>
  ) : (
    <div className="text-center text-white flex items-center justify-center h-full">
      <div>
        <div className=" h-80 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
          <Instagram className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold mb-4">No selfies yet!</h2>
        <p className="text-xl opacity-90">Be the first to share your selfie!</p>
      </div>
    </div>
  )}
</div>


          </div>
        </div>

        {/* Right Side - 1/3 width - QR Code Section */}
        <div className="w-1/3 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-800/30 to-indigo-800/30 border-l border-white/10 relative">
          <div className="text-center text-white flex flex-col items-center justify-center h-full">
            <QrCode className="w-16 h-16 mx-auto mb-6 text-white/80" />
            <h2 className="text-3xl font-bold mb-4">Scan to Upload</h2>
            <p className="text-lg mb-8 opacity-90">
              Share your selfie and join the billboard!
            </p>
            
            <div className="flex-1 flex items-center justify-center">
              {qrCodeUrl ? (
                <div className="bg-white p-4 rounded-2xl shadow-2xl">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code to upload page" 
                    className="w-64 h-64"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-white/10 rounded-2xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <div className="text-sm opacity-80 mt-6">
              <p>Point your camera at the QR code</p>
              <p className="mt-1">or visit: <span className="font-mono text-xs break-all">{typeof window !== 'undefined' ? window.location.origin : ''}/upload</span></p>
            </div>
          </div>

          {/* Powered by Logo - Bottom Right */}
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-white/70 text-sm">
            <span>Powered by</span>
            <img 
              src="https://ik.imagekit.io/teh6pz4rx/adboard-booking-web/AdBoardLogo/logo2.png"
              alt="AdBoard Logo"
              className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>

      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
}