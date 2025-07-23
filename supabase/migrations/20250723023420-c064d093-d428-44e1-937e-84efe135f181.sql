
-- Add a function to handle coin deduction when creating tasks
CREATE OR REPLACE FUNCTION public.deduct_coins_for_task()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has enough coins
  IF (SELECT due_coins FROM public.profiles WHERE id = NEW.user_id) < NEW.due_coins THEN
    RAISE EXCEPTION 'Insufficient due coins to create this task';
  END IF;
  
  -- Deduct coins from user's profile
  UPDATE public.profiles 
  SET due_coins = due_coins - NEW.due_coins,
      updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically deduct coins when task is created
CREATE TRIGGER deduct_coins_on_task_creation
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_coins_for_task();

-- Add a function to refund coins when task is verified (optional, for better UX)
CREATE OR REPLACE FUNCTION public.refund_coins_for_verified_task()
RETURNS TRIGGER AS $$
BEGIN
  -- Only refund if status changed from something else to 'verified'
  IF OLD.status != 'verified' AND NEW.status = 'verified' THEN
    UPDATE public.profiles 
    SET due_coins = due_coins + NEW.due_coins,
        updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refund coins when task is verified
CREATE TRIGGER refund_coins_on_task_verification
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.refund_coins_for_verified_task();
