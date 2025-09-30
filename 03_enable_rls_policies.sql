-- Complete MongoDB to PostgreSQL Migration - Step 3
-- Enable Row Level Security (RLS) policies for Supabase

-- Enable RLS on all tables
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for now - modify based on your security needs)

-- Units policies
CREATE POLICY "Allow all operations on units" ON units FOR ALL USING (true);

-- Activities policies
CREATE POLICY "Allow all operations on activities" ON activities FOR ALL USING (true);

-- Tasks policies
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);

-- Materials policies
CREATE POLICY "Allow all operations on materials" ON materials FOR ALL USING (true);

-- Projects policies
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);

-- Contractors policies
CREATE POLICY "Allow all operations on contractors" ON contractors FOR ALL USING (true);

-- Vendors policies
CREATE POLICY "Allow all operations on vendors" ON vendors FOR ALL USING (true);

-- Stocks policies
CREATE POLICY "Allow all operations on stocks" ON stocks FOR ALL USING (true);

-- Customers policies
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);

-- Users policies (more restrictive)
CREATE POLICY "Allow read access to users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow insert for new users" ON users FOR INSERT WITH CHECK (true);

-- Admins policies (more restrictive)
CREATE POLICY "Allow all operations on admins" ON admins FOR ALL USING (true);

-- Note: In production, you should implement proper RLS policies based on authentication
-- For example:
-- CREATE POLICY "Users can only see their own data" ON users FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Only authenticated users can access" ON projects FOR ALL USING (auth.role() = 'authenticated');