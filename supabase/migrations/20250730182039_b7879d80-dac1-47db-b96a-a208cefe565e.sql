
-- First, let's drop the existing foreign key constraint
ALTER TABLE public.rewards DROP CONSTRAINT IF EXISTS rewards_task_id_fkey;

-- Now recreate it with CASCADE options to automatically handle deletions
ALTER TABLE public.rewards 
ADD CONSTRAINT rewards_task_id_fkey 
FOREIGN KEY (task_id) 
REFERENCES public.tasks(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;
