import { ChatThread, ChatParticipant, ChatMessage } from "./chat";

// Group-specific settings and permissions
export interface GroupChatSettings {
  whoCanSendMessages: 'everyone' | 'admins_only';
  whoCanAddMembers: 'everyone' | 'admins_only';
  whoCanEditGroupInfo: 'everyone' | 'admins_only';
  whoCanRemoveMembers: 'admins_only';
  disappearingMessages: boolean;
  disappearingMessagesDuration?: number; // hours
  allowMemberInvites: boolean;
  showMemberAddNotifications: boolean;
  showMemberExitNotifications: boolean;
  muteNonAdminMessages: boolean;
}

// Enhanced participant with group-specific roles and permissions
export interface GroupParticipant extends ChatParticipant {
  role: 'admin' | 'member';
  joinedAt: string;
  addedBy: string;
  leftAt?: string;
  removedBy?: string;
  removedAt?: string;
  isActive: boolean;
  permissions?: {
    canSendMessages: boolean;
    canAddMembers: boolean;
    canRemoveMembers: boolean;
    canEditGroupInfo: boolean;
    canDeleteMessages: boolean;
    canMuteMembers: boolean;
  };
  customTitle?: string; // Custom title like "Founder", "Moderator"
  warnings?: number; // Warning count for moderation
  lastReadMessageId?: string;
}

// Group chat thread extending base ChatThread
export interface GroupChatThread extends Omit<ChatThread, 'participants'> {
  isGroup: true;
  groupName: string;
  groupAvatar?: string;
  groupDescription?: string;
  createdBy: string;
  adminIds: string[];
  settings: GroupChatSettings;
  participants: GroupParticipant[];
  inviteLink?: string;
  inviteCode?: string;
  maxParticipants: number; // Default: 256
  isPinned?: boolean;
  isArchived?: boolean;
  totalMessages?: number;
  groupType: 'private' | 'public' | 'announcement';
  tags?: string[]; // For categorizing groups
  category?: 'family' | 'friends' | 'work' | 'community' | 'other';
}

// Group management actions and system messages
export interface GroupAction {
  id: string;
  type: 'member_added' | 'member_removed' | 'member_promoted' | 'member_demoted' 
       | 'group_created' | 'group_info_changed' | 'group_settings_changed'
       | 'member_left' | 'group_deleted' | 'invite_link_created' | 'invite_link_revoked'
       | 'group_archived' | 'group_unarchived' | 'message_deleted' | 'member_muted';
  performedBy: string;
  targetUserId?: string;
  targetUserIds?: string[]; // For bulk actions
  timestamp: string;
  groupId: string;
  details?: {
    oldValue?: any;
    newValue?: any;
    reason?: string;
    duration?: number; // For temporary actions like muting
    metadata?: Record<string, any>;
  };
}

// Group message with enhanced metadata
export interface GroupMessage extends ChatMessage {
  groupId: string;
  isAnnouncement?: boolean;
  mentionedUserIds?: string[];
  isPinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: string;
  forwardedFrom?: {
    groupId?: string;
    groupName?: string;
    originalSender: string;
    originalTimestamp: string;
  };
}

// Group creation and management requests
export interface CreateGroupRequest {
  name: string;
  description?: string;
  avatar?: string;
  participants: string[];
  settings?: Partial<GroupChatSettings>;
  category?: GroupChatThread['category'];
  groupType?: GroupChatThread['groupType'];
  initialMessage?: string;
  createdBy?: string;
}

export interface UpdateGroupRequest {
  groupId: string;
  name?: string;
  description?: string;
  avatar?: string;
  settings?: Partial<GroupChatSettings>;
  category?: GroupChatThread['category'];
}

export interface AddMembersRequest {
  groupId: string;
  userIds: string[];
  customMessage?: string;
  silent?: boolean; // Don't send notification
}

export interface RemoveMemberRequest {
  groupId: string;
  userId: string;
  reason?: string;
  deleteMessages?: boolean; // Delete user's recent messages
}

export interface UpdateMemberRoleRequest {
  groupId: string;
  userId: string;
  newRole: 'admin' | 'member';
  customTitle?: string;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  code: string;
  link: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

// Group-specific filters and search
export interface GroupFilter {
  category?: GroupChatThread['category'];
  groupType?: GroupChatThread['groupType'];
  hasUnread?: boolean;
  isAdmin?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  memberCount?: {
    min?: number;
    max?: number;
  };
  createdAfter?: string;
  createdBefore?: string;
}

// Group analytics and insights
export interface GroupAnalytics {
  groupId: string;
  totalMembers: number;
  activeMembers: number; // Members active in last 7 days
  totalMessages: number;
  messagesThisWeek: number;
  topContributors: Array<{
    userId: string;
    userName: string;
    messageCount: number;
    percentage: number;
  }>;
  peakActivityHours: number[];
  averageResponseTime: number; // in minutes
  retentionRate: number; // percentage of members still active after 30 days
}

// Group search and discovery
export interface GroupSearchResult {
  group: GroupChatThread;
  relevanceScore: number;
  matchedFields: string[];
  preview?: {
    recentMessages: GroupMessage[];
    activeMembers: GroupParticipant[];
  };
}

// Bulk operations
export interface BulkGroupOperation {
  operation: 'archive' | 'unarchive' | 'delete' | 'mute' | 'unmute' | 'pin' | 'unpin';
  groupIds: string[];
  options?: {
    deleteMessages?: boolean;
    muteDuration?: number;
    reason?: string;
  };
}

// Group notification preferences
export interface GroupNotificationSettings {
  groupId: string;
  userId: string;
  enabled: boolean;
  mentions: boolean;
  reactions: boolean;
  newMembers: boolean;
  memberLeft: boolean;
  groupInfoChanged: boolean;
  customKeywords?: string[];
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;
  weekendNotifications: boolean;
}

// Default settings
export const DEFAULT_GROUP_SETTINGS: GroupChatSettings = {
  whoCanSendMessages: 'everyone',
  whoCanAddMembers: 'everyone',
  whoCanEditGroupInfo: 'admins_only',
  whoCanRemoveMembers: 'admins_only',
  disappearingMessages: false,
  allowMemberInvites: true,
  showMemberAddNotifications: true,
  showMemberExitNotifications: true,
  muteNonAdminMessages: false,
};

export const DEFAULT_PARTICIPANT_PERMISSIONS = {
  canSendMessages: true,
  canAddMembers: true,
  canRemoveMembers: false,
  canEditGroupInfo: false,
  canDeleteMessages: false,
  canMuteMembers: false,
};

export const ADMIN_PARTICIPANT_PERMISSIONS = {
  canSendMessages: true,
  canAddMembers: true,
  canRemoveMembers: true,
  canEditGroupInfo: true,
  canDeleteMessages: true,
  canMuteMembers: true,
};

// Group limits and constants
export const GROUP_LIMITS = {
  MAX_PARTICIPANTS: 256,
  MAX_ADMINS: 32,
  MAX_GROUP_NAME_LENGTH: 64,
  MAX_GROUP_DESCRIPTION_LENGTH: 500,
  MAX_CUSTOM_TITLE_LENGTH: 25,
  MAX_GROUPS_PER_USER: 100,
  MAX_INVITE_LINKS_PER_GROUP: 5,
};
