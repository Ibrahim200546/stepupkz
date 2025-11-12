-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for chat-attachments bucket
CREATE POLICY "Users can upload to their chats"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT chat_id::text 
    FROM public.chat_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view attachments in their chats"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT chat_id::text 
    FROM public.chat_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-attachments' AND
  auth.uid() = owner
);
