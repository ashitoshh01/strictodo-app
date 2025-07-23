
-- Rename the column from money_at_stake to due_coins in the tasks table
ALTER TABLE public.tasks 
RENAME COLUMN money_at_stake TO due_coins;
