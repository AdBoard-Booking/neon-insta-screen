
import { useState } from "react";

const NeonBubble = () => {
  const [config] = useState(() => {
    // Random properties for each bubble
    const size = Math.random() * 60 + 20; // 20-80px
    
    const colors = [
      {
        bg: "bg-neon-pink",
        boxShadow: "0 0 15px rgba(255, 0, 255, 0.4), 0 0 30px rgba(255, 0, 255, 0.2)",
      },
      {
        bg: "bg-neon-blue",
        boxShadow: "0 0 15px rgba(51, 195, 240, 0.4), 0 0 30px rgba(51, 195, 240, 0.2)",
      },
      {
        bg: "bg-neon-purple",
        boxShadow: "0 0 15px rgba(155, 135, 245, 0.4), 0 0 30px rgba(155, 135, 245, 0.2)",
      }
    ];
    
    const colorIndex = Math.floor(Math.random() * 3);
    const left = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 15}s`;
    const animationDuration = `${Math.random() * 10 + 10}s`; // 10-20 seconds
    const opacity = Math.random() * 0.2 + 0.05; // Low opacity between 0.05-0.25
    
    return { 
      size, 
      bg: colors[colorIndex].bg, 
      boxShadow: colors[colorIndex].boxShadow,
      left, 
      animationDelay, 
      animationDuration,
      opacity
    };
  });

  return (
    <div 
      className={`absolute rounded-full ${config.bg} backdrop-blur-sm`}
      style={{
        width: `${config.size}px`,
        height: `${config.size}px`,
        left: config.left,
        bottom: '-20px',
        opacity: config.opacity,
        boxShadow: config.boxShadow,
        filter: "blur(2px)",
        animationDelay: config.animationDelay,
        animationDuration: config.animationDuration,
        animation: `bubble-float ${config.animationDuration} linear infinite`,
      }}
    />
  );
};

export default NeonBubble;
