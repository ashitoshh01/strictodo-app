
-- Ensure the trigger for deducting coins when creating tasks exists and works properly
DROP TRIGGER IF EXISTS on_task_created ON public.tasks;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.deduct_coins_for_task()
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

-- Create the trigger to fire when a new task is inserted
CREATE TRIGGER on_task_created
  BEFORE INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.deduct_coins_for_task();

-- Also create a function to properly return coins when task is verified
CREATE OR REPLACE FUNCTION public.return_coins_for_verified_task()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only return coins if status changed from something else to 'verified'
  IF OLD.status != 'verified' AND NEW.status = 'verified' THEN
    UPDATE public.profiles 
    SET due_coins = due_coins + NEW.due_coins,
        updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_task_verified ON public.tasks;
CREATE TRIGGER on_task_verified
  AFTER UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.return_coins_for_verified_task();
