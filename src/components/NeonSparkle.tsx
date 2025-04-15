
import { FC } from "react";

interface NeonSparkleProps {
  color: "pink" | "blue" | "purple";
  size: number;
  delay: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

const NeonSparkle: FC<NeonSparkleProps> = ({ 
  color, 
  size, 
  delay, 
  top, 
  left, 
  right, 
  bottom 
}) => {
  const colorClasses = {
    pink: "bg-neon-pink",
    blue: "bg-neon-blue",
    purple: "bg-neon-purple"
  };

  const shadowColors = {
    pink: "0 0 10px rgba(255, 0, 255, 0.7), 0 0 20px rgba(255, 0, 255, 0.3)",
    blue: "0 0 10px rgba(51, 195, 240, 0.7), 0 0 20px rgba(51, 195, 240, 0.3)",
    purple: "0 0 10px rgba(155, 135, 245, 0.7), 0 0 20px rgba(155, 135, 245, 0.3)"
  };

  return (
    <div 
      className={`absolute ${colorClasses[color]} rounded-full animate-sparkle z-10`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        top: top,
        left: left,
        right: right,
        bottom: bottom,
        boxShadow: shadowColors[color],
        animationDelay: `${delay}s`
      }}
    />
  );
};

export default NeonSparkle;
