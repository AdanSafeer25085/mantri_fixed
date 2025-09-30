-- Complete MongoDB to PostgreSQL Migration - Step 2
-- Insert sample data that matches the main project structure

-- 1. Insert Units (Foundation data)
INSERT INTO units (name, status) VALUES
('kg', 'Active'),
('tonnes', 'Active'),
('meters', 'Active'),
('sq ft', 'Active'),
('cu ft', 'Active'),
('pieces', 'Active'),
('bags', 'Active'),
('liters', 'Active');

-- 2. Insert Activities (Core work categories)
INSERT INTO activities (title, status) VALUES
('Foundation Work', 'Active'),
('Structure Work', 'Active'),
('Masonry Work', 'Active'),
('Electrical Work', 'Active'),
('Plumbing Work', 'Active'),
('Flooring Work', 'Active'),
('Painting Work', 'Active'),
('Finishing Work', 'Active');

-- 3. Insert Materials (Linked to activities and units)
INSERT INTO materials (activity_id, name, unit_id, status) VALUES
-- Foundation Work materials
((SELECT id FROM activities WHERE title = 'Foundation Work'), 'Cement', (SELECT id FROM units WHERE name = 'bags'), 'Active'),
((SELECT id FROM activities WHERE title = 'Foundation Work'), 'Sand', (SELECT id FROM units WHERE name = 'cu ft'), 'Active'),
((SELECT id FROM activities WHERE title = 'Foundation Work'), 'Aggregate', (SELECT id FROM units WHERE name = 'cu ft'), 'Active'),
((SELECT id FROM activities WHERE title = 'Foundation Work'), 'Steel Bars', (SELECT id FROM units WHERE name = 'kg'), 'Active'),

-- Structure Work materials
((SELECT id FROM activities WHERE title = 'Structure Work'), 'Cement', (SELECT id FROM units WHERE name = 'bags'), 'Active'),
((SELECT id FROM activities WHERE title = 'Structure Work'), 'Steel Bars', (SELECT id FROM units WHERE name = 'kg'), 'Active'),
((SELECT id FROM activities WHERE title = 'Structure Work'), 'Concrete Blocks', (SELECT id FROM units WHERE name = 'pieces'), 'Active'),

-- Masonry Work materials
((SELECT id FROM activities WHERE title = 'Masonry Work'), 'Bricks', (SELECT id FROM units WHERE name = 'pieces'), 'Active'),
((SELECT id FROM activities WHERE title = 'Masonry Work'), 'Mortar', (SELECT id FROM units WHERE name = 'bags'), 'Active'),

-- Electrical Work materials
((SELECT id FROM activities WHERE title = 'Electrical Work'), 'Electrical Wire', (SELECT id FROM units WHERE name = 'meters'), 'Active'),
((SELECT id FROM activities WHERE title = 'Electrical Work'), 'Switch Boards', (SELECT id FROM units WHERE name = 'pieces'), 'Active'),
((SELECT id FROM activities WHERE title = 'Electrical Work'), 'Conduit Pipes', (SELECT id FROM units WHERE name = 'meters'), 'Active'),

-- Plumbing Work materials
((SELECT id FROM activities WHERE title = 'Plumbing Work'), 'PVC Pipes', (SELECT id FROM units WHERE name = 'meters'), 'Active'),
((SELECT id FROM activities WHERE title = 'Plumbing Work'), 'Pipe Fittings', (SELECT id FROM units WHERE name = 'pieces'), 'Active'),

-- Flooring Work materials
((SELECT id FROM activities WHERE title = 'Flooring Work'), 'Tiles', (SELECT id FROM units WHERE name = 'sq ft'), 'Active'),
((SELECT id FROM activities WHERE title = 'Flooring Work'), 'Tile Adhesive', (SELECT id FROM units WHERE name = 'bags'), 'Active'),

-- Painting Work materials
((SELECT id FROM activities WHERE title = 'Painting Work'), 'Paint', (SELECT id FROM units WHERE name = 'liters'), 'Active'),
((SELECT id FROM activities WHERE title = 'Painting Work'), 'Primer', (SELECT id FROM units WHERE name = 'liters'), 'Active');

-- 4. Insert Tasks (Linked to activities with complete details)
INSERT INTO tasks (activity_id, title, status, start_date, end_date, days, performance, materials) VALUES
-- Foundation Work tasks
((SELECT id FROM activities WHERE title = 'Foundation Work'), 'Excavation', 'Active',
 CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '5 days', 5, 0,
 '[{"material": "Steel Bars", "qty": 50}]'::jsonb),

((SELECT id FROM activities WHERE title = 'Foundation Work'), 'Concrete Pouring', 'Active',
 CURRENT_DATE + INTERVAL '6 days', CURRENT_DATE + INTERVAL '10 days', 5, 0,
 '[{"material": "Cement", "qty": 100}, {"material": "Sand", "qty": 200}, {"material": "Aggregate", "qty": 150}]'::jsonb),

