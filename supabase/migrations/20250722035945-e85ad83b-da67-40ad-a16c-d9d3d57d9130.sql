-- Create a demo Gmail profile that can be used once a user signs up with demo@gmail.com
-- We'll create this as a reference so when someone signs up with this email, they get the bonus
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  due_coins,
  welcome_bonus_claimed
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Demo Gmail User',
  'demo@gmail.com',
  10000,
  true
) ON CONFLICT (id) DO UPDATE SET
  due_coins = 10000,
  welcome_bonus_claimed = true;