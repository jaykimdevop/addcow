-- Add user information columns to admin_users table
ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- Create index for username lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);

-- Add comment for documentation
COMMENT ON COLUMN public.admin_users.first_name IS 'User first name from Clerk';
COMMENT ON COLUMN public.admin_users.last_name IS 'User last name from Clerk';
COMMENT ON COLUMN public.admin_users.email IS 'User email address from Clerk';
COMMENT ON COLUMN public.admin_users.username IS 'User username from Clerk';
COMMENT ON COLUMN public.admin_users.image_url IS 'User profile image URL from Clerk';
COMMENT ON COLUMN public.admin_users.updated_at IS 'Last update timestamp';
