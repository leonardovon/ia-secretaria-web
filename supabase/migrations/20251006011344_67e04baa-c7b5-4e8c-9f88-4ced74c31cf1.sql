-- Fix security issue: Update view to use security_invoker = true
-- This ensures RLS policies are enforced based on the querying user, not the view creator
ALTER VIEW public.clinica_documents SET (security_invoker = true);