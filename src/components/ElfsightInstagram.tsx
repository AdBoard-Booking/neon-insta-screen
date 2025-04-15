
import { FC, useEffect, useRef } from "react";

interface ElfsightInstagramProps {
  className?: string;
}

const ElfsightInstagram: FC<ElfsightInstagramProps> = ({ className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Elfsight script
    const script = document.createElement('script');
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <div className="elfsight-app-2e175b09-93ef-4abd-91bb-a733ee15e466" data-elfsight-app-lazy></div>
    </div>
  );
};

export default ElfsightInstagram;
