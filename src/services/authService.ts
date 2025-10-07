// @ts-nocheck
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ExtendedUser, UserProfile } from "@/types/user";
import { fetchUserProfile, getUserPointsAndLevel, updateUserProfile } from "./profileService";

// Function to enhance the user object with profile data
export const enhanceUserWithProfile = async (supabaseUser: User | null): Promise<ExtendedUser | null> => {
  if (!supabaseUser) return null;

  try {
    const profile = await fetchUserProfile(supabaseUser.id);
    const { points, level } = await getUserPointsAndLevel(supabaseUser.id);

    const enhancedUser: ExtendedUser = {
      ...supabaseUser,
      profile,
      // Add convenience properties
      name: profile?.full_name || supabaseUser.email?.split('@')[0] || 'User',
      avatar: profile?.avatar_url || '/placeholder.svg',
      points,
      level,
      role: profile?.role || 'user',
      app_metadata: supabaseUser.app_metadata || {},
      username: (arg0: string, username: any) => {
        // This function implementation matches the type definition
        return profile?.username || supabaseUser.email?.split('@')[0] || 'user';
      }
    };

    return enhancedUser;
  } catch (error) {
    console.error("Error enhancing user:", error);
    // Provide default values if profile fetch fails
    return {
      ...supabaseUser,
      name: supabaseUser.email?.split('@')[0] || 'User',
      avatar: '/placeholder.svg',
      points: 0,
      level: 'bronze',
      role: 'user',
      app_metadata: supabaseUser.app_metadata || {},
      username: (arg0: string, username: any) => {
        return supabaseUser.email?.split('@')[0] || 'user';
      }
    } as ExtendedUser;
  }
};

// Function to update user profile
export const updateUserProfileData = async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    return await updateUserProfile(userId, profileData);
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    const err = new Error('Supabase configuration is missing');
    console.error('signIn aborted - missing Supabase env config', {
      url: import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    });
    throw err;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Supabase signIn error:', {
      message: (error as any).message,
      status: (error as any).status,
      name: (error as any).name,
    });
    throw error;
  }

  return data;
};

export const signUp = async (name: string, email: string, password: string) => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    const err = new Error('Supabase configuration is missing');
    console.error('signUp aborted - missing Supabase env config', {
      url: import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    });
    throw err;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  });

  if (error) {
    console.error('Supabase signUp error:', {
      message: (error as any).message,
      status: (error as any).status,
      name: (error as any).name,
    });
    throw error;
  }

  return data;
};

export const signOut = async () => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    console.warn('signOut skipped - missing Supabase env config');
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Supabase signOut error:', {
      message: (error as any).message,
      status: (error as any).status,
      name: (error as any).name,
    });
    throw error;
  }
};

export const getCurrentSession = async () => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    console.warn('getCurrentSession skipped - missing Supabase env config');
    return null;
  }
  const { data } = await supabase.auth.getSession();
  return data.session;
};
