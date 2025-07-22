-- Add due coins system to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS due_coins INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS welcome_bonus_claimed BOOLEAN DEFAULT FALSE;

-- Update existing profiles to have 100 coins as starting amount
UPDATE public.profiles 
SET due_coins = COALESCE(due_coins, 100),
    welcome_bonus_claimed = COALESCE(welcome_bonus_claimed, false);

-- Update the handle_new_user function to give new users 100 coins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, due_coins, welcome_bonus_claimed)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    100,
    false
  );
  RETURN NEW;
END;
$$;

-- Create demo guest account in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222'::uuid,
  'authenticated',
  'authenticated',
  'guest@doordue.com',
  crypt('guest@123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Guest User"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create profile for the guest demo user with 10,000 due coins
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  due_coins,
  welcome_bonus_claimed,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Guest User',
  'guest@doordue.com',
  10000,
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  due_coins = EXCLUDED.due_coins,
  welcome_bonus_claimed = EXCLUDED.welcome_bonus_claimed;