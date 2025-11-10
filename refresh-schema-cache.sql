-- Refresh the PostgREST schema cache to resolve relationship issues
NOTIFY pgrst, 'reload schema';