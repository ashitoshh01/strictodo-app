
-- Update the existing coin deduction trigger to work on task creation
DROP TRIGGER IF EXISTS deduct_coins_for_task ON tasks;
DROP FUNCTION IF EXISTS deduct_coins_for_task();

-- Create improved function for coin deduction on task creation
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

-- Create trigger for coin deduction on task creation
CREATE TRIGGER deduct_coins_for_task_creation
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_coins_for_task_creation();

-- Update the coin return function to only return staked coins (no bonus)
DROP TRIGGER IF EXISTS return_coins_for_verified_task ON tasks;
DROP FUNCTION IF EXISTS return_coins_for_verified_task();
DROP FUNCTION IF EXISTS refund_coins_for_verified_task();

-- Create function to return only staked coins when task is verified
CREATE OR REPLACE FUNCTION public.return_staked_coins_for_verified_task()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only return staked coins if status changed to 'verified'
  IF OLD.status != 'verified' AND NEW.status = 'verified' THEN
    UPDATE public.profiles 
    SET due_coins = due_coins + NEW.due_coins,
        updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to return staked coins when task is verified
CREATE TRIGGER return_staked_coins_for_verified_task
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.return_staked_coins_for_verified_task();

-- Update rewards table to have smaller reward amounts (1-2 coins)
-- Add a function to add reward coins to balance when coupon is scratched
CREATE OR REPLACE FUNCTION public.add_reward_coins_to_balance()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only add coins if coupon was just scratched
  IF OLD.is_scratched = false AND NEW.is_scratched = true THEN
    UPDATE public.profiles 
    SET due_coins = due_coins + NEW.amount,
        updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to add reward coins when coupon is scratched
CREATE TRIGGER add_reward_coins_to_balance
  AFTER UPDATE ON public.rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.add_reward_coins_to_balance();
