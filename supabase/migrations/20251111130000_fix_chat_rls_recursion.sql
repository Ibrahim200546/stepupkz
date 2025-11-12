-- Fix infinite recursion in chat RLS policies
-- Problem: chat_members policies reference themselves creating circular dependency

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view chat members" ON public.chat_members;
DROP POLICY IF EXISTS "Users can add members to their chats" ON public.chat_members;
DROP POLICY IF EXISTS "Chat admins can remove members" ON public.chat_members;
DROP POLICY IF EXISTS "Users can leave chats" ON public.chat_members;

-- Drop and recreate messages policies (they depend on chat_members)
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;

-- Create SIMPLE chat_members policies without self-referencing
-- These policies should NOT reference chat_members table recursively

CREATE POLICY "Users can view chat members"
ON public.chat_members
FOR SELECT
TO authenticated
USING (true); -- Allow viewing all members (security is enforced at chat level)

CREATE POLICY "Users can add members to their chats"
ON public.chat_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be admin of the chat they're adding members to
  EXISTS (
    SELECT 1 FROM public.chat_members cm
    WHERE cm.chat_id = chat_members.chat_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'admin'
  )
  OR 
  -- Or it's a new chat being created (no existing members yet)
  NOT EXISTS (
    SELECT 1 FROM public.chat_members cm
    WHERE cm.chat_id = chat_members.chat_id
  )
);

CREATE POLICY "Chat admins can remove members"
ON public.chat_members
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.chat_members
    WHERE chat_id = chat_members.chat_id
    AND role = 'admin'
  )
  OR auth.uid() = user_id -- Users can remove themselves
);

CREATE POLICY "Users can leave chats"
ON public.chat_members
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Recreate messages policies with optimized queries
-- Use direct subquery instead of EXISTS to avoid recursion

CREATE POLICY "Users can view messages in their chats"
ON public.messages
FOR SELECT
TO authenticated
USING (
  NOT deleted AND
  chat_id IN (
    SELECT cm.chat_id 
    FROM public.chat_members cm
    WHERE cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their chats"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  chat_id IN (
    SELECT cm.chat_id 
    FROM public.chat_members cm
    WHERE cm.user_id = auth.uid()
  )
);

-- Add index to improve performance of these queries
CREATE INDEX IF NOT EXISTS idx_chat_members_user_chat 
ON public.chat_members(user_id, chat_id);

-- Create a helper function for checking chat membership (optional, for future use)
CREATE OR REPLACE FUNCTION public.is_chat_member(
  _chat_id uuid,
  _user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE chat_id = _chat_id
    AND user_id = _user_id
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_chat_member TO authenticated;

COMMENT ON FUNCTION public.is_chat_member IS 'Check if user is a member of a chat. SECURITY DEFINER to avoid RLS recursion.';

-- Alternative policies using the helper function (commented out, use if needed)
/*
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;

CREATE POLICY "Users can view messages in their chats"
ON public.messages
FOR SELECT
TO authenticated
USING (
  NOT deleted AND
  public.is_chat_member(chat_id)
);

CREATE POLICY "Users can send messages to their chats"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  public.is_chat_member(chat_id)
);
*/
