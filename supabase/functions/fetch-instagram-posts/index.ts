
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This is a mock function since we can't directly access Instagram's API without an approved app
const mockFetchInstagramPosts = async () => {
  // In a real implementation, you would call the Instagram Graph API here
  return [
    { 
      id: "post1", 
      username: "@sarah_j",
      image_url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
      caption: "Having a great day! #adboardbooking",
      hashtags: ["adboardbooking", "fun"]
    },
    { 
      id: "post2", 
      username: "@mike_hills",
      image_url: "https://images.unsplash.com/photo-1521146764736-56c929d59c83",
      caption: "Check out this view! #adboardbooking #citylife",
      hashtags: ["adboardbooking", "citylife"]
    },
    { 
      id: "post3", 
      username: "@tanya_m",
      image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      caption: "New profile pic! #adboardbooking #selfie",
      hashtags: ["adboardbooking", "selfie"]
    },
    { 
      id: "post4", 
      username: "@daniel_k",
      image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
      caption: "Beach day! #summer #adboardbooking",
      hashtags: ["summer", "adboardbooking"]
    },
    { 
      id: "post5", 
      username: "@jessica_r",
      image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      caption: "Feeling good! #adboardbooking #happy",
      hashtags: ["adboardbooking", "happy"]
    }
  ]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client
    const supabaseUrl = "https://eclrnxqfpctsdmkxhhht.supabase.co"
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbHJueHFmcGN0c2Rta3hoaGh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTUzNzAsImV4cCI6MjA2MDI5MTM3MH0.tzCC7qEakPK_hVWjRVFVHyfut3x5N9p5JOUBR6bjU1o"
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch Instagram posts (mock implementation)
    const posts = await mockFetchInstagramPosts()
    
    // Store posts in Supabase
    for (const post of posts) {
      const { error } = await supabase
        .from('instagram_posts')
        .upsert(
          { 
            post_id: post.id,
            username: post.username,
            image_url: post.image_url,
            caption: post.caption,
            hashtags: post.hashtags
          }, 
          { onConflict: 'post_id' }
        )
      
      if (error) {
        console.error('Error inserting post:', error)
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: posts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})
