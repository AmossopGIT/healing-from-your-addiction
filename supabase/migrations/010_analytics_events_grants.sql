-- analytics_events was created after migration 007 table grants

GRANT ALL ON TABLE public.analytics_events TO service_role;
GRANT SELECT ON TABLE public.analytics_events TO authenticated;
