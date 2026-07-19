
CREATE TABLE public.markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_key TEXT NOT NULL,
  type_key TEXT NOT NULL,
  name TEXT NOT NULL,
  note TEXT,
  icon TEXT,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.markers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.markers TO authenticated;
GRANT ALL ON public.markers TO service_role;

ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read markers" ON public.markers FOR SELECT USING (true);
CREATE POLICY "public insert markers" ON public.markers FOR INSERT WITH CHECK (true);
CREATE POLICY "public update markers" ON public.markers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete markers" ON public.markers FOR DELETE USING (true);
