-- Fix infinite recursion in chat_members RLS policies
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view members of their chats" ON public.chat_members;
DROP POLICY IF EXISTS "Chat admins can add members" ON public.chat_members;
DROP POLICY IF EXISTS "Chat admins can remove members" ON public.chat_members;

-- Create non-recursive policies using EXISTS with proper subqueries
CREATE POLICY "Users can view members of their chats"
ON public.chat_members
FOR SELECT
TO authenticated
USING (
  chat_id IN (
    SELECT chat_id 
    FROM public.chat_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Chat admins can add members"
ON public.chat_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- User can add themselves OR user is admin of the chat
  (auth.uid() = user_id) OR
  (chat_id IN (
    SELECT chat_id 
    FROM public.chat_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "Chat admins can remove members"
ON public.chat_members
FOR DELETE
TO authenticated
USING (
  -- User can remove themselves OR user is admin of the chat
  (auth.uid() = user_id) OR
  (chat_id IN (
    SELECT chat_id 
    FROM public.chat_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

-- Fix messages RLS policies to avoid recursion
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;

CREATE POLICY "Users can view messages in their chats"
ON public.messages
FOR SELECT
TO authenticated
USING (
  NOT deleted AND
  chat_id IN (
    SELECT chat_id 
    FROM public.chat_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their chats"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  chat_id IN (
    SELECT chat_id 
    FROM public.chat_members 
    WHERE user_id = auth.uid()
  )
);

-- Add constraint to ensure nickname is lowercase
ALTER TABLE public.profiles 
ADD CONSTRAINT nickname_lowercase_check 
CHECK (nickname = lower(nickname));

-- Create function to automatically assign vendor role
CREATE OR REPLACE FUNCTION public.assign_vendor_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if vendor role already exists
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.owner_id AND role = 'vendor'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.owner_id, 'vendor');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to assign vendor role when vendor is created
DROP TRIGGER IF EXISTS assign_vendor_role_trigger ON public.vendors;
CREATE TRIGGER assign_vendor_role_trigger
AFTER INSERT ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.assign_vendor_role();