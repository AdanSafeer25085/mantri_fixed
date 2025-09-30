-- Add missing tables: leads and files
-- Run this after running the first 5 SQL files

-- Create leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    primary_contact VARCHAR(20),
    secondary_contact VARCHAR(20),
    aadhar_no VARCHAR(20),
    address TEXT,
    budget DECIMAL(15,2),
    project VARCHAR(255), -- Project name as string (matches MongoDB)
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    size BIGINT,
    type VARCHAR(100),
    category VARCHAR(50) NOT NULL, -- 'legal', 'technical', etc.
    project VARCHAR(255), -- Project name as string
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    activity VARCHAR(255), -- Activity name for technical files
    uploaded_by VARCHAR(255),
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create finances table (also missing)
CREATE TABLE finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project VARCHAR(255),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    category VARCHAR(100),
    description TEXT,
    amount DECIMAL(15,2),
    date DATE,
    type VARCHAR(50), -- 'income', 'expense', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_leads_project ON leads(project);
CREATE INDEX idx_files_category ON files(category);
CREATE INDEX idx_files_project ON files(project);
CREATE INDEX idx_finances_project ON finances(project);
CREATE INDEX idx_finances_date ON finances(date);

-- Add triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finances_updated_at BEFORE UPDATE ON finances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add sample data for leads
INSERT INTO leads (full_name, primary_contact, secondary_contact, aadhar_no, address, budget, project, status) VALUES
('Rajesh Kumar', '9876543210', '9876543211', '123456789012', '123 Main St, Mumbai', 1500000.00, 'Residential Complex A', 'Active'),
('Priya Sharma', '9876543212', '9876543213', '123456789013', '456 Park Ave, Delhi', 2000000.00, 'Commercial Plaza B', 'Active'),
('Amit Patel', '9876543214', '9876543215', '123456789014', '789 Garden Rd, Pune', 1200000.00, 'Villa Project C', 'Contacted'),
('Sunita Singh', '9876543216', '9876543217', '123456789015', '321 Hill View, Bangalore', 1800000.00, 'Apartment Complex D', 'Active');

COMMENT ON TABLE leads IS 'Customer leads and prospects';
COMMENT ON TABLE files IS 'File attachments for legal and technical documents';
COMMENT ON TABLE finances IS 'Financial records and transactions';