-- Structure Work tasks
((SELECT id FROM activities WHERE title = 'Structure Work'), 'Column Construction', 'Active',
 CURRENT_DATE + INTERVAL '11 days', CURRENT_DATE + INTERVAL '20 days', 10, 0,
 '[{"material": "Cement", "qty": 80}, {"material": "Steel Bars", "qty": 200}]'::jsonb),

((SELECT id FROM activities WHERE title = 'Structure Work'), 'Beam Construction', 'Active',
 CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '30 days', 10, 0,
 '[{"material": "Cement", "qty": 60}, {"material": "Steel Bars", "qty": 150}]'::jsonb),

-- Masonry Work tasks
((SELECT id FROM activities WHERE title = 'Masonry Work'), 'Wall Construction', 'Active',
 CURRENT_DATE + INTERVAL '31 days', CURRENT_DATE + INTERVAL '45 days', 15, 0,
 '[{"material": "Bricks", "qty": 5000}, {"material": "Mortar", "qty": 50}]'::jsonb),

-- Electrical Work tasks
((SELECT id FROM activities WHERE title = 'Electrical Work'), 'Wiring Installation', 'Active',
 CURRENT_DATE + INTERVAL '46 days', CURRENT_DATE + INTERVAL '55 days', 10, 0,
 '[{"material": "Electrical Wire", "qty": 500}, {"material": "Conduit Pipes", "qty": 100}]'::jsonb),

((SELECT id FROM activities WHERE title = 'Electrical Work'), 'Switch Board Installation', 'Active',
 CURRENT_DATE + INTERVAL '56 days', CURRENT_DATE + INTERVAL '60 days', 5, 0,
 '[{"material": "Switch Boards", "qty": 20}]'::jsonb),

-- Plumbing Work tasks
((SELECT id FROM activities WHERE title = 'Plumbing Work'), 'Pipe Installation', 'Active',
 CURRENT_DATE + INTERVAL '46 days', CURRENT_DATE + INTERVAL '55 days', 10, 0,
 '[{"material": "PVC Pipes", "qty": 200}, {"material": "Pipe Fittings", "qty": 50}]'::jsonb),

-- Flooring Work tasks
((SELECT id FROM activities WHERE title = 'Flooring Work'), 'Tile Installation', 'Active',
 CURRENT_DATE + INTERVAL '61 days', CURRENT_DATE + INTERVAL '75 days', 15, 0,
 '[{"material": "Tiles", "qty": 2000}, {"material": "Tile Adhesive", "qty": 40}]'::jsonb),

-- Painting Work tasks
((SELECT id FROM activities WHERE title = 'Painting Work'), 'Wall Painting', 'Active',
 CURRENT_DATE + INTERVAL '76 days', CURRENT_DATE + INTERVAL '85 days', 10, 0,
 '[{"material": "Paint", "qty": 100}, {"material": "Primer", "qty": 50}]'::jsonb);

-- 5. Insert Contractors
INSERT INTO contractors (name, activity_id, mobile, address, status) VALUES
('Ramesh Construction', (SELECT id FROM activities WHERE title = 'Foundation Work'), '9876543210', 'Civil Lines, City', 'Active'),
('Kumar Builders', (SELECT id FROM activities WHERE title = 'Structure Work'), '9876543211', 'MG Road, City', 'Active'),
('Sharma Masonry', (SELECT id FROM activities WHERE title = 'Masonry Work'), '9876543212', 'Old Town, City', 'Active'),
('Elite Electricals', (SELECT id FROM activities WHERE title = 'Electrical Work'), '9876543213', 'Industrial Area, City', 'Active'),
('Perfect Plumbing', (SELECT id FROM activities WHERE title = 'Plumbing Work'), '9876543214', 'New Colony, City', 'Active'),
('Floor Masters', (SELECT id FROM activities WHERE title = 'Flooring Work'), '9876543215', 'Commercial Street, City', 'Active'),
('Paint Pro', (SELECT id FROM activities WHERE title = 'Painting Work'), '9876543216', 'Market Area, City', 'Active');

-- 6. Insert Vendors
INSERT INTO vendors (name, mobile, address, status) VALUES
('City Cement Suppliers', '9876543220', 'Warehouse District, City', 'Active'),
('Steel & Iron Works', '9876543221', 'Industrial Zone, City', 'Active'),
('Building Materials Hub', '9876543222', 'Construction Market, City', 'Active'),
('Electrical Components Co.', '9876543223', 'Electronics Market, City', 'Active'),
('Plumbing Supplies Inc.', '9876543224', 'Hardware Market, City', 'Active'),
('Tiles & Flooring Center', '9876543225', 'Decoration Market, City', 'Active'),
('Paint & Colors Ltd.', '9876543226', 'Art & Paint Street, City', 'Active');

