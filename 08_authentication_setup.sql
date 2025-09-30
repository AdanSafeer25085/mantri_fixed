-- 08. Authentication Setup for Construction Management System
-- Run this after completing all previous table setups (01-07)
-- This enables secure user authentication and admin management

-- Create authentication function for secure login
CREATE OR REPLACE FUNCTION authenticate_user(
  p_username_or_email TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  full_name TEXT,
  status TEXT,
  admin_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.username,
    u.full_name,
    u.status,
    CASE
      WHEN a.id IS NOT NULL THEN
        jsonb_build_object(
          'id', a.id,
          'user_id', a.user_id,
          'job_title', a.job_title,
          'mobile', a.mobile,
          'status', a.status,
          'role', a.role,
          'permissions', a.permissions
        )
      ELSE NULL
    END as admin_data
  FROM users u
  LEFT JOIN admins a ON u.id = a.user_id
  WHERE (u.username = p_username_or_email OR u.email = p_username_or_email)
    AND u.password_hash = p_password
    AND u.status = 'Active'
  LIMIT 1;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO anon, authenticated;

-- Setup Row Level Security policies for authentication
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Enable read access for authentication" ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for admin data" ON admins
  FOR SELECT
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON users TO anon, authenticated;
GRANT SELECT ON admins TO anon, authenticated;