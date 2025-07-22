-- Insert default Gmail demo account
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
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@gmail.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Demo Gmail User"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create profile for the Gmail demo user with 10,000 due coins
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  due_coins,
  welcome_bonus_claimed
) 
SELECT 
  u.id,
  'Demo Gmail User',
  'demo@gmail.com',
  10000,
  true
FROM auth.users u 
WHERE u.email = 'demo@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  due_coins = 10000,
  welcome_bonus_claimed = true;