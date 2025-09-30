import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://grghlmtpqjrbtzfrjdxw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyZ2hsbXRwcWpyYnR6ZnJqZHh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjczNDAwMSwiZXhwIjoyMDUyMzEwMDAxfQ.5SJfgHLVp4FLZZIq6sGkHjYEf3vJJ3d21LdZjLZ8qRw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUsers() {
  try {
    console.log('Creating admin users...');

    // Insert users into users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .upsert([
        {
          email: 'admin@construction.com',
          username: 'admin',
          full_name: 'System Administrator',
          password_hash: 'admin123',
          status: 'Active'
        },
        {
          email: 'manager@construction.com',
          username: 'manager',
          full_name: 'Project Manager',
          password_hash: 'manager123',
          status: 'Active'
        }
      ], { onConflict: 'username' });

    if (usersError) {
      console.error('Error creating users:', usersError);
      return;
    }

    console.log('Users created successfully:', usersData);

    // Get the user IDs
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    const { data: managerUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'manager')
      .single();

    if (!adminUser || !managerUser) {
      console.error('Could not retrieve user IDs');
      return;
    }

    console.log('Admin user ID:', adminUser.id);
    console.log('Manager user ID:', managerUser.id);

    // Insert admin records
    const { data: adminsData, error: adminsError } = await supabase
      .from('admins')
      .upsert([
        {
          user_id: adminUser.id,
          job_title: 'System Administrator',
          mobile: '+1234567890',
          status: 'Active',
          role: 'main_admin',
          permissions: ['New Projects', 'Finance', 'Reports', 'Project Overview', 'Stock Management', 'Gantt Chart', 'Technical Files', 'Legal Files', 'Leads', 'Customers', 'Materials', 'Activities', 'Tasks', 'Contractors', 'Vendors', 'Units', 'Admin Management'],
          plain_password: 'admin123'
        },
        {
          user_id: managerUser.id,
          job_title: 'Project Manager',
          mobile: '+1234567891',
          status: 'Active',
          role: 'admin',
          permissions: ['New Projects', 'Finance', 'Reports', 'Project Overview', 'Stock Management', 'Gantt Chart', 'Technical Files', 'Legal Files', 'Leads', 'Customers', 'Materials', 'Activities', 'Tasks', 'Contractors', 'Vendors', 'Units'],
          plain_password: 'manager123'
        }
      ], { onConflict: 'user_id' });

    if (adminsError) {
      console.error('Error creating admin records:', adminsError);
      return;
    }

    console.log('Admin records created successfully:', adminsData);
    console.log('✅ Admin users setup complete! You can now login with:');
    console.log('- Username: admin, Password: admin123');
    console.log('- Username: manager, Password: manager123');

  } catch (error) {
    console.error('Error in createAdminUsers:', error);
  }
}

createAdminUsers();