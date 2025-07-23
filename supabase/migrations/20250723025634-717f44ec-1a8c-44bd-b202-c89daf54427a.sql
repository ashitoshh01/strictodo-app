
-- Drop the existing storage policies that are causing issues
DROP POLICY IF EXISTS "Users can upload their own proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own proofs" ON storage.objects;

-- Create new, more permissive storage policies for the task-proofs bucket
CREATE POLICY "Allow authenticated users to upload task proofs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'task-proofs' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated users to view task proofs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'task-proofs' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated users to update task proofs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'task-proofs' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated users to delete task proofs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'task-proofs' AND 
    auth.role() = 'authenticated'
  );
