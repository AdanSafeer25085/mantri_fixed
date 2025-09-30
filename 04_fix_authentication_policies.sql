-- Complete MongoDB to PostgreSQL Migration - Step 4
-- Fix authentication policies to allow login queries

-- Drop existing restrictive policies on users table
DROP POLICY IF EXISTS "Allow read access to users" ON users;
DROP POLICY IF EXISTS "Allow insert for new users" ON users;

-- Create more permissive policies for authentication
CREATE POLICY "Allow authentication queries" ON users FOR SELECT USING (true);
CREATE POLICY "Allow user creation" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow user updates" ON users FOR UPDATE USING (true);

-- Also ensure admins table is accessible for authentication
DROP POLICY IF EXISTS "Allow all operations on admins" ON admins;
CREATE POLICY "Allow admin authentication" ON admins FOR ALL USING (true);

-- Make sure we can read from users table for authentication
GRANT SELECT ON users TO anon;
GRANT SELECT ON admins TO anon;

-- Add helpful comment
COMMENT ON POLICY "Allow authentication queries" ON users IS 'Allows authentication queries for login functionality';