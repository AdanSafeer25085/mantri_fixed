import { supabase } from '../lib/supabase.js';

export async function createAdminUsers() {
  try {
    console.log('🔄 Creating admin users...');

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
      console.error('❌ Error creating users:', usersError);
      return { success: false, error: usersError };
    }

    console.log('✅ Users created/updated successfully');

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
      console.error('❌ Could not retrieve user IDs');
      return { success: false, error: 'Could not retrieve user IDs' };
    }

    console.log('📋 Admin user ID:', adminUser.id);
    console.log('📋 Manager user ID:', managerUser.id);

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
      console.error('❌ Error creating admin records:', adminsError);
      return { success: false, error: adminsError };
    }

    console.log('✅ Admin records created/updated successfully');
    console.log('🎉 Setup complete! You can now login with:');
    console.log('👨‍💼 Admin: username=admin, password=admin123');
    console.log('👨‍💼 Manager: username=manager, password=manager123');

    return { success: true, data: { usersData, adminsData } };

  } catch (error) {
    console.error('💥 Error in createAdminUsers:', error);
    return { success: false, error };
  }
}

// Call the function if this script is run directly
if (typeof window !== 'undefined') {
  // Browser environment - expose to window for manual execution
  window.createAdminUsers = createAdminUsers;
} else {
  // Node environment - run immediately
  createAdminUsers().then(result => {
    if (result.success) {
      console.log('SUCCESS:', result);
    } else {
      console.error('FAILED:', result.error);
    }
    process.exit(result.success ? 0 : 1);
  });
}