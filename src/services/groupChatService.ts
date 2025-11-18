// @ts-nocheck
import { supabase } from '@/integrations/supabase/client'
import type { 
  GroupChatThread, 
  GroupParticipant, 
  CreateGroupRequest, 
  GroupSettings,
  GroupPermissions,
  GroupInviteLink,
  GroupAnnouncement,
  GroupMediaFile,
  GroupAnalytics
} from '../types/group-chat'

export class GroupChatService {
  // Group CRUD Operations
  async createGroup(request: CreateGroupRequest): Promise<GroupChatThread> {
    try {
      // Always use the Supabase function endpoint to avoid RLS issues
      const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://hjebzdekquczudhrygns.supabase.co';
      
      if (supabaseUrl) {
        // Use the Supabase function endpoint
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) {
          throw new Error('User not authenticated');
        }

        const requestBody = {
          name: request.name,
          description: request.description || '',
          avatar: request.avatar,
          participants: [request.createdBy, ...request.participants.filter(p => p !== request.createdBy)],
          settings: request.settings
        };

        console.log('Sending group creation request:', requestBody);

        const response = await fetch(`${supabaseUrl}/functions/v1/create-group-with-participants`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Group creation response status:', response.status);

        let result;
        const contentType = response.headers.get('content-type');

        if (!response.ok) {
          let errorData;
          try {
            if (contentType?.includes('application/json')) {
              errorData = await response.json();
            } else {
              const errorText = await response.text();
              errorData = { error: errorText };
            }
          } catch (e) {
            errorData = { error: `HTTP ${response.status}` };
          }

          const errorMessage = errorData.error || 'Failed to create group via function endpoint';
          throw new Error(`${errorMessage} (Status: ${response.status})`);
        }

        try {
          if (contentType?.includes('application/json')) {
            result = await response.json();
          } else {
            const text = await response.text();
            result = JSON.parse(text);
          }
        } catch (e) {
          throw new Error('Failed to parse group creation response');
        }
        console.log('Group creation successful:', result);
        
        return {
          id: result.group.id,
          type: 'group',
          groupName: result.group.name,
          groupDescription: result.group.description,
          groupAvatar: result.group.avatar,
          participants: [], // Will be populated when needed
          settings: request.settings || {
            isPrivate: result.group.privacy === 'private',
            allowInvites: true,
            allowMessaging: true
          },
          createdBy: result.group.created_by,
          createdAt: result.group.created_at,
          lastActivity: result.group.last_activity,
          totalMembers: result.group.member_count,
          onlineMembers: 0,
          pinnedMessages: [],
          inviteLinks: [],
          adminIds: [],
          maxParticipants: 256,
          groupType: result.group.privacy === 'private' ? 'private' : 'public',
          isGroup: true
        };
      } else {
        throw new Error('Supabase URL not configured');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      throw new Error(`Failed to create group due to database configuration issue. Please contact support. Details: ${error.message}`);
    }
  }

  async getGroupById(groupId: string): Promise<GroupChatThread> {
    try {
      const { data: groupThreadArray, error: groupError } = await supabase
        .from('group_chat_threads')
        .select('*')
        .eq('id', groupId)
        .limit(1);

      const groupThread = groupThreadArray?.[0];

      if (groupError) throw groupError;
      if (!groupThread) throw new Error('Group not found');

      // Get participants count
      const { count: memberCount, error: countError } = await supabase
        .from('group_participants')
        .select('*', { count: 'exact' })
        .eq('group_id', groupId);

      if (countError) throw countError;

      return {
        id: groupThread.id,
        type: 'group',
        groupName: groupThread.name,
        groupDescription: groupThread.description,
        groupAvatar: groupThread.avatar,
        participants: [],
        settings: {
          isPrivate: groupThread.privacy === 'private',
          allowInvites: true,
          allowMessaging: true
        },
        createdBy: groupThread.created_by,
        createdAt: groupThread.created_at,
        lastActivity: groupThread.last_activity,
        totalMembers: memberCount || 0,
        onlineMembers: 0,
        pinnedMessages: [],
        inviteLinks: [],
        adminIds: [],
        maxParticipants: 256,
        groupType: groupThread.privacy === 'private' ? 'private' : 'public',
        isGroup: true
      };
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  }

  async getUserGroups(userId: string): Promise<GroupChatThread[]> {
    try {
      // Get all groups where the user is a participant
      const { data: participantGroups, error: participantError } = await supabase
        .from('group_participants')
        .select('group_id')
        .eq('user_id', userId);

      if (participantError) throw participantError;

      if (!participantGroups || participantGroups.length === 0) {
        return [];
      }

      const groupIds = participantGroups.map(pg => pg.group_id);

      // Get the actual group data
      const { data: groups, error: groupsError } = await supabase
        .from('group_chat_threads')
        .select('*')
        .in('id', groupIds);

      if (groupsError) throw groupsError;

      // Get member counts for each group
      const groupMemberCounts = await Promise.all(
        groups.map(async (group) => {
          const { count, error } = await supabase
            .from('group_participants')
            .select('*', { count: 'exact' })
            .eq('group_id', group.id);

          if (error) return 0;
          return count || 0;
        })
      );

      return groups.map((group, index) => ({
        id: group.id,
        type: 'group',
        groupName: group.name,
        groupDescription: group.description,
        groupAvatar: group.avatar,
        participants: [],
        settings: {
          isPrivate: group.privacy === 'private',
          allowInvites: true,
          allowMessaging: true
        },
        createdBy: group.created_by,
        createdAt: group.created_at,
        lastActivity: group.last_activity,
        totalMembers: groupMemberCounts[index],
        onlineMembers: 0,
        pinnedMessages: [],
        inviteLinks: [],
        adminIds: [],
        maxParticipants: 256,
        groupType: group.privacy === 'private' ? 'private' : 'public',
        isGroup: true
      }));
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  }

  // Member Management
  async addMember(groupId: string, userId: string, addedBy: string): Promise<void> {
    try {
      // Check if user is already a member
      const { data: existingMemberArray } = await supabase
        .from('group_participants')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .limit(1);

      const existingMember = existingMemberArray?.[0];
      if (existingMember) {
        throw new Error('User is already a member of this group');
      }

      // Add the user as a member
      const { error } = await supabase
        .from('group_participants')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member',
          status: 'active',
          joined_at: new Date().toISOString(),
          permissions: this.getMemberPermissions()
        });

      if (error) throw error;

      // Update group member count
      await supabase
        .from('group_chat_threads')
        .update({ member_count: supabase.rpc('increment_group_member_count', { group_id: groupId }) })
        .eq('id', groupId);
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  async removeMember(groupId: string, userId: string, removedBy: string): Promise<void> {
    try {
      // Remove the user from the group
      const { error } = await supabase
        .from('group_participants')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update group member count
      await supabase
        .from('group_chat_threads')
        .update({ member_count: supabase.rpc('decrement_group_member_count', { group_id: groupId }) })
        .eq('id', groupId);
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  async promoteToAdmin(groupId: string, userId: string, promotedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('group_participants')
        .update({ 
          role: 'admin',
          permissions: this.getAdminPermissions()
        })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error promoting to admin:', error);
      throw error;
    }
  }

  async demoteFromAdmin(groupId: string, userId: string, demotedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('group_participants')
        .update({ 
          role: 'member',
          permissions: this.getMemberPermissions()
        })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error demoting from admin:', error);
      throw error;
    }
  }

  // Group Settings Management
  async updateGroupSettings(groupId: string, settings: Partial<GroupSettings>, updatedBy: string): Promise<void> {
    console.warn("updateGroupSettings: Database table 'group_chat_threads' does not exist yet. No operation performed.");
    // No operation instead of accessing non-existent database
    return Promise.resolve();
  }

  async updateGroupInfo(groupId: string, name?: string, description?: string, avatar?: string, updatedBy?: string): Promise<void> {
    console.warn("updateGroupInfo: Database table 'group_chat_threads' does not exist yet. No operation performed.");
    // No operation instead of accessing non-existent database
    return Promise.resolve();
  }

  // Invite Link Management
  async createInviteLink(groupId: string, createdBy: string, expiresAt?: Date): Promise<GroupInviteLink> {
    try {
      const hasPermission = await this.checkPermission(groupId, createdBy, 'canCreateInvites')
      if (!hasPermission) throw new Error('Insufficient permissions')

      const inviteCode = this.generateInviteCode()
      const { data: inviteDataArray, error } = await supabase
        .from('group_invite_links')
        .insert({
          group_id: groupId,
          code: inviteCode,
          created_by: createdBy,
          expires_at: expiresAt?.toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()

      if (error) throw error
      if (!inviteDataArray?.[0]) throw new Error('Failed to create invite link')
      const data = inviteDataArray[0]

      return {
        id: data.id,
        groupId: data.group_id,
        code: data.code,
        url: `${window.location.origin}/join/${data.code}`,
        createdBy: data.created_by,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        usageCount: 0,
        maxUses: data.max_uses,
        isActive: data.is_active
      }
    } catch (error) {
      console.error('Error creating invite link:', error)
      throw new Error('Failed to create invite link')
    }
  }

  async revokeInviteLink(linkId: string, revokedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('group_invite_links')
        .update({ is_active: false })
        .eq('id', linkId)

      if (error) throw error
    } catch (error) {
      console.error('Error revoking invite link:', error)
      throw new Error('Failed to revoke invite link')
    }
  }

  async joinViaInviteLink(inviteCode: string, userId: string): Promise<GroupChatThread> {
    try {
      // Get invite link
      const { data: linkDataArray, error: linkError } = await supabase
        .from('group_invite_links')
        .select('*')
        .eq('code', inviteCode)
        .eq('is_active', true)
        .limit(1)

      const linkData = linkDataArray?.[0];
      if (linkError || !linkData) throw new Error('Invalid or expired invite link')

      // Check if link is expired
      if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
        throw new Error('Invite link has expired')
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_participants')
        .select('id')
        .eq('group_id', linkData.group_id)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        throw new Error('You are already a member of this group')
      }

      // Add user to group
      await this.addMember(linkData.group_id, userId, linkData.created_by)

      // Update usage count
      await supabase
        .from('group_invite_links')
        .update({ 
          usage_count: (linkData.usage_count || 0) + 1 
        })
        .eq('id', linkData.id)

      return await this.getGroupById(linkData.group_id)
    } catch (error) {
      console.error('Error joining via invite link:', error)
      throw new Error('Failed to join group')
    }
  }

  // Message Operations
  async createAnnouncement(groupId: string, content: string, createdBy: string): Promise<void> {
    try {
      const hasPermission = await this.checkPermission(groupId, createdBy, 'canSendAnnouncements')
      if (!hasPermission) throw new Error('Insufficient permissions to send announcements')

      // Send as system message with announcement flag
      await supabase
        .from('messages')
        .insert({
          thread_id: groupId,
          sender_id: createdBy,
          content,
          type: 'announcement',
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error creating announcement:', error)
      throw new Error('Failed to create announcement')
    }
  }

  async pinMessage(messageId: string, groupId: string, pinnedBy: string): Promise<void> {
    try {
      const hasPermission = await this.checkPermission(groupId, pinnedBy, 'canPinMessages')
      if (!hasPermission) throw new Error('Insufficient permissions')

      const { error } = await supabase
        .from('messages')
        .update({ is_pinned: true })
        .eq('id', messageId)
        .eq('thread_id', groupId)

      if (error) throw error

      await this.addSystemMessage(groupId, `Message pinned`, pinnedBy)
    } catch (error) {
      console.error('Error pinning message:', error)
      throw new Error('Failed to pin message')
    }
  }

  async unpinMessage(messageId: string, groupId: string, unpinnedBy: string): Promise<void> {
    try {
      const hasPermission = await this.checkPermission(groupId, unpinnedBy, 'canPinMessages')
      if (!hasPermission) throw new Error('Insufficient permissions')

      const { error } = await supabase
        .from('messages')
        .update({ is_pinned: false })
        .eq('id', messageId)
        .eq('thread_id', groupId)

      if (error) throw error

      await this.addSystemMessage(groupId, `Message unpinned`, unpinnedBy)
    } catch (error) {
      console.error('Error unpinning message:', error)
      throw new Error('Failed to unpin message')
    }
  }

  // File Management
  async uploadGroupFile(groupId: string, file: File, uploadedBy: string): Promise<GroupMediaFile> {
    try {
      const hasPermission = await this.checkPermission(groupId, uploadedBy, 'canShareFiles')
      if (!hasPermission) throw new Error('Insufficient permissions to share files')

      // Upload to Supabase Storage
      const fileName = `groups/${groupId}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('group-files')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('group-files')
        .getPublicUrl(fileName)

      // Save file metadata
      const { data: fileData, error: fileError } = await supabase
        .from('group_media_files')
        .insert({
          group_id: groupId,
          file_name: file.name,
          file_path: fileName,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: uploadedBy,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (fileError) throw fileError

      return {
        id: fileData.id,
        groupId: fileData.group_id,
        fileName: fileData.file_name,
        fileUrl: fileData.file_url,
        fileType: fileData.file_type,
        fileSize: fileData.file_size,
        uploadedBy: fileData.uploaded_by,
        uploadedAt: fileData.uploaded_at
      }
    } catch (error) {
      console.error('Error uploading group file:', error)
      throw new Error('Failed to upload file')
    }
  }

  async getGroupFiles(groupId: string): Promise<GroupMediaFile[]> {
    try {
      const { data, error } = await supabase
        .from('group_media_files')
        .select('*')
        .eq('group_id', groupId)
        .order('uploaded_at', { ascending: false })

      if (error) throw error

      return data.map(file => ({
        id: file.id,
        groupId: file.group_id,
        fileName: file.file_name,
        fileUrl: file.file_url,
        fileType: file.file_type,
        fileSize: file.file_size,
        uploadedBy: file.uploaded_by,
        uploadedAt: file.uploaded_at
      }))
    } catch (error) {
      console.error('Error fetching group files:', error)
      throw new Error('Failed to fetch group files')
    }
  }

  // Analytics
  async getGroupAnalytics(groupId: string): Promise<GroupAnalytics> {
    try {
      // Get basic stats
      const { data: messageStats } = await supabase
        .from('messages')
        .select('id, created_at, sender_id')
        .eq('thread_id', groupId)

      const { data: participantStats } = await supabase
        .from('group_participants')
        .select('joined_at, last_seen')
        .eq('group_id', groupId)

      const totalMessages = messageStats?.length || 0
      const activeMembers = participantStats?.filter(p => {
        const lastSeen = new Date(p.last_seen || p.joined_at)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return lastSeen > weekAgo
      }).length || 0

      // Calculate message frequency (messages per day in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const recentMessages = messageStats?.filter(m => 
        new Date(m.created_at) > thirtyDaysAgo
      ) || []

      return {
        totalMessages,
        totalMembers: participantStats?.length || 0,
        activeMembers,
        messageFrequency: recentMessages.length / 30, // per day
        topContributors: [], // Would need more complex query
        engagementRate: activeMembers / (participantStats?.length || 1) * 100,
        peakActivityHours: [] // Would need time analysis
      }
    } catch (error) {
      console.error('Error fetching group analytics:', error)
      throw new Error('Failed to fetch group analytics')
    }
  }

  // Helper Methods
  private async checkPermission(groupId: string, userId: string, permission: keyof GroupPermissions): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('group_participants')
        .select('permissions')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single()

      if (error) return false
      return data.permissions[permission] || false
    } catch {
      return false
    }
  }

  private async addSystemMessage(groupId: string, content: string, actionBy: string): Promise<void> {
    await supabase
      .from('messages')
      .insert({
        thread_id: groupId,
        sender_id: actionBy,
        content,
        type: 'system',
        created_at: new Date().toISOString()
      })
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private getAdminPermissions(): GroupPermissions {
    return {
      canSendMessages: true,
      canDeleteOwnMessages: true,
      canDeleteAnyMessage: true,
      canAddMembers: true,
      canRemoveMembers: true,
      canEditGroupInfo: true,
      canEditSettings: true,
      canCreateInvites: true,
      canManageAdmins: true,
      canPinMessages: true,
      canSendAnnouncements: true,
      canShareFiles: true,
      canMentionEveryone: true
    }
  }

  private getMemberPermissions(): GroupPermissions {
    return {
      canSendMessages: true,
      canDeleteOwnMessages: true,
      canDeleteAnyMessage: false,
      canAddMembers: false,
      canRemoveMembers: false,
      canEditGroupInfo: false,
      canEditSettings: false,
      canCreateInvites: false,
      canManageAdmins: false,
      canPinMessages: false,
      canSendAnnouncements: false,
      canShareFiles: true,
      canMentionEveryone: false
    }
  }
}

export const groupChatService = new GroupChatService()
