-- Fix search_path security warnings for trigger functions
ALTER FUNCTION public.deduct_coins_for_task_creation() SET search_path = public;
ALTER FUNCTION public.refund_coins_for_verified_task() SET search_path = public;
ALTER FUNCTION public.handle_new_proof() SET search_path = public;