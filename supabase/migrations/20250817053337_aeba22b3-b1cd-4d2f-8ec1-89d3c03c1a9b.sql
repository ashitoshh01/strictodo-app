
-- First, let's check what the current constraint allows and update it to include all valid statuses
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Add the updated constraint with all valid status values
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('pending', 'pending-verification', 'verified', 'failed'));
