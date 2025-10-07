// @ts-nocheck
import { supabase } from '../lib/supabase/client'
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
      const { data: groupData, error: groupError } = await supabase
        .from('group_chat_threads')
        .insert({
          name: request.name,
          description: request.description,
          avatar: request.avatar,
          is_private: request.settings.isPrivate,
          settings: request.settings,
          created_by: request.createdBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (groupError) throw groupError

      // Add participants (creator is automatically admin)
      const participantsData = [
        {
          group_id: groupData.id,
          user_id: request.createdBy,
          role: 'admin' as const,
          permissions: this.getAdminPermissions(),
          joined_at: new Date().toISOString()
        },
        ...request.participants.map(userId => ({
          group_id: groupData.id,
          user_id: userId,
          role: 'member' as const,
          permissions: this.getMemberPermissions(),
          joined_at: new Date().toISOString()
        }))
      ]

      const { error: participantsError } = await supabase
        .from('group_participants')
        .insert(participantsData)

      if (participantsError) throw participantsError

      // Get complete group with participants
      return await this.getGroupById(groupData.id)
    } catch (error) {
      console.error('Error creating group:', error)
      throw new Error('Failed to create group')
    }
  }

  async getGroupById(groupId: string): Promise<GroupChatThread> {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('group_chat_threads')
        .select(`
          *,
          group_participants!inner(
            user_id,
            role,
            permissions,
            joined_at,
            last_seen,
            is_muted,
            user:users(id, username, avatar_url, display_name)
          )
        `)
        .eq('id', groupId)
        .single()

      if (groupError) throw groupError

      return {
        id: groupData.id,
        type: 'group',
        name: groupData.name,
        description: groupData.description,
        avatar: groupData.avatar,
        participants: groupData.group_participants.map((p: any) => ({
          userId: p.user_id,
          username: p.user.username,
          displayName: p.user.display_name,
          avatar: p.user.avatar_url,
          role: p.role,
          permissions: p.permissions,
          joinedAt: p.joined_at,
          lastSeen: p.last_seen,
          isMuted: p.is_muted
        })),
        settings: groupData.settings,
        createdBy: groupData.created_by,
        createdAt: groupData.created_at,
        lastActivity: groupData.updated_at,
        totalMembers: groupData.group_participants.length,
        onlineMembers: 0, // Would need real-time presence
        pinnedMessages: [],
        inviteLinks: []
      }
    } catch (error) {
      console.error('Error fetching group:', error)
      throw new Error('Failed to fetch group')
    }
  }

  async getUserGroups(userId: string): Promise<GroupChatThread[]> {
    try {
      const { data, error } = await supabase
        .from('group_participants')
        .select(`
          group_id,
          role,
          group_chat_threads!inner(
            id,
            name,
            description,
            avatar,
            settings,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)

      if (error) throw error

      const groups = await Promise.all(
        data.map(async (item: any) => {
          return await this.getGroupById(item.group_id)
        })
      )

      return groups
    } catch (error) {
      console.error('Error fetching user groups:', error)
      throw new Error('Failed to fetch user groups')
    }
  }

  // Member Management
  async addMember(groupId: string, userId: string, addedBy: string): Promise<void> {
    try {
      // Check if requester has permission
      const hasPermission = await this.checkPermission(groupId, addedBy, 'canAddMembers')
      if (!hasPermission) throw new Error('Insufficient permissions')

      const { error } = await supabase
        .from('group_participants')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member',
          permissions: this.getMemberPermissions(),
          joined_at: new Date().toISOString()
        })

      if (error) throw error

      // Add system message
      await this.addSystemMessage(groupId, `User added to the group`, addedBy)
    } catch (error) {
      console.error('Error adding member:', error)
      throw new Error('Failed to add member')
    }
  }

  async removeMember(groupId: string, userId: string, removedBy: string): Promise<void> {
    try {
      // Check permissions
      const hasPermission = await this.checkPermission(groupId, removedBy, 'canRemoveMembers')
      if (!hasPermission) throw new Error('Insufficient permissions')

      const { error } = await supabase
        .from('group_participants')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)

      if (error) throw error

      // Add system message
      await this.addSystemMessage(groupId, `User removed from the group`, removedBy)
    } catch (error) {
      console.error('Error removing member:', error)
      throw new Error('Failed to remove member')
    }
  }

  async promoteToAdmin(groupId: string, userId: string, promotedBy: string): Promise<void> {
    try {
      // Check permissions
      const hasPermission = await this.checkPermission(groupId, promotedBy, 'canManageAdmins')
      if (!hasPermission) throw new Error('Insufficient permissions')

      const { error } = await supabase
        .from('group_participants')
        .update({
          role: 'admin',
          permissions: this.getAdminPermissions()
        })
        .eq('group_id', groupId)
        .eq('user_id', userId)

      if (error) throw error

      // Add system message
      await this.addSystemMessage(groupId, `User promoted to admin`, promotedBy)
    } catch (error) {
      console.error('Error promoting to admin:', error)
      throw new Error('Failed to promote to admin')
    }
  }

  async demoteFromAdmin(groupId: string, userId: string, demotedBy: string): Promise<void> {
    try {
      // Check permissions
      const hasPermission = await this.checkPermission(groupId, demotedBy, 'canManageAdmins')
      if (!hasPermission) throw new Error('Insufficient permissions')

      const { error } = await supabase
        .from('group_participants')
        .update({
          role: 'member',
          permissions: this.getMemberPermissions()
        })
        .eq('group_id', groupId)
        .eq('user_id', userId)

      if (error) throw error

      // Add system message
      await this.addSystemMessage(groupId, `Admin privileges removed`, demotedBy)
    } catch (error) {
      console.error('Error demoting from admin:', error)
      throw new Error('Failed to demote from admin')
    }
  }

  // Group Settings Management
  async updateGroupSettings(groupId: string, settings: Partial<GroupSettings>, updatedBy: string): Promise<void> {
    try {
      // Check permissions
      const hasPermission = await this.checkPermission(groupId, updatedBy, 'canEditSettings')
      if (!hasPermission) throw new Error('Insufficient permissions')

      const { error } = await supabase
        .from('group_chat_threads')
        .update({
          settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)

      if (error) throw error

      // Add system message
      await this.addSystemMessage(groupId, `Group settings updated`, updatedBy)
    } catch (error) {
      console.error('Error updating group settings:', error)
      throw new Error('Failed to update group settings')
    }
  }

  async updateGroupInfo(groupId: string, name?: string, description?: string, avatar?: string, updatedBy?: string): Promise<void> {
    try {
      if (updatedBy) {
        const hasPermission = await this.checkPermission(groupId, updatedBy, 'canEditGroupInfo')
        if (!hasPermission) throw new Error('Insufficient permissions')
      }

      const updates: any = { updated_at: new Date().toISOString() }
      if (name !== undefined) updates.name = name
      if (description !== undefined) updates.description = description
      if (avatar !== undefined) updates.avatar = avatar

      const { error } = await supabase
        .from('group_chat_threads')
        .update(updates)
        .eq('id', groupId)

      if (error) throw error

      if (updatedBy) {
        await this.addSystemMessage(groupId, `Group info updated`, updatedBy)
      }
    } catch (error) {
      console.error('Error updating group info:', error)
      throw new Error('Failed to update group info')
    }
  }

  // Invite Link Management
  async createInviteLink(groupId: string, createdBy: string, expiresAt?: Date): Promise<GroupInviteLink> {
    try {
      const hasPermission = await this.checkPermission(groupId, createdBy, 'canCreateInvites')
      if (!hasPermission) throw new Error('Insufficient permissions')

      const inviteCode = this.generateInviteCode()
      const { data, error } = await supabase
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
        .single()

      if (error) throw error

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
      const { data: linkData, error: linkError } = await supabase
        .from('group_invite_links')
        .select('*')
        .eq('code', inviteCode)
        .eq('is_active', true)
        .single()

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
