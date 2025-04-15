
import { useEffect, useState, useRef } from "react";
import { Instagram } from "lucide-react";
import PolaroidFrame from "./PolaroidFrame";
import NeonBubble from "./NeonBubble";
import QRCodeSection from "./QRCodeSection";
import { supabase } from "@/integrations/supabase/client";

interface InstagramPost {
  id: string;
  post_id: string;
  username: string;
  image_url: string;
  caption?: string;
  hashtags?: string[];
  created_at: string;
}

const BillboardScreen = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    window.innerHeight > window.innerWidth ? "portrait" : "landscape"
  );
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle orientation changes
  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape");
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Instagram posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Get posts from Supabase
        const { data, error } = await supabase
          .from('instagram_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching posts:', error);
          return;
        }

        if (data && data.length > 0) {
          setPosts(data);
        } else {
          // Trigger function to fetch posts if none exist
          try {
            // Call our edge function to fetch and store Instagram posts
            const response = await fetch('https://eclrnxqfpctsdmkxhhht.supabase.co/functions/v1/fetch-instagram-posts');
            
            if (!response.ok) {
              throw new Error('Failed to fetch Instagram posts');
            }
            
            // Try to fetch posts again after the function has run
            const { data: newData } = await supabase
              .from('instagram_posts')
              .select('*')
              .order('created_at', { ascending: false });
              
            if (newData && newData.length > 0) {
              setPosts(newData);
            }
          } catch (funcError) {
            console.error('Error calling fetch-instagram-posts function:', funcError);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setIsLoading(false);
      }
    };

    fetchPosts();

    // Set up realtime subscription for live updates
    const channel = supabase
      .channel('public:instagram_posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'instagram_posts' }, 
        (payload) => {
          console.log('Realtime update:', payload);
          fetchPosts(); // Re-fetch all posts when any change happens
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Cycle through posts for the display
  useEffect(() => {
    if (posts.length === 0) return;
    
    const interval = setInterval(() => {
      setActivePostIndex((prev) => (prev + 1) % posts.length);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 1000);
    }, 8000);

    return () => clearInterval(interval);
  }, [posts.length]);

  // Convert Supabase post to format expected by PolaroidFrame
  const formatPostForDisplay = (post: InstagramPost) => {
    return {
      id: post.id,
      imageUrl: post.image_url,
      username: post.username
    };
  };

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

          {/* Right Photo Display Section */}
          <div className={`${orientation === "portrait" ? "w-full" : "w-1/2"} flex justify-center items-center relative`}>
            {isLoading ? (
              <div className="relative bg-white rounded-md p-3 animate-pulse" style={{width: '320px', height: '400px'}}>
                <div className="h-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="relative">
                <PolaroidFrame 
                  post={formatPostForDisplay(posts[activePostIndex])} 
                  orientation={orientation}
                  key={posts[activePostIndex].id}
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
            ) : (
              <div className="bg-white rounded-md p-5 text-center">
                <p className="text-gray-800">No posts with #adboardbooking yet!</p>
                <p className="text-gray-600 text-sm mt-2">Be the first to post!</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with QR Code */}
        <QRCodeSection orientation={orientation} />
      </div>
    </div>
  );
};

export default BillboardScreen;
