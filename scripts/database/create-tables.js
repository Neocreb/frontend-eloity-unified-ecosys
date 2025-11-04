// Script to create tables in Supabase based on the shared schema
import dotenv from 'dotenv';
dotenv.config();

console.log('Creating tables in Supabase...');

// Check if Supabase credentials are set
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.log('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file');
  process.exit(1);
}

console.log('✅ Supabase credentials found');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Create users table
  console.log('Creating users table...');
  const { error: usersError } = await supabase.rpc('create_users_table');
  
  if (usersError) {
    console.log('Note: create_users_table function may not exist, creating table directly...');
    
    // Try to create the table directly using SQL
    const { error: sqlError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE,
          full_name TEXT,
          avatar_url TEXT,
          banner_url TEXT,
          bio TEXT,
          location TEXT,
          website TEXT,
          phone TEXT,
          date_of_birth TEXT,
          gender TEXT,
          is_verified BOOLEAN DEFAULT false,
          points INTEGER DEFAULT 0,
          level TEXT DEFAULT 'bronze',
          role TEXT DEFAULT 'user',
          reputation INTEGER DEFAULT 0,
          followers_count INTEGER DEFAULT 0,
          following_count INTEGER DEFAULT 0,
          posts_count INTEGER DEFAULT 0,
          profile_views INTEGER DEFAULT 0,
          is_online BOOLEAN DEFAULT false,
          last_active TIMESTAMP WITH TIME ZONE,
          profile_visibility TEXT DEFAULT 'public',
          allow_direct_messages BOOLEAN DEFAULT true,
          allow_notifications BOOLEAN DEFAULT true,
          preferred_currency TEXT DEFAULT 'USD',
          timezone TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
        CREATE INDEX IF NOT EXISTS idx_users_full_name ON public.users (full_name);
      `
    });
    
    if (sqlError) {
      console.log('Error creating users table:', sqlError.message);
    } else {
      console.log('✅ Users table created successfully');
    }
  } else {
    console.log('✅ Users table created or already exists');
  }

  // Create profiles table
  console.log('Creating profiles table...');
  const { error: profilesError } = await supabase.rpc('create_profiles_table');
  
  if (profilesError) {
    console.log('Note: create_profiles_table function may not exist, creating table directly...');
    
    // Try to create the table directly using SQL
    const { error: sqlError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          username TEXT UNIQUE,
          full_name TEXT,
          avatar_url TEXT,
          bio TEXT,
          is_verified BOOLEAN DEFAULT false,
          points INTEGER DEFAULT 0,
          level TEXT DEFAULT 'bronze',
          role TEXT DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
        CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
      `
    });
    
    if (sqlError) {
      console.log('Error creating profiles table:', sqlError.message);
    } else {
      console.log('✅ Profiles table created successfully');
    }
  } else {
    console.log('✅ Profiles table created or already exists');
  }

  // Create posts table
  console.log('Creating posts table...');
  const { error: postsError } = await supabase.rpc('create_posts_table');
  
  if (postsError) {
    console.log('Note: create_posts_table function may not exist, creating table directly...');
    
    // Try to create the table directly using SQL
    const { error: sqlError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.posts (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          content TEXT,
          media_urls JSONB,
          type TEXT DEFAULT 'text',
          privacy TEXT DEFAULT 'public',
          location TEXT,
          hashtags TEXT[],
          mentions TEXT[],
          likes_count INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          shares_count INTEGER DEFAULT 0,
          views_count INTEGER DEFAULT 0,
          is_pinned BOOLEAN DEFAULT false,
          is_featured BOOLEAN DEFAULT false,
          is_deleted BOOLEAN DEFAULT false,
          deleted_at TIMESTAMP WITH TIME ZONE,
          scheduled_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts (user_id);
        CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at);
        CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts (type);
      `
    });
    
    if (sqlError) {
      console.log('Error creating posts table:', sqlError.message);
    } else {
      console.log('✅ Posts table created successfully');
    }
  } else {
    console.log('✅ Posts table created or already exists');
  }

  // Create followers table
  console.log('Creating followers table...');
  const { error: followersError } = await supabase.rpc('create_followers_table');
  
  if (followersError) {
    console.log('Note: create_followers_table function may not exist, creating table directly...');
    
    // Try to create the table directly using SQL
    const { error: sqlError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.followers (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(follower_id, following_id)
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON public.followers (follower_id);
        CREATE INDEX IF NOT EXISTS idx_followers_following_id ON public.followers (following_id);
      `
    });
    
    if (sqlError) {
      console.log('Error creating followers table:', sqlError.message);
    } else {
      console.log('✅ Followers table created successfully');
    }
  } else {
    console.log('✅ Followers table created or already exists');
  }

  // Create post_likes table
  console.log('Creating post_likes table...');
  const { error: likesError } = await supabase.rpc('create_post_likes_table');
  
  if (likesError) {
    console.log('Note: create_post_likes_table function may not exist, creating table directly...');
    
    // Try to create the table directly using SQL
    const { error: sqlError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.post_likes (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(post_id, user_id)
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes (post_id);
        CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes (user_id);
      `
    });
    
    if (sqlError) {
      console.log('Error creating post_likes table:', sqlError.message);
    } else {
      console.log('✅ Post likes table created successfully');
    }
  } else {
    console.log('✅ Post likes table created or already exists');
  }

  // Create post_comments table
  console.log('Creating post_comments table...');
  const { error: commentsError } = await supabase.rpc('create_post_comments_table');
  
  if (commentsError) {
    console.log('Note: create_post_comments_table function may not exist, creating table directly...');
    
    // Try to create the table directly using SQL
    const { error: sqlError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.post_comments (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
          likes_count INTEGER DEFAULT 0,
          replies_count INTEGER DEFAULT 0,
          is_deleted BOOLEAN DEFAULT false,
          deleted_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments (post_id);
        CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments (user_id);
        CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments (parent_id);
      `
    });
    
    if (sqlError) {
      console.log('Error creating post_comments table:', sqlError.message);
    } else {
      console.log('✅ Post comments table created successfully');
    }
  } else {
    console.log('✅ Post comments table created or already exists');
  }

  console.log('🎉 All tables creation attempts completed');
  console.log('Note: Some tables may have already existed, which is perfectly fine.');

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
  console.log('Make sure you have:');
  console.log('1. Updated your .env file with real credentials');
  console.log('2. Installed all dependencies with npm install');
  console.log('3. Have internet connectivity');
}