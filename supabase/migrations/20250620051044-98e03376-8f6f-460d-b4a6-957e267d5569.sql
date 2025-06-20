
-- Create tasks table to persist user tasks
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  money_at_stake DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verified', 'failed')),
  proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks" 
  ON public.tasks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
  ON public.tasks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
  ON public.tasks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create rewards table for storing earned coupons
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  task_id UUID REFERENCES public.tasks NOT NULL,
  coupon_code TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_scratched BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for rewards
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for rewards
CREATE POLICY "Users can view their own rewards" 
  ON public.rewards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards" 
  ON public.rewards 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create storage bucket for proof uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('task-proofs', 'task-proofs', true);

-- Create storage policies
CREATE POLICY "Users can upload their own proofs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'task-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'task-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own proofs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'task-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own proofs" ON storage.objects
  FOR DELETE USING (bucket_id = 'task-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
