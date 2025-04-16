
import { FC } from "react";
import { Instagram } from "lucide-react";

interface QRCodeSectionProps {
  orientation: "portrait" | "landscape";
}

const QRCodeSection: FC<QRCodeSectionProps> = ({ orientation }) => {
  return (
    <div className={`text-center ${orientation === "portrait" ? "mt-4" : "mt-2"}`}>
      <div className="flex flex-col items-center">
        <div 
          className="bg-white p-3 rounded-xl relative overflow-hidden transform transition-transform hover:scale-105"
          style={{
            boxShadow: "0 0 15px rgba(155, 135, 245, 0.3), 0 0 30px rgba(51, 195, 240, 0.2)"
          }}
        >
          {/* QR Code with custom styling */}
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <div className="absolute inset-0 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://instagram.com')] bg-contain bg-no-repeat bg-center" />
            
            {/* Instagram logo overlay in center */}
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-1">
                <Instagram size={16} className="text-pink-500" />
              </div>
            </div> */}
          </div>
          
          {/* Neon corner accents with glowing effect */}
          <div 
            className="absolute top-0 left-0 w-3 h-3 bg-neon-pink rounded-tl-lg animate-glow" 
            style={{ filter: "drop-shadow(0 0 3px rgba(255, 0, 255, 0.8))" }}
          />
          <div 
            className="absolute top-0 right-0 w-3 h-3 bg-neon-blue rounded-tr-lg animate-glow" 
            style={{ filter: "drop-shadow(0 0 3px rgba(51, 195, 240, 0.8))", animationDelay: "0.5s" }}
          />
          <div 
            className="absolute bottom-0 left-0 w-3 h-3 bg-neon-blue rounded-bl-lg animate-glow" 
            style={{ filter: "drop-shadow(0 0 3px rgba(51, 195, 240, 0.8))", animationDelay: "1s" }}
          />
          <div 
            className="absolute bottom-0 right-0 w-3 h-3 bg-neon-pink rounded-br-lg animate-glow" 
            style={{ filter: "drop-shadow(0 0 3px rgba(255, 0, 255, 0.8))", animationDelay: "1.5s" }}
          />
        </div>
        
        <p className="text-white text-lg mt-2 font-medium">
          <span className="inline-block animate-pulse mr-1">👀</span> 
          <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.7)]">Scan now</span>
        </p>
      </div>
    </div>
  );
};

export default QRCodeSection;
