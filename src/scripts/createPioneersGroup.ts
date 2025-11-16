import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

async function createPioneersGroup() {
  try {
    console.log("Creating Pioneers group...");
    
    // Check if the group already exists
    const { data: existingGroups, error: selectError } = await supabase
      .from('group_chat_threads')
      .select('*')
      .eq('name', 'Pioneers');
      
    if (selectError) {
      console.error("Error checking for existing group:", selectError);
      return;
    }
    
    if (existingGroups && existingGroups.length > 0) {
      console.log("Pioneers group already exists with ID:", existingGroups[0].id);
      return;
    }
    
    // Create the Pioneers group
    const groupId = uuidv4();
    const { data: newGroup, error: insertError } = await supabase
      .from('group_chat_threads')
      .insert({
        id: groupId,
        name: 'Pioneers',
        description: 'A public group for all pioneers to connect, share ideas, and collaborate. Join us!',
        avatar: '',
        created_by: 'system', // System-created group
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        is_private: false,
        category: 'community',
        settings: {
          whoCanSendMessages: 'everyone',
          whoCanAddMembers: 'everyone',
          whoCanEditGroupInfo: 'admins_only',
          whoCanRemoveMembers: 'admins_only',
          disappearingMessages: false,
          allowMemberInvites: true,
          showMemberAddNotifications: true,
          showMemberExitNotifications: true,
          muteNonAdminMessages: false,
          isPrivate: false
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating Pioneers group:", insertError);
      return;
    }

    console.log("Successfully created Pioneers group with ID:", newGroup.id);
    
    // Also create an initial welcome message
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        id: uuidv4(),
        thread_id: newGroup.id,
        sender_id: 'system',
        content: 'Welcome to the Pioneers group! This is a public community space for all pioneers to connect and collaborate.',
        message_type: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (messageError) {
      console.error("Error creating welcome message:", messageError);
    } else {
      console.log("Successfully created welcome message");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the function
createPioneersGroup();