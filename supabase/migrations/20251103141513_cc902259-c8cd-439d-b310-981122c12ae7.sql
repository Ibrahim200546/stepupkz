-- Create chats table
CREATE TABLE public.chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('direct', 'group')),
  title text,
  avatar text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_members table
CREATE TABLE public.chat_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at timestamptz DEFAULT now(),
  mute_until timestamptz NULL,
  UNIQUE(chat_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text,
  content_format text DEFAULT 'plain' CHECK (content_format IN ('plain', 'markdown')),
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  edited_at timestamptz NULL,
  deleted boolean DEFAULT false
);

-- Create message_reads table
CREATE TABLE public.message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create message_reports table
CREATE TABLE public.message_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  reported_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz NULL
);

-- Create user_presence table for online status
CREATE TABLE public.user_presence (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  last_seen timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_messages_chat_created ON public.messages(chat_id, created_at DESC);
CREATE INDEX idx_chat_members_user ON public.chat_members(user_id);
CREATE INDEX idx_chat_members_chat ON public.chat_members(chat_id);
CREATE INDEX idx_message_reads_message ON public.message_reads(message_id);
CREATE INDEX idx_message_reads_user ON public.message_reads(user_id);
CREATE INDEX idx_message_reports_status ON public.message_reports(status);
CREATE INDEX idx_chats_updated ON public.chats(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats
CREATE POLICY "Users can view chats they are members of"
  ON public.chats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members
      WHERE chat_members.chat_id = chats.id
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chat admins can update chats"
  ON public.chats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members
      WHERE chat_members.chat_id = chats.id
      AND chat_members.user_id = auth.uid()
      AND chat_members.role = 'admin'
    )
  );

-- RLS Policies for chat_members
CREATE POLICY "Users can view members of their chats"
  ON public.chat_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = chat_members.chat_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Chat admins can add members"
  ON public.chat_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_members
      WHERE chat_members.chat_id = chat_members.chat_id
      AND chat_members.user_id = auth.uid()
      AND chat_members.role = 'admin'
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Chat admins can remove members"
  ON public.chat_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = chat_members.chat_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
    OR auth.uid() = user_id
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their chats"
  ON public.messages FOR SELECT
  USING (
    NOT deleted AND EXISTS (
      SELECT 1 FROM public.chat_members
      WHERE chat_members.chat_id = messages.chat_id
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their chats"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_members
      WHERE chat_members.chat_id = messages.chat_id
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can edit their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);

-- RLS Policies for message_reads
CREATE POLICY "Users can view read receipts in their chats"
  ON public.message_reads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_reads.message_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON public.message_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for message_reports
CREATE POLICY "Users can create reports"
  ON public.message_reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view their own reports"
  ON public.message_reports FOR SELECT
  USING (auth.uid() = reported_by);

CREATE POLICY "Admins can view all reports"
  ON public.message_reports FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update reports"
  ON public.message_reports FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_presence
CREATE POLICY "Users can view all presence"
  ON public.user_presence FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own presence"
  ON public.user_presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence status"
  ON public.user_presence FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update chats.updated_at when new message is sent
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats
  SET updated_at = NEW.created_at
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_chat_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_timestamp();

-- Function to get or create direct chat between two users
CREATE OR REPLACE FUNCTION get_or_create_direct_chat(other_user_id uuid)
RETURNS uuid AS $$
DECLARE
  chat_id uuid;
BEGIN
  -- Try to find existing direct chat
  SELECT c.id INTO chat_id
  FROM public.chats c
  WHERE c.type = 'direct'
  AND EXISTS (
    SELECT 1 FROM public.chat_members cm1
    WHERE cm1.chat_id = c.id AND cm1.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.chat_members cm2
    WHERE cm2.chat_id = c.id AND cm2.user_id = other_user_id
  )
  AND (
    SELECT COUNT(*) FROM public.chat_members cm
    WHERE cm.chat_id = c.id
  ) = 2;

  -- If not found, create new chat
  IF chat_id IS NULL THEN
    INSERT INTO public.chats (type, created_by)
    VALUES ('direct', auth.uid())
    RETURNING id INTO chat_id;

    -- Add both users as members
    INSERT INTO public.chat_members (chat_id, user_id, role)
    VALUES (chat_id, auth.uid(), 'member'),
           (chat_id, other_user_id, 'member');
  END IF;

  RETURN chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable Realtime for all chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;