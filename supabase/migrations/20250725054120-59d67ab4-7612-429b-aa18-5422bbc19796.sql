
-- Remove the problematic trigger that causes infinite recursion
DROP TRIGGER IF EXISTS check_overdue_tasks ON public.tasks;

-- Also remove the mark_overdue_tasks function since it's no longer needed
DROP FUNCTION IF EXISTS public.mark_overdue_tasks();
