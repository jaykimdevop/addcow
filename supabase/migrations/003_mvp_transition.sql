-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by TEXT
);

-- Extend submissions table
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS account_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notified_at TIMESTAMP WITH TIME ZONE;

-- Enable Row Level Security for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
-- Allow only admins to read
CREATE POLICY "Allow admin read on site_settings"
  ON public.site_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.clerk_user_id = auth.jwt() ->> 'sub'
      AND au.role = 'admin'
    )
  );

-- Allow only admins to insert
CREATE POLICY "Allow admin insert on site_settings"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.clerk_user_id = auth.jwt() ->> 'sub'
      AND au.role = 'admin'
    )
  );

-- Allow only admins to update
CREATE POLICY "Allow admin update on site_settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.clerk_user_id = auth.jwt() ->> 'sub'
      AND au.role = 'admin'
    )
  );

-- Allow service role to read (for server-side access)
CREATE POLICY "Allow service role read on site_settings"
  ON public.site_settings
  FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to update (for server-side updates)
CREATE POLICY "Allow service role update on site_settings"
  ON public.site_settings
  FOR UPDATE
  TO service_role
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);
CREATE INDEX IF NOT EXISTS idx_submissions_notified ON public.submissions(notified);
CREATE INDEX IF NOT EXISTS idx_submissions_account_created ON public.submissions(account_created);

-- Initialize default site_mode
INSERT INTO public.site_settings (key, value)
VALUES ('site_mode', '"faked_door"')
ON CONFLICT (key) DO NOTHING;