-- 7. Insert a Sample Project with complete project_details structure
INSERT INTO projects (name, location, status, activities, project_details) VALUES
('Sample Construction Project', 'Plot No. 123, Sector 45, New City', 'Ongoing',
 ARRAY(SELECT id FROM activities WHERE status = 'Active'),
 '{
   "activities": [
     {
       "title": "Foundation Work",
       "status": "Active",
       "tasks": [
         {
           "title": "Excavation",
           "startDate": "2024-01-01",
           "endDate": "2024-01-05",
           "days": 5,
           "performance": 80,
           "materials": [
             {"material": "Steel Bars", "qty": 50}
           ]
         },
         {
           "title": "Concrete Pouring",
           "startDate": "2024-01-06",
           "endDate": "2024-01-10",
           "days": 5,
           "performance": 60,
           "materials": [
             {"material": "Cement", "qty": 100},
             {"material": "Sand", "qty": 200},
             {"material": "Aggregate", "qty": 150}
           ]
         }
       ]
     },
     {
       "title": "Structure Work",
       "status": "Active",
       "tasks": [
         {
           "title": "Column Construction",
           "startDate": "2024-01-11",
           "endDate": "2024-01-20",
           "days": 10,
           "performance": 40,
           "materials": [
             {"material": "Cement", "qty": 80},
             {"material": "Steel Bars", "qty": 200}
           ]
         }
       ]
     }
   ]
 }'::jsonb);

-- 8. Insert Sample Stock Entries
INSERT INTO stocks (date, project, material_id, type, vendor_id, contractor_id, quantity, stock) VALUES
-- Inward entries from vendors
(CURRENT_DATE - INTERVAL '10 days', 'Sample Construction Project',
 (SELECT id FROM materials WHERE name = 'Cement' LIMIT 1), 'Inward',
 (SELECT id FROM vendors WHERE name = 'City Cement Suppliers'), NULL, 500, 500),

(CURRENT_DATE - INTERVAL '9 days', 'Sample Construction Project',
 (SELECT id FROM materials WHERE name = 'Steel Bars' LIMIT 1), 'Inward',
 (SELECT id FROM vendors WHERE name = 'Steel & Iron Works'), NULL, 1000, 1000),

(CURRENT_DATE - INTERVAL '8 days', 'Sample Construction Project',
 (SELECT id FROM materials WHERE name = 'Sand' LIMIT 1), 'Inward',
 (SELECT id FROM vendors WHERE name = 'Building Materials Hub'), NULL, 800, 800),

-- Outward entries to contractors
(CURRENT_DATE - INTERVAL '5 days', 'Sample Construction Project',
 (SELECT id FROM materials WHERE name = 'Cement' LIMIT 1), 'Outward',
 NULL, (SELECT id FROM contractors WHERE name = 'Ramesh Construction'), 100, 400),

(CURRENT_DATE - INTERVAL '3 days', 'Sample Construction Project',
 (SELECT id FROM materials WHERE name = 'Steel Bars' LIMIT 1), 'Outward',
 NULL, (SELECT id FROM contractors WHERE name = 'Ramesh Construction'), 250, 750);

-- 9. Insert Sample Customer
INSERT INTO customers (full_name, primary_contact, address, project, amount) VALUES
('John Smith', '9876543230', '456 Oak Street, New City', 'Sample Construction Project', 2500000.00),
('Mary Johnson', '9876543231', '789 Pine Avenue, New City', 'Sample Construction Project', 1800000.00);

-- 10. Insert Sample User and Admin
INSERT INTO users (email, username, full_name, password_hash, status) VALUES
('admin@construction.com', 'admin', 'System Administrator', 'hashed_password_here', 'Active'),
('manager@construction.com', 'manager', 'Project Manager', 'hashed_password_here', 'Active');

INSERT INTO admins (user_id, job_title, mobile, status, role, permissions, plain_password) VALUES
((SELECT id FROM users WHERE username = 'admin'), 'System Administrator', '9876543240', 'Active', 'super_admin', '["all"]'::jsonb, 'admin123'),
((SELECT id FROM users WHERE username = 'manager'), 'Project Manager', '9876543241', 'Active', 'admin', '["projects", "activities", "tasks"]'::jsonb, 'manager123');

-- Update stock calculations (running balance)
UPDATE stocks SET stock = (
    SELECT SUM(
        CASE
            WHEN type = 'Inward' THEN quantity
            WHEN type = 'Outward' THEN -quantity
            ELSE 0
        END
    )
    FROM stocks s2
    WHERE s2.material_id = stocks.material_id
    AND s2.project = stocks.project
    AND s2.date <= stocks.date
);