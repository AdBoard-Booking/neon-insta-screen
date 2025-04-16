import { FC, useEffect, useState } from "react";
import NeonSparkle from "./NeonSparkle";

interface Post {
  id: string | number;
  imageUrl: string;
  username: string;
  caption?: string;
}

interface PolaroidFrameProps {
  post: Post;
  orientation: "portrait" | "landscape";
}

const PolaroidFrame: FC<PolaroidFrameProps> = ({ post, orientation }) => {
  const [isFlipping, setIsFlipping] = useState(true);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 500) + 100);
  
  useEffect(() => {
    setIsFlipping(true);
    setLikes(Math.floor(Math.random() * 500) + 100);
    const timer = setTimeout(() => setIsFlipping(false), 1000);
    return () => clearTimeout(timer);
  }, [post.id]);

  // Increased frame size based on orientation
  const frameSize = orientation === "portrait" ? "w-80 h-96" : "w-96 h-108";

  // Format caption to keep it reasonably short
  const formatCaption = (caption?: string) => {
    if (!caption) return "#adboardbooking";
    return caption.length > 100 ? caption.substring(0, 97) + '...' : caption;
  };

  return (
    <div 
      className={`${frameSize} bg-white rounded-md relative ${isFlipping ? "animate-flip" : ""} p-3 transform transition-all duration-300 hover:scale-[1.02]`}
      style={{
        boxShadow: "0 0 20px rgba(155, 135, 245, 0.5), 0 0 30px rgba(51, 195, 240, 0.3)"
      }}
    >
      {/* Sparkle effects */}
      <NeonSparkle color="pink" size={12} delay={0.5} top="-15px" right="-10px" />
      <NeonSparkle color="blue" size={10} delay={1.2} bottom="-10px" left="-8px" />
      <NeonSparkle color="purple" size={8} delay={1.8} top="50%" right="-12px" />
      <NeonSparkle color="pink" size={7} delay={0.8} top="20%" left="-10px" />
      <NeonSparkle color="blue" size={9} delay={2.2} bottom="30%" right="-8px" />
      
      {/* Corner dots */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-neon-pink rounded-full" />
      <div className="absolute top-2 left-2 w-2 h-2 bg-neon-blue rounded-full" />
      <div className="absolute bottom-2 right-2 w-2 h-2 bg-neon-purple rounded-full" />
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-neon-pink rounded-full" />
      
      {/* Image container with Instagram-style frame - Made bigger */}
      <div className="w-full h-[75%] overflow-hidden rounded mb-2 border-2 border-gray-100">
        <img 
          src={post.imageUrl} 
          alt="Instagram post" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Username and date */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 mr-1.5"></div>
          <span className="text-gray-800 font-medium text-sm">{post.username}</span>
        </div>
        <span className="text-gray-500 text-xs">Just now</span>
      </div>
      
      {/* Instagram-like stats */}
      <div className="flex justify-between items-center mt-1.5 px-1">
        <div className="flex space-x-3">
          <span className="text-red-500">❤️</span>
          <span>💬</span>
          <span>🔄</span>
        </div>
        <span className="text-xs text-gray-600 font-medium">{likes} likes</span>
      </div>
      
      {/* Caption or hashtag */}
      <div className="mt-1 px-1 text-xs text-gray-700 truncate">
        {formatCaption(post.caption)}
      </div>
    </div>
  );
};

export default PolaroidFrame;
