
-- Allow users to create their own rewards
CREATE POLICY "Users can create their own rewards" 
  ON public.rewards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
