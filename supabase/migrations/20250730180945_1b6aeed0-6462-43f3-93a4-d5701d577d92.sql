
-- Add foreign key constraint with CASCADE behavior to handle task deletions/updates
ALTER TABLE public.rewards 
ADD CONSTRAINT rewards_task_id_fkey 
FOREIGN KEY (task_id) 
REFERENCES public.tasks(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- If the constraint already exists, we need to drop it first and recreate it
-- Drop existing constraint if it exists (this is safe as it will be recreated)
ALTER TABLE public.rewards DROP CONSTRAINT IF EXISTS rewards_task_id_fkey;

-- Add the constraint with proper CASCADE behavior
ALTER TABLE public.rewards 
ADD CONSTRAINT rewards_task_id_fkey 
FOREIGN KEY (task_id) 
REFERENCES public.tasks(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;
