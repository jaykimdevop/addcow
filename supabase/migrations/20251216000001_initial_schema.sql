-- Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for submissions
-- Allow anyone to insert (for email collection)
CREATE POLICY "Allow public insert on submissions"
  ON public.submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow only admins to read
CREATE POLICY "Allow admin read on submissions"
  ON public.submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.clerk_user_id = auth.jwt() ->> 'sub'
      AND admin_users.role = 'admin'
    )
  );

-- RLS Policies for admin_users
-- Allow only admins to read
CREATE POLICY "Allow admin read on admin_users"
  ON public.admin_users
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
CREATE POLICY "Allow admin insert on admin_users"
  ON public.admin_users
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
CREATE POLICY "Allow admin update on admin_users"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.clerk_user_id = auth.jwt() ->> 'sub'
      AND au.role = 'admin'
    )
  );

-- Allow only admins to delete
CREATE POLICY "Allow admin delete on admin_users"
  ON public.admin_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.clerk_user_id = auth.jwt() ->> 'sub'
      AND au.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON public.submissions(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_clerk_user_id ON public.admin_users(clerk_user_id);

