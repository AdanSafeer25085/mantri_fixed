-- Complete MongoDB to PostgreSQL Migration - Step 5
-- Temporarily disable RLS for authentication testing

-- Disable RLS on users and admins tables for authentication
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Also ensure anon role has proper access
GRANT SELECT ON users TO anon, authenticated;
GRANT SELECT ON admins TO anon, authenticated;
GRANT INSERT ON users TO anon, authenticated;
GRANT UPDATE ON users TO anon, authenticated;
GRANT INSERT ON admins TO anon, authenticated;
GRANT UPDATE ON admins TO anon, authenticated;

-- Make sure anon can access the tables for authentication
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Check current policies (for debugging)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('users', 'admins');