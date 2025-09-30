-- 10. Security and Permissions Setup
-- Run this after 09_default_admin_users.sql
-- Configures final security settings and database permissions

-- Disable RLS temporarily for easier development (re-enable in production)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Grant full access for development
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON admins TO anon, authenticated;

-- Ensure all sequences are accessible
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Update all existing tables to ensure proper access
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
    LOOP
        EXECUTE format('GRANT ALL ON %I TO anon, authenticated', tbl);
    END LOOP;
END $$;

-- Create indexes for better authentication performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- Final verification query
SELECT 'Setup completed successfully. You can now login with:' as message
UNION ALL
SELECT 'Username: admin, Password: admin123 (Main Administrator)' as message
UNION ALL
SELECT 'Username: manager, Password: manager123 (Project Manager)' as message;