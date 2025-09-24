'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Heart, Share2, Users } from 'lucide-react';

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

interface FOMOBanner {
  id: string;
  name: string;
  message: string;
  timestamp: number;
}

export default function BillboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fomoBanner, setFomoBanner] = useState<FOMOBanner | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApprovedSubmissions();
    
    // Set up polling for new submissions
    const interval = setInterval(fetchApprovedSubmissions, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (submissions.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % submissions.length);
      }, 5000); // Change image every 5 seconds
      
      return () => clearInterval(timer);
    }
  }, [submissions]);

  const fetchApprovedSubmissions = async () => {
    try {
      const response = await fetch('/api/billboard/approved');
      const data = await response.json();
      
      if (data.submissions) {
        setSubmissions(data.submissions);
        setTotalCount(data.count);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setIsLoading(false);
    }
  };

  // Simulate FOMO banner (in real app, this would come from Socket.io)
  useEffect(() => {
    const simulateFOMO = () => {
      const names = ['Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      
      setFomoBanner({
        id: Date.now().toString(),
        name: randomName,
        message: `${randomName} just uploaded a selfie 👀`,
        timestamp: Date.now(),
      });

      // Hide banner after 3 seconds
      setTimeout(() => {
        setFomoBanner(null);
      }, 3000);
    };

    // Show FOMO banner every 30 seconds
    const fomoInterval = setInterval(simulateFOMO, 30000);
    
    return () => clearInterval(fomoInterval);
  }, []);

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

      {/* Main Content */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 text-white">
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

        {/* Main Display Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          {submissions.length > 0 ? (
            <div className="relative">
              <motion.div
                key={currentSubmission.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Framed Image */}
                <div className="relative">
                  <img
                    src={currentSubmission.framedImageUrl || currentSubmission.imageUrl}
                    alt={`${currentSubmission.name}'s selfie`}
                    className="w-96 h-96 object-cover rounded-2xl shadow-2xl"
                  />
                  
                  {/* Overlay with name and Instagram */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-2xl">
                    <div className="text-white">
                      <h3 className="text-2xl font-bold mb-1">{currentSubmission.name}</h3>
                      {currentSubmission.instagramHandle && (
                        <div className="flex items-center space-x-2">
                          <Instagram className="w-5 h-5" />
                          <span className="text-lg">@{currentSubmission.instagramHandle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                {currentIndex + 1} / {submissions.length}
              </div>
            </div>
          ) : (
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Instagram className="w-16 h-16" />
              </div>
              <h2 className="text-3xl font-bold mb-4">No selfies yet!</h2>
              <p className="text-xl opacity-90">
                Be the first to share your selfie!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-white/80">
          <p className="text-lg">
            Upload your selfie at <span className="font-bold">billboard.example.com/upload</span>
          </p>
          <p className="text-sm mt-2">
            Or send via WhatsApp to +1 (555) 123-4567
          </p>
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