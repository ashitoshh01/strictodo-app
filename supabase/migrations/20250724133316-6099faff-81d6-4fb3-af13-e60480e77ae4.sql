
-- First, let's create a trigger to automatically mark overdue tasks as failed
CREATE OR REPLACE FUNCTION public.mark_overdue_tasks()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update overdue tasks to failed status
  UPDATE public.tasks 
  SET status = 'failed', updated_at = now()
  WHERE due_date < now() 
    AND status = 'pending';
  
  RETURN NULL;
END;
$function$;

-- Create a trigger that runs periodically to check for overdue tasks
-- We'll use a simple approach where we check on any task update
CREATE OR REPLACE TRIGGER check_overdue_tasks
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.mark_overdue_tasks();

-- Fix the welcome bonus logic - ensure new users start with 0 coins
-- and only get 100 when they claim the bonus
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, due_coins, welcome_bonus_claimed)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    0,  -- Start with 0 coins instead of 100
    false
  );
  RETURN NEW;
END;
$function$;

-- Update the welcome bonus claim function to properly add 100 coins
CREATE OR REPLACE FUNCTION public.claim_welcome_bonus(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Only allow claiming if not already claimed
  UPDATE public.profiles 
  SET due_coins = due_coins + 100,
      welcome_bonus_claimed = true,
      updated_at = now()
  WHERE id = user_id 
    AND welcome_bonus_claimed = false;
END;
$function$;

-- Also fix the coin deduction trigger to ensure it works properly
CREATE OR REPLACE FUNCTION public.deduct_coins_for_task()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  user_coins INTEGER;
BEGIN
  -- Get current user coins
  SELECT due_coins INTO user_coins 
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Check if user has enough coins
  IF user_coins < NEW.due_coins THEN
    RAISE EXCEPTION 'Insufficient due coins to create this task. You have % coins but need %', user_coins, NEW.due_coins;
  END IF;
  
  -- Deduct coins from user's profile
  UPDATE public.profiles 
  SET due_coins = due_coins - NEW.due_coins,
      updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists for coin deduction
DROP TRIGGER IF EXISTS deduct_coins_on_task_creation ON public.tasks;
CREATE TRIGGER deduct_coins_on_task_creation
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_coins_for_task();
