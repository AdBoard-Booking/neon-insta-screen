
// Follow this setup guide to integrate the Deno Supabase bindings & client:
// https://deno.com/blog/supabase-deno-bindings
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const INSTAGRAM_API_URL = 'https://workflow.adboardbooking.com/webhook/45f3be98-f290-4e6a-b140-b8b417132f41?type=recent_media&hashtag=adboardbooking';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Fetch from Instagram API
    console.log('Fetching Instagram posts from:', INSTAGRAM_API_URL);
    const response = await fetch(INSTAGRAM_API_URL);
    
    if (!response.ok) {
      console.error('Failed to fetch from Instagram API:', response.statusText);
      throw new Error(`Failed to fetch from Instagram API: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Instagram API response:', JSON.stringify(data).substring(0, 200) + '...');
    
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error('Invalid response format from Instagram API');
      throw new Error('Invalid response format from Instagram API');
    }

    // Process and store posts in the database
    const posts = data.data.map(post => ({
      post_id: post.id,
      username: 'adboardbooking', // Using default since API doesn't provide username
      image_url: post.media_url,
      caption: post.caption || '',
      hashtags: extractHashtags(post.caption || ''),
      created_at: post.timestamp
    }));

    console.log(`Processing ${posts.length} Instagram posts`);

    // Upsert posts to database (insert if not exists, update if exists)
    if (posts.length > 0) {
      const { error } = await supabaseClient
        .from('instagram_posts')
        .upsert(posts, { 
          onConflict: 'post_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error upserting posts:', error);
        throw error;
      }
    }

    return new Response(JSON.stringify({ success: true, count: posts.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper function to extract hashtags from caption
function extractHashtags(caption: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = caption.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
}
