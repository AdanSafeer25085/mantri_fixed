-- Create admin users for authentication
-- Run this after running the previous SQL files

-- First, insert users into users table
INSERT INTO users (email, username, full_name, password_hash, status) VALUES
('admin@construction.com', 'admin', 'System Administrator', 'admin123', 'Active'),
('manager@construction.com', 'manager', 'Project Manager', 'manager123', 'Active')
ON CONFLICT (username) DO NOTHING;

-- Get the user IDs for admin records
DO $$
DECLARE
    admin_user_id UUID;
    manager_user_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM users WHERE username = 'admin';

    -- Get manager user ID
    SELECT id INTO manager_user_id FROM users WHERE username = 'manager';

    -- Insert admin records
    INSERT INTO admins (
        user_id,
        job_title,
        mobile,
        status,
        role,
        permissions,
        plain_password
    ) VALUES
    (
        admin_user_id,
        'System Administrator',
        '+1234567890',
        'Active',
        'main_admin',
        '["New Projects","Finance","Reports","Project Overview","Stock Management","Gantt Chart","Technical Files","Legal Files","Leads","Customers","Materials","Activities","Tasks","Contractors","Vendors","Units","Admin Management"]'::jsonb,
        'admin123'
    ),
    (
        manager_user_id,
        'Project Manager',
        '+1234567891',
        'Active',
        'admin',
        '["New Projects","Finance","Reports","Project Overview","Stock Management","Gantt Chart","Technical Files","Legal Files","Leads","Customers","Materials","Activities","Tasks","Contractors","Vendors","Units"]'::jsonb,
        'manager123'
    )
    ON CONFLICT (user_id) DO NOTHING;
END $$;

-- Make sure RLS policies allow authentication
-- Drop any restrictive policies that might block authentication
DROP POLICY IF EXISTS "Allow authentication queries" ON users;
DROP POLICY IF EXISTS "Allow admin authentication" ON admins;

-- Create permissive authentication policies
CREATE POLICY "Enable authentication access" ON users
FOR SELECT
USING (true);

CREATE POLICY "Enable admin access" ON admins
FOR ALL
USING (true);

-- Ensure anon role can access these tables for authentication
GRANT SELECT ON users TO anon, authenticated;
GRANT SELECT ON admins TO anon, authenticated;

COMMENT ON TABLE users IS 'User authentication data';
COMMENT ON TABLE admins IS 'Admin user permissions and details';