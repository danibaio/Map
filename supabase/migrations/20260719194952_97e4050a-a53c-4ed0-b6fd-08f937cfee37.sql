ALTER PUBLICATION supabase_realtime ADD TABLE public.markers;
ALTER TABLE public.markers REPLICA IDENTITY FULL;