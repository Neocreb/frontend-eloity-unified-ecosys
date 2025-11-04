-- Seed sample videos for testing
-- This adds 5 sample videos using existing profiles

INSERT INTO public.videos (
  user_id, 
  title, 
  description, 
  video_url, 
  thumbnail_url, 
  duration, 
  is_public, 
  category, 
  tags,
  views_count,
  likes_count,
  comments_count
)
VALUES 
-- Video 1: Welcome video
(
  '22c17f79-907d-40ac-b2f2-5bcf2b441df3',
  'Welcome to Eloity Videos',
  'Check out this amazing video content! 🎥 Join us on this incredible journey. #trending #video #welcome',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=600&fit=crop',
  596,
  true,
  'Entertainment',
  ARRAY['trending', 'video', 'entertainment', 'welcome'],
  1250,
  89,
  23
),
-- Video 2: Tutorial
(
  '22c17f79-907d-40ac-b2f2-5bcf2b441df3',
  'Quick Tutorial: Getting Started',
  'Learn the basics in just a few minutes! Perfect for beginners 🚀 #tutorial #howto #education',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
  654,
  true,
  'Education',
  ARRAY['tutorial', 'howto', 'education', 'guide'],
  892,
  45,
  12
),
-- Video 3: Vlog
(
  '22c17f79-907d-40ac-b2f2-5bcf2b441df3',
  'Day in the Life',
  'Follow me through my daily routine! 📸 Subscribe for more content. #vlog #lifestyle #daily',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
  15,
  true,
  'Lifestyle',
  ARRAY['vlog', 'lifestyle', 'daily', 'routine'],
  2340,
  156,
  67
),
-- Video 4: Gaming
(
  '22c17f79-907d-40ac-b2f2-5bcf2b441df3',
  'Epic Gaming Moments',
  'The most insane gameplay you will ever see! 🎮 Drop a like if you enjoyed. #gaming #gameplay #epic',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop',
  15,
  true,
  'Gaming',
  ARRAY['gaming', 'gameplay', 'epic', 'highlights'],
  3450,
  234,
  89
),
-- Video 5: Music
(
  '22c17f79-907d-40ac-b2f2-5bcf2b441df3',
  'Music Performance Live',
  'Live performance from our latest show! 🎵 Turn up the volume! #music #live #performance',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop',
  60,
  true,
  'Music',
  ARRAY['music', 'live', 'performance', 'concert'],
  1890,
  123,
  45
)
ON CONFLICT (id) DO NOTHING;