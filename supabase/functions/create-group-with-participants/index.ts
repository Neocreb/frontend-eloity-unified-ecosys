// Supabase Edge Function for creating a group with participants
// @ts-nocheck - Supabase Edge Functions use Deno runtime, not Node.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface CreateGroupRequest {
  name: string;
  description?: string;
  avatar?: string;
  participants: string[];
  settings?: {
    isPrivate?: boolean;
    whoCanSendMessages?: 'everyone' | 'admins_only';
    whoCanAddMembers?: 'everyone' | 'admins_only';
    whoCanEditGroupInfo?: 'everyone' | 'admins_only';
    whoCanRemoveMembers?: 'everyone' | 'admins_only';
  };
}

interface GroupPermissions {
  canSendMessage: boolean;
  canAddMembers: boolean;
  canEditGroupInfo: boolean;
  canRemoveMembers: boolean;
  canCreateInvites: boolean;
  canManageAdmins: boolean;
  canPinMessages: boolean;
  canSendAnnouncements: boolean;
  canShareFiles: boolean;
  canMentionEveryone: boolean;
}

const getAdminPermissions = (): GroupPermissions => ({
  canSendMessage: true,
  canAddMembers: true,
  canEditGroupInfo: true,
  canRemoveMembers: true,
  canCreateInvites: true,
  canManageAdmins: true,
  canPinMessages: true,
  canSendAnnouncements: true,
  canShareFiles: true,
  canMentionEveryone: true
});

const getMemberPermissions = (): GroupPermissions => ({
  canSendMessage: true,
  canAddMembers: false,
  canEditGroupInfo: false,
  canRemoveMembers: false,
  canCreateInvites: false,
  canManageAdmins: false,
  canPinMessages: false,
  canSendAnnouncements: false,
  canShareFiles: true,
  canMentionEveryone: false
});

// CORS headers for Vercel deployment
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your specific domain
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header. Bearer token required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client with user's access token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Parse request body
    let body: CreateGroupRequest;
    try {
      body = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.name?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Group name is required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!body.participants || body.participants.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one participant is required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check that creator is in participants list
    if (!body.participants.includes(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Creator must be included in participants list.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create the group chat thread
    const { data: groupThread, error: groupError } = await supabase
      .from('group_chat_threads')
      .insert({
        name: body.name.trim(),
        description: body.description || '',
        avatar: body.avatar || '',
        created_by: user.id,
        privacy: body.settings?.isPrivate ? 'private' : 'public',
        member_count: body.participants.length,
        last_activity: new Date().toISOString()
      })
      .select()
      .single();

    if (groupError) {
      console.error('Error creating group:', groupError);
      // More specific error handling
      if (groupError.code === '23503') {
        return new Response(
          JSON.stringify({ 
            error: 'Database constraint violation. Please ensure all referenced users exist.',
            details: groupError.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create group due to database configuration issue. Please contact support.',
          details: groupError.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Add participants
    const participantInserts = body.participants.map((userId, index) => ({
      group_id: groupThread.id,
      user_id: userId,
      role: userId === user.id ? 'admin' : 'member',
      status: 'active',
      joined_at: new Date().toISOString(),
      permissions: userId === user.id ? getAdminPermissions() : getMemberPermissions()
    }));

    const { error: participantsError } = await supabase
      .from('group_participants')
      .insert(participantInserts);

    if (participantsError) {
      console.error('Error adding participants:', participantsError);
      // Try to clean up the group we just created
      await supabase.from('group_chat_threads').delete().eq('id', groupThread.id);
      
      // More specific error handling
      if (participantsError.code === '23503') {
        return new Response(
          JSON.stringify({ 
            error: 'One or more participants do not exist. Please verify all user IDs.',
            details: participantsError.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to add participants due to database configuration issue. Please contact support.',
          details: participantsError.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        group: {
          id: groupThread.id,
          name: groupThread.name,
          description: groupThread.description,
          avatar: groupThread.avatar,
          privacy: groupThread.privacy,
          member_count: groupThread.member_count,
          created_by: groupThread.created_by,
          created_at: groupThread.created_at,
          last_activity: groupThread.last_activity
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error in create-group-with-participants function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error occurred while creating group. Please contact support.',
        details: error.message || 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});