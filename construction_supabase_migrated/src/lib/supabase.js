import { createClient } from '@supabase/supabase-js';

// Use environment variables - REQUIRED for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations

// Projects
export const projectsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(project) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Activities
export const activitiesApi = {
  async getAll(projectId = null) {
    let query = supabase
      .from('activities')
      .select('*')
      .order('title');

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(activity) {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Tasks
export const tasksApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        activity:activities(*)
      `)
      .order('title');
    if (error) throw error;
    return data;
  },

  async getByActivity(activityId = null) {
    if (activityId) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('activity_id', activityId)
        .order('title');
      if (error) throw error;
      return data;
    } else {
      // Return all tasks when no activityId provided (for backward compatibility)
      return await this.getAll();
    }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        activity:activities(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Materials
export const materialsApi = {
  async getByActivity(activityId, projectId = null) {
    let query = supabase
      .from('materials')
      .select(`
        *,
        unit:units(*)
      `)
      .eq('activity_id', activityId)
      .order('name');

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getAll(projectId = null) {
    let query = supabase
      .from('materials')
      .select(`
        *,
        unit:units(*),
        activity:activities(*)
      `)
      .order('name');

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        unit:units(*),
        activity:activities(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(material) {
    const { data, error } = await supabase
      .from('materials')
      .insert(material)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Units
export const unitsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(unit) {
    const { data, error } = await supabase
      .from('units')
      .insert(unit)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Vendors
export const vendorsApi = {
  async getAll(projectId = null) {
    let query = supabase
      .from('vendors')
      .select('*')
      .order('name');

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(vendor) {
    const { data, error } = await supabase
      .from('vendors')
      .insert(vendor)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Contractors
export const contractorsApi = {
  async getAll(projectId = null) {
    let query = supabase
      .from('contractors')
      .select(`
        *,
        activity:activities(*)
      `)
      .order('name');

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByActivity(activityId, projectId = null) {
    let query = supabase
      .from('contractors')
      .select('*')
      .eq('activity_id', activityId)
      .order('name');

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('contractors')
      .select(`
        *,
        activity:activities(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(contractor) {
    const { data, error } = await supabase
      .from('contractors')
      .insert(contractor)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('contractors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('contractors')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Customers
export const customersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByProject(projectName) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('project', projectName)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(customer) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Stocks
export const stocksApi = {
  async getAll(projectId = null) {
    let query = supabase
      .from('stocks')
      .select(`
        *,
        material:materials(*),
        vendor:vendors(*),
        contractor:contractors(*)
      `)
      .order('date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByProject(projectName) {
    const { data, error } = await supabase
      .from('stocks')
      .select(`
        *,
        material:materials(*),
        vendor:vendors(*),
        contractor:contractors(*)
      `)
      .eq('project', projectName)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('stocks')
      .select(`
        *,
        material:materials(*),
        vendor:vendors(*),
        contractor:contractors(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(stock) {
    const { data, error } = await supabase
      .from('stocks')
      .insert(stock)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('stocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('stocks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Users (Authentication)
export const authApi = {
  async signUp(email, password, username, fullName, additionalData = {}) {
    // First create user in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        username,
        full_name: fullName,
        password_hash: password, // In production, hash this on server or use Supabase Auth
        status: additionalData.status || 'Active'
      })
      .select()
      .single();

    if (userError) throw userError;
    return userData;
  },

  async signIn(usernameOrEmail, password) {
    // SOLUTION: Use the admins table plain_password field which isn't masked
    // Since your database shows the admins table has plain_password field with the actual passwords

    try {
      console.log('🔍 Attempting authentication via admins table for:', usernameOrEmail);

      // Get user with admin data in one query using JOIN
      const { data: results, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          email,
          full_name,
          status,
          password_hash,
          admins!inner(
            id,
            plain_password,
            role,
            permissions,
            job_title,
            mobile,
            status
          )
        `)
        .eq('status', 'Active')
        .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`);

      if (error) {
        console.error('❌ Database query error:', error);
        throw new Error('Database access error');
      }

      if (!results || results.length === 0) {
        console.log('❌ No admin user found with username/email:', usernameOrEmail);
        throw new Error('Invalid credentials');
      }

      // Find user with matching password using plain_password from admins table
      const authenticatedUser = results.find(user => {
        const plainPassword = user.admins[0]?.plain_password;
        console.log(`🔍 Checking admin user ${user.username} with plain_password: "${plainPassword}"`);
        return plainPassword === password;
      });

      if (!authenticatedUser) {
        console.log('❌ Password mismatch for admin user:', usernameOrEmail);
        throw new Error('Invalid credentials');
      }

      // Format the response to match expected structure
      const formattedUser = {
        id: authenticatedUser.id,
        username: authenticatedUser.username,
        email: authenticatedUser.email,
        full_name: authenticatedUser.full_name,
        status: authenticatedUser.status,
        password_hash: authenticatedUser.password_hash,
        admin: authenticatedUser.admins || []
      };

      console.log('✅ Authentication successful via admins plain_password');
      return formattedUser;

    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw new Error('Invalid credentials');
    }
  },

  async getCurrentUser() {
    // Implement based on your session management
    const userId = localStorage.getItem('userId');
    if (!userId) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async signOut() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
    localStorage.removeItem('admin');
  }
};

// Finances
export const financesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('finances')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getByProject(projectName) {
    const { data, error } = await supabase
      .from('finances')
      .select('*')
      .eq('project', projectName)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('finances')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(finance) {
    const { data, error } = await supabase
      .from('finances')
      .insert(finance)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('finances')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('finances')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Leads
export const leadsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getByProject(projectName) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('project', projectName)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(lead) {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Files
export const filesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getByCategory(category) {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(file) {
    const { data, error } = await supabase
      .from('files')
      .insert(file)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('files')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Admins
export const adminsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('admins')
      .select(`
        id,
        user_id,
        job_title,
        mobile,
        status,
        role,
        permissions,
        plain_password,
        created_at,
        updated_at,
        users(
          full_name,
          email,
          username,
          status
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Transform data to match frontend expectations
    return data.map(admin => ({
      id: admin.id,
      user_id: admin.user_id,
      position: admin.job_title,
      mobile: admin.mobile,
      status: admin.status,
      role: admin.role,
      permissions: admin.permissions,
      plain_password: admin.plain_password,
      fullName: admin.users?.full_name,
      name: admin.users?.full_name,
      email: admin.users?.email,
      username: admin.users?.username,
      user_status: admin.users?.status,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
      displayPassword: admin.plain_password || '••••••••'
    }));
  },

  async create(adminData) {
    const { data, error } = await supabase
      .from('admins')
      .insert({
        user_id: adminData.user_id,
        job_title: adminData.position,
        mobile: adminData.mobile,
        status: adminData.status || 'Active',
        role: adminData.role || 'admin',
        permissions: adminData.permissions || [],
        plain_password: adminData.plain_password
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('admins')
      .update({
        job_title: updates.position,
        mobile: updates.mobile,
        status: updates.status,
        role: updates.role,
        permissions: updates.permissions,
        plain_password: updates.plain_password
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    // First get the admin to find the user_id
    const { data: admin, error: getError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Delete the admin record
    const { error: deleteAdminError } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (deleteAdminError) throw deleteAdminError;

    // Optionally delete the user record too
    if (admin.user_id) {
      const { error: deleteUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', admin.user_id);

      if (deleteUserError) console.warn('Could not delete user:', deleteUserError);
    }
  }
};

export default supabase;