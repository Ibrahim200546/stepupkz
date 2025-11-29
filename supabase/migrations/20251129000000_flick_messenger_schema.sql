-- FlickMassege Schema Migration for Supabase
-- Based on Prisma schema from FlickMassege project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FLICK MESSENGER TABLES
-- =====================================================

-- Users table (extending existing profiles if needed)
CREATE TABLE IF NOT EXISTS flick_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    relationship_status TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts table (friend list)
CREATE TABLE IF NOT EXISTS flick_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES flick_users(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES flick_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, contact_id)
);

-- Chats table
CREATE TABLE IF NOT EXISTS flick_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    is_group BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat members table
CREATE TABLE IF NOT EXISTS flick_chat_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES flick_chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES flick_users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS flick_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT,
    type TEXT DEFAULT 'TEXT' CHECK (type IN ('TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'STICKER', 'VOICE')),
    file_url TEXT,
    sender_id UUID NOT NULL REFERENCES flick_users(id) ON DELETE CASCADE,
    chat_id UUID NOT NULL REFERENCES flick_chats(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message status table
CREATE TABLE IF NOT EXISTS flick_message_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES flick_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES flick_users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'SENT' CHECK (status IN ('SENT', 'DELIVERED', 'READ')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_flick_contacts_user_id ON flick_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_flick_contacts_contact_id ON flick_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_flick_chat_members_chat_id ON flick_chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_flick_chat_members_user_id ON flick_chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_flick_messages_chat_id ON flick_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_flick_messages_sender_id ON flick_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_flick_messages_created_at ON flick_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_flick_message_status_message_id ON flick_message_status(message_id);
CREATE INDEX IF NOT EXISTS idx_flick_message_status_user_id ON flick_message_status(user_id);

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

ALTER TABLE flick_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flick_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE flick_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE flick_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE flick_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE flick_message_status ENABLE ROW LEVEL SECURITY;

-- Users: Can read all users, update only their own profile
CREATE POLICY "Users can read all profiles"
    ON flick_users FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON flick_users FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Contacts: Can manage their own contacts
CREATE POLICY "Users can manage own contacts"
    ON flick_contacts FOR ALL
    USING (auth.uid()::text = user_id::text);

-- Chat members: Can read chats they're member of
CREATE POLICY "Users can read chats they're member of"
    ON flick_chat_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM flick_chat_members cm
            WHERE cm.chat_id = flick_chat_members.chat_id
            AND cm.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can join chats"
    ON flick_chat_members FOR INSERT
    WITH CHECK (true);

-- Chats: Can read chats where user is a member
CREATE POLICY "Users can read their chats"
    ON flick_chats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM flick_chat_members cm
            WHERE cm.chat_id = flick_chats.id
            AND cm.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can create chats"
    ON flick_chats FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their chats"
    ON flick_chats FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM flick_chat_members cm
            WHERE cm.chat_id = flick_chats.id
            AND cm.user_id::text = auth.uid()::text
        )
    );

-- Messages: Can read messages in chats they're member of
CREATE POLICY "Users can read messages in their chats"
    ON flick_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM flick_chat_members cm
            WHERE cm.chat_id = flick_messages.chat_id
            AND cm.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can send messages to their chats"
    ON flick_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM flick_chat_members cm
            WHERE cm.chat_id = chat_id
            AND cm.user_id::text = auth.uid()::text
        )
    );

-- Message status: Can manage their own read status
CREATE POLICY "Users can manage message status"
    ON flick_message_status FOR ALL
    USING (auth.uid()::text = user_id::text);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_flick_users_updated_at BEFORE UPDATE ON flick_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flick_chats_updated_at BEFORE UPDATE ON flick_chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flick_messages_updated_at BEFORE UPDATE ON flick_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flick_message_status_updated_at BEFORE UPDATE ON flick_message_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get unread message count for a chat
CREATE OR REPLACE FUNCTION get_unread_count(p_chat_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM flick_messages m
        WHERE m.chat_id = p_chat_id
        AND m.sender_id != p_user_id
        AND NOT EXISTS (
            SELECT 1 FROM flick_message_status ms
            WHERE ms.message_id = m.id
            AND ms.user_id = p_user_id
            AND ms.status = 'READ'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REALTIME PUBLICATIONS
-- =====================================================

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE flick_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE flick_message_status;
ALTER PUBLICATION supabase_realtime ADD TABLE flick_users;
ALTER PUBLICATION supabase_realtime ADD TABLE flick_chat_members;

-- =====================================================
-- STORAGE BUCKETS (if not exists)
-- =====================================================

-- Create bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('flick-attachments', 'flick-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload to flick-attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'flick-attachments');

CREATE POLICY "Anyone can read flick-attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'flick-attachments');

-- =====================================================
-- DEMO DATA (Optional - comment out if not needed)
-- =====================================================

-- You can add demo users and chats here if needed
-- INSERT INTO flick_users (email, username, password_hash) VALUES ...
