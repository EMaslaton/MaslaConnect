-- Create conversations table (TEXT IDs compatible with custom users table)
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY DEFAULT ('conv_' || gen_random_uuid()::text),
  participant_1_id TEXT NOT NULL,
  participant_2_id TEXT NOT NULL,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  UNIQUE(participant_1_id, participant_2_id),
  CONSTRAINT valid_participants CHECK (participant_1_id != participant_2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT ('msg_' || gen_random_uuid()::text),
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  content text NOT NULL,
  created_at timestamp DEFAULT NOW(),
  read_at timestamp
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
-- Permite a cualquier usuario autenticado ver sus conversaciones
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (true);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (true);

-- RLS Policies for messages
CREATE POLICY "Users can view messages from their conversations"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (true);
