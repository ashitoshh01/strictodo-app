-- =====================================================
-- FIX 1: Coin Deduction Trigger
-- =====================================================
-- Drop old triggers and functions if they exist
DROP TRIGGER IF EXISTS deduct_coins_for_task_creation ON public.tasks;
DROP TRIGGER IF EXISTS on_task_created ON public.tasks;
DROP TRIGGER IF EXISTS deduct_coins_on_task_creation ON public.tasks;
DROP FUNCTION IF EXISTS deduct_coins_for_task_creation() CASCADE;
DROP FUNCTION IF EXISTS deduct_coins_for_task() CASCADE;

-- Create function to deduct coins when task is created
CREATE OR REPLACE FUNCTION public.deduct_coins_for_task_creation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  user_coins INTEGER;
BEGIN
  -- Get current user coins
  SELECT due_coins INTO user_coins 
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Check if user has enough coins
  IF user_coins < NEW.due_coins THEN
    RAISE EXCEPTION 'Insufficient coins. You have % coins but need %', user_coins, NEW.due_coins;
  END IF;
  
  -- Deduct coins from user's profile
  UPDATE public.profiles 
  SET due_coins = due_coins - NEW.due_coins,
      updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for coin deduction (BEFORE INSERT so it runs before task is created)
CREATE TRIGGER deduct_coins_for_task_creation
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_coins_for_task_creation();

-- =====================================================
-- FIX 2: Coin Refund When Task is Verified
-- =====================================================
DROP TRIGGER IF EXISTS refund_coins_for_verified_task ON public.tasks;
DROP FUNCTION IF EXISTS refund_coins_for_verified_task() CASCADE;
DROP FUNCTION IF EXISTS return_coins_for_verified_task() CASCADE;

-- Create function to refund coins + reward when task is verified
CREATE OR REPLACE FUNCTION public.refund_coins_for_verified_task()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  reward_amount INTEGER;
  random_chance INTEGER;
BEGIN
  -- Only refund if status changed to 'verified'
  IF OLD.status != 'verified' AND NEW.status = 'verified' THEN
    -- Return the original staked coins
    UPDATE public.profiles 
    SET due_coins = due_coins + NEW.due_coins,
        updated_at = now()
    WHERE id = NEW.user_id;
    
    -- Calculate reward (1 or 2 coins normally, 5 coins for 1 in 50 chance)
    random_chance := floor(random() * 50) + 1;
    
    IF random_chance = 1 THEN
      reward_amount := 5; -- 1 in 50 chance for 5 coins
    ELSE
      reward_amount := floor(random() * 2) + 1; -- 1 or 2 coins
    END IF;
    
    -- Add reward to user's balance
    UPDATE public.profiles 
    SET due_coins = due_coins + reward_amount,
        updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for coin refund
CREATE TRIGGER refund_coins_for_verified_task
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  WHEN (NEW.status = 'verified' AND OLD.status != 'verified')
  EXECUTE FUNCTION public.refund_coins_for_verified_task();

-- =====================================================
-- FIX 3: AI Verification Trigger
-- =====================================================
DROP TRIGGER IF EXISTS on_new_proof ON public.tasks;
DROP FUNCTION IF EXISTS handle_new_proof() CASCADE;

-- Create function to call edge function for verification
CREATE OR REPLACE FUNCTION public.handle_new_proof()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger verification when status changes to 'pending-verification'
  IF NEW.status = 'pending-verification' AND (OLD IS NULL OR OLD.status != 'pending-verification') THEN
    -- Call the verify-proof edge function
    PERFORM net.http_post(
      url := 'https://gnzxmpqnjcuutbjatemc.supabase.co/functions/v1/verify-proof',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.jwt.claim.sub', true)
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires when proof is submitted
CREATE TRIGGER on_new_proof
  AFTER INSERT OR UPDATE OF status ON public.tasks
  FOR EACH ROW
  WHEN (NEW.status = 'pending-verification')
  EXECUTE FUNCTION public.handle_new_proof();