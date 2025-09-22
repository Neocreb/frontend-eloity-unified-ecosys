import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './schema';

// Chat conversations table
export const chat_conversations = pgTable('chat_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').default('direct'), // 'direct', 'group'
  name: text('name'),
  description: text('description'),
  avatar: text('avatar'),
  participants: text('participants').array().notNull(),
  admin_ids: text('admin_ids').array(),
  created_by: uuid('created_by').notNull(),
  last_message_id: uuid('last_message_id'),
  last_activity: timestamp('last_activity').defaultNow(),
  is_archived: boolean('is_archived').default(false),
  is_muted: boolean('is_muted').default(false),
  settings: jsonb('settings'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Chat messages table
export const chat_messages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversation_id: uuid('conversation_id').notNull(),
  sender_id: uuid('sender_id').notNull(),
  content: text('content'),
  message_type: text('message_type').default('text'), // 'text', 'image', 'video', 'audio', 'file', 'location', 'contact'
  attachments: jsonb('attachments'),
  reply_to_id: uuid('reply_to_id'),
  forwarded_from: uuid('forwarded_from'),
  is_edited: boolean('is_edited').default(false),
  edited_at: timestamp('edited_at'),
  is_deleted: boolean('is_deleted').default(false),
  deleted_at: timestamp('deleted_at'),
  read_by: jsonb('read_by'),
  delivered_to: jsonb('delivered_to'),
  reactions: jsonb('reactions'),
  mentions: text('mentions').array(),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Chat participants table
export const chat_participants = pgTable('chat_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversation_id: uuid('conversation_id').notNull(),
  user_id: uuid('user_id').notNull(),
  role: text('role').default('member'), // 'admin', 'member'
  joined_at: timestamp('joined_at').defaultNow(),
  left_at: timestamp('left_at'),
  last_read_message_id: uuid('last_read_message_id'),
  last_read_at: timestamp('last_read_at'),
  is_muted: boolean('is_muted').default(false),
  notification_settings: jsonb('notification_settings'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Chat file uploads table
export const chat_files = pgTable('chat_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  message_id: uuid('message_id').notNull(),
  filename: text('filename').notNull(),
  original_name: text('original_name').notNull(),
  file_type: text('file_type').notNull(),
  file_size: integer('file_size').notNull(),
  file_url: text('file_url').notNull(),
  thumbnail_url: text('thumbnail_url'),
  uploaded_by: uuid('uploaded_by').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// Video calls table
export const video_calls = pgTable('video_calls', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversation_id: uuid('conversation_id').notNull(),
  initiator_id: uuid('initiator_id').notNull(),
  call_type: text('call_type').notNull(), // 'audio', 'video'
  participants: jsonb('participants'),
  status: text('status').default('initiated'), // 'initiated', 'ringing', 'active', 'ended', 'missed'
  start_time: timestamp('start_time'),
  end_time: timestamp('end_time'),
  duration: integer('duration'), // in seconds
  recording_url: text('recording_url'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow(),
});

// Relations
export const chatConversationsRelations = relations(chat_conversations, ({ one, many }) => ({
  creator: one(users, {
    fields: [chat_conversations.created_by],
    references: [users.id],
  }),
  lastMessage: one(chat_messages, {
    fields: [chat_conversations.last_message_id],
    references: [chat_messages.id],
  }),
  messages: many(chat_messages),
  participants: many(chat_participants),
  videoCalls: many(video_calls),
}));

export const chatMessagesRelations = relations(chat_messages, ({ one, many }) => ({
  conversation: one(chat_conversations, {
    fields: [chat_messages.conversation_id],
    references: [chat_conversations.id],
  }),
  sender: one(users, {
    fields: [chat_messages.sender_id],
    references: [users.id],
  }),
  replyTo: one(chat_messages, {
    fields: [chat_messages.reply_to_id],
    references: [chat_messages.id],
    relationName: 'messageReplies',
  }),
  replies: many(chat_messages, { relationName: 'messageReplies' }),
  files: many(chat_files),
}));

export const chatParticipantsRelations = relations(chat_participants, ({ one }) => ({
  conversation: one(chat_conversations, {
    fields: [chat_participants.conversation_id],
    references: [chat_conversations.id],
  }),
  user: one(users, {
    fields: [chat_participants.user_id],
    references: [users.id],
  }),
  lastReadMessage: one(chat_messages, {
    fields: [chat_participants.last_read_message_id],
    references: [chat_messages.id],
  }),
}));

export const chatFilesRelations = relations(chat_files, ({ one }) => ({
  message: one(chat_messages, {
    fields: [chat_files.message_id],
    references: [chat_messages.id],
  }),
  uploader: one(users, {
    fields: [chat_files.uploaded_by],
    references: [users.id],
  }),
}));

export const videoCallsRelations = relations(video_calls, ({ one }) => ({
  conversation: one(chat_conversations, {
    fields: [video_calls.conversation_id],
    references: [chat_conversations.id],
  }),
  initiator: one(users, {
    fields: [video_calls.initiator_id],
    references: [users.id],
  }),
}));
