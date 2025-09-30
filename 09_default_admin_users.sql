-- 09. Default Admin Users Setup
-- Run this after 08_authentication_setup.sql
-- Creates default admin users for immediate system access

-- Insert default admin users
INSERT INTO users (email, username, full_name, password_hash, status) VALUES
('admin@construction.com', 'admin', 'System Administrator', 'admin123', 'Active'),
('manager@construction.com', 'manager', 'Project Manager', 'manager123', 'Active')
ON CONFLICT (username) DO NOTHING;

-- Insert admin records with full permissions
INSERT INTO admins (user_id, job_title, mobile, status, role, permissions, plain_password)
SELECT
    u.id,
    'System Administrator',
    '+1234567890',
    'Active',
    'main_admin',
    '["New Projects","Finance","Reports","Project Overview","Stock Management","Gantt Chart","Technical Files","Legal Files","Leads","Customers","Materials","Activities","Tasks","Contractors","Vendors","Units","Admin Management"]'::jsonb,
    'admin123'
FROM users u WHERE u.username = 'admin'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO admins (user_id, job_title, mobile, status, role, permissions, plain_password)
SELECT
    u.id,
    'Project Manager',
    '+1234567891',
    'Active',
    'admin',
    '["New Projects","Finance","Reports","Project Overview","Stock Management","Gantt Chart","Technical Files","Legal Files","Leads","Customers","Materials","Activities","Tasks","Contractors","Vendors","Units"]'::jsonb,
    'manager123'
FROM users u WHERE u.username = 'manager'
ON CONFLICT (user_id) DO NOTHING;

-- Verify the setup
SELECT
  u.username,
  u.email,
  u.full_name,
  a.role,
  a.job_title,
  'Password: ' || a.plain_password as login_info
FROM users u
JOIN admins a ON u.id = a.user_id
WHERE u.username IN ('admin', 'manager');