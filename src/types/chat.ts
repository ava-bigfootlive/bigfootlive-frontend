export interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system' | 'moderator' | 'donation' | 'super_chat';
  isDeleted?: boolean;
  isEdited?: boolean;
  editedAt?: Date;
  
  // Special message types
  donationAmount?: number;
  superChatAmount?: number;
  systemAction?: 'user_joined' | 'user_left' | 'stream_started' | 'stream_ended';
  
  // Moderation
  isModerated?: boolean;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationReason?: string;
  
  // Reactions and engagement
  reactions?: Record<string, number>; // emoji -> count
  mentions?: string[]; // mentioned userIds
  repliedToId?: string; // reply to another message
}

export interface ChatUser {
  userId: string;
  username: string;
  avatar?: string;
  role: 'viewer' | 'moderator' | 'streamer' | 'admin';
  isOnline: boolean;
  joinedAt: Date;
  
  // User engagement
  messageCount: number;
  donationTotal?: number;
  followedAt?: Date;
  subscribedAt?: Date;
  
  // Moderation
  isMuted?: boolean;
  mutedUntil?: Date;
  isBanned?: boolean;
  warnings: number;
}

export interface ChatRoom {
  streamId: string;
  streamTitle: string;
  isActive: boolean;
  viewerCount: number;
  chatEnabled: boolean;
  
  // Chat settings
  slowMode?: number; // seconds between messages
  followersOnly?: boolean;
  subscribersOnly?: boolean;
  moderatorsOnly?: boolean;
  
  // Moderation settings
  autoModeration: {
    enabled: boolean;
    profanityFilter: boolean;
    spamDetection: boolean;
    capsFilter: boolean;
    linkFilter: boolean;
  };
  
  // Chat statistics
  totalMessages: number;
  activeUsers: number;
  moderators: string[]; // userIds
  bannedUsers: string[]; // userIds
}

export interface ChatEmote {
  id: string;
  name: string;
  url: string;
  category: 'default' | 'subscriber' | 'channel' | 'global';
  animated?: boolean;
  requiresSubscription?: boolean;
}

export interface ChatCommand {
  command: string;
  description: string;
  usage: string;
  permission: 'everyone' | 'followers' | 'subscribers' | 'moderators' | 'streamer';
  enabled: boolean;
}

export interface SuperChatConfig {
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  currency: string;
  colors: Record<number, { background: string; text: string }>; // amount thresholds
}

export interface ChatSettings {
  notifications: {
    sound: boolean;
    mentions: boolean;
    donations: boolean;
    newFollowers: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    showTimestamps: boolean;
    showAvatars: boolean;
    animateMessages: boolean;
  };
  privacy: {
    hideViewerList: boolean;
    anonymousMode: boolean;
    blockPrivateMessages: boolean;
  };
}

export interface ChatFilter {
  id: string;
  type: 'word' | 'phrase' | 'regex' | 'user';
  pattern: string;
  action: 'block' | 'timeout' | 'warning' | 'auto_moderate';
  duration?: number; // for timeout in minutes
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}
