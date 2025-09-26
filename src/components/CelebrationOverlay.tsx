'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, Heart, Star } from 'lucide-react';

interface CelebrationOverlayProps {
  isVisible: boolean;
  name: string;
  onComplete: () => void;
}

const celebrationMessages = [
  {
    title: "🎉 WOW! 🎉",
    subtitle: "just uploaded!",
    description: "Their selfie is now on the big screen!",
    cta: "Don't miss out! 📸",
    subCta: "Upload your selfie and join the fun!"
  },
  {
    title: "🔥 AMAZING! 🔥",
    subtitle: "just joined the party!",
    description: "They're trending on the billboard!",
    cta: "Be next! 📱",
    subCta: "Share your moment with everyone!"
  },
  {
    title: "✨ INCREDIBLE! ✨",
    subtitle: "just shared their story!",
    description: "Now it's your turn to shine!",
    cta: "Join the fun! 🎊",
    subCta: "Don't let this moment pass you by!"
  }
];

export default function CelebrationOverlay({ isVisible, name, onComplete }: CelebrationOverlayProps) {
  const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 pointer-events-none"
          onAnimationComplete={() => {
            setTimeout(onComplete, 3000);
          }}
        >
          {/* Background overlay with gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20"
          />

          {/* Main celebration content */}
          <div className="relative h-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                duration: 0.8
              }}
              className="text-center text-white"
            >
              {/* Celebration text */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-8"
              >
                <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {randomMessage.title}
                </h1>
                <h2 className="text-4xl md:text-6xl font-bold mb-2">
                  {name} {randomMessage.subtitle}
                </h2>
                <p className="text-2xl md:text-3xl opacity-90">
                  {randomMessage.description}
                </p>
              </motion.div>

              {/* Call to action */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="space-y-4"
              >
                <div className="text-3xl md:text-4xl font-bold">
                  {randomMessage.cta}
                </div>
                <div className="text-xl md:text-2xl opacity-90">
                  {randomMessage.subCta}
                </div>
                <div className="flex items-center justify-center space-x-4 text-lg">
                  <span>Scan the QR code →</span>
                  <Camera className="w-8 h-8 animate-bounce" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Floating particles - reduced count for memory efficiency */}
          {[...Array(8)].map((_, i) => {
            const initialX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200);
            const initialY = Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800);
            return (
              <motion.div
                key={i}
                initial={{ 
                  x: initialX,
                  y: initialY,
                  scale: 0,
                  rotate: 0
                }}
                animate={{ 
                  x: initialX + (Math.random() - 0.5) * 200,
                  y: initialY + (Math.random() - 0.5) * 200,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2
                }}
                className="absolute text-yellow-400"
              >
                {i % 3 === 0 ? <Sparkles className="w-6 h-6" /> : 
                 i % 3 === 1 ? <Heart className="w-6 h-6 text-pink-400" /> : 
                 <Star className="w-6 h-6 text-purple-400" />}
              </motion.div>
            );
          })}

          {/* Pulsing rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ 
                scale: [0, 1.5, 2],
                opacity: [0.8, 0.4, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-96 h-96 border-4 border-pink-400 rounded-full" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
