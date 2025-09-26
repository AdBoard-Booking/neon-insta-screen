'use client';

import { useState } from 'react';
import CelebrationOverlay from '@/components/CelebrationOverlay';

export default function TestCelebrationPage() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [testName, setTestName] = useState('John Doe');

  const triggerCelebration = () => {
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white space-y-6">
        <h1 className="text-4xl font-bold mb-8">Celebration Test Page</h1>
        
        <div className="space-y-4">
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Enter a name"
            className="px-4 py-2 rounded-lg text-black"
          />
          
          <button
            onClick={triggerCelebration}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors"
          >
            Trigger Celebration
          </button>
        </div>

        <p className="text-gray-300">
          This will show the celebration overlay that appears when someone uploads a new image.
        </p>
      </div>

      <CelebrationOverlay
        isVisible={showCelebration}
        name={testName}
        onComplete={handleCelebrationComplete}
      />
    </div>
  );
}
