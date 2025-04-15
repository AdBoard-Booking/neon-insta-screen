
import { useEffect, useState, useRef } from "react";
import { Instagram } from "lucide-react";
import PolaroidFrame from "./PolaroidFrame";
import NeonBubble from "./NeonBubble";
import QRCodeSection from "./QRCodeSection";

// Mock Instagram posts - in a real application, these would come from an API
const mockPosts = [
  { id: 1, imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e", username: "@sarah_j" },
  { id: 2, imageUrl: "https://images.unsplash.com/photo-1521146764736-56c929d59c83", username: "@mike_hills" },
  { id: 3, imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb", username: "@tanya_m" },
  { id: 4, imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d", username: "@daniel_k" },
  { id: 5, imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9", username: "@jessica_r" },
];

const BillboardScreen = () => {
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    window.innerHeight > window.innerWidth ? "portrait" : "landscape"
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle orientation changes
  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape");
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cycle through posts more frequently to simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePostIndex((prev) => (prev + 1) % mockPosts.length);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 1000);
    }, 8000); // Changed from 10000 to 8000 for more frequent updates

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-neon-darkPurple font-poppins"
    >
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/50" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: 'linear-gradient(#9b87f5 1px, transparent 1px), linear-gradient(to right, #9b87f5 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />
      
      {/* Bubbles Background Effect */}
      {Array.from({ length: 20 }).map((_, i) => (
        <NeonBubble key={i} />
      ))}

      <div className={`relative z-10 h-full w-full flex flex-col items-center justify-between p-4 ${orientation === "portrait" ? "py-8" : "py-4 px-8"}`}>
        {/* Header with Instagram Logo */}
        <div className="flex items-center justify-center mb-2 mt-2">
          <Instagram className="w-10 h-10 text-white animate-glow filter drop-shadow-[var(--neon-purple-glow)]" />
          <h1 className="text-white text-4xl font-bold ml-3 tracking-wider animate-glow">
            <span className="text-neon-pink drop-shadow-[var(--neon-pink-glow)]">Insta</span>
            <span className="text-neon-blue drop-shadow-[var(--neon-blue-glow)]">Selfie</span>
          </h1>
        </div>

        {/* Main Content Area */}
        <div className={`flex ${orientation === "portrait" ? "flex-col" : "flex-row"} items-center justify-center w-full gap-4 flex-1`}>
          {/* Left Text Section */}
          <div className={`${orientation === "portrait" ? "mb-4 text-center" : "w-1/2 text-left"}`}>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white animate-float">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-white to-neon-blue">
                  ✨ Wanna See Yourself Here? ✨
                </span>
              </h2>
              
              <div className="space-y-2 mt-4 text-xl md:text-2xl text-white">
                <p className={`flex items-center ${orientation === "portrait" ? "justify-center" : "justify-start"} gap-2`}>
                  <span className="text-3xl">📸</span>
                  <span>Post a Selfie on Instagram</span>
                </p>
                <p className={`flex items-center ${orientation === "portrait" ? "justify-center" : "justify-start"} gap-2`}>
                  <span className="text-3xl">🧡</span>
                  <span>Use Hashtag: <span className="text-neon-blue font-bold drop-shadow-[var(--neon-blue-glow)]">#adboardbooking</span></span>
                </p>
                <p className={`flex items-center ${orientation === "portrait" ? "justify-center" : "justify-start"} gap-2 mt-2`}>
                  <span className="text-3xl">🎉</span>
                  <span>You Might Just Go <span className="text-neon-pink font-bold text-3xl drop-shadow-[var(--neon-pink-glow)]">BIG!</span></span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Photo Display Section - Made bigger */}
          <div className={`${orientation === "portrait" ? "w-full" : "w-1/2"} flex justify-center items-center relative`}>
            <div className="relative">
              <PolaroidFrame 
                post={mockPosts[activePostIndex]} 
                orientation={orientation}
                key={activePostIndex}
              />
              
              {/* Flash effect when new post appears */}
              {showFlash && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-30 animate-flash z-20 rounded-xl">
                  <span className="text-4xl font-bold text-neon-pink drop-shadow-[var(--neon-pink-glow)]">
                    🔥 You're On!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with QR Code */}
        <QRCodeSection orientation={orientation} />
      </div>
    </div>
  );
};

export default BillboardScreen;
