-- Add due coins system to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS due_coins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS welcome_bonus_claimed BOOLEAN DEFAULT FALSE;

-- Update existing profiles to have 0 coins if they don't have any
UPDATE public.profiles 
SET due_coins = 0 
WHERE due_coins IS NULL;

-- Create demo Gmail user account manually with known UUID
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  due_coins,
  welcome_bonus_claimed,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Demo Gmail User',
  'demo@gmail.com',
  10000,
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  due_coins = EXCLUDED.due_coins,
  welcome_bonus_claimed = EXCLUDED.welcome_bonus_claimed;