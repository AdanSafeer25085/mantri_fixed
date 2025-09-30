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

// Fallback authentication without RPC function
export const authApiFallback = {
  async signIn(usernameOrEmail, password) {
    try {
      // First, try to find the user by username
      let { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
        .eq('status', 'Active');

      if (userError) {
        console.error('Error fetching user:', userError);
        throw new Error('Authentication failed');
      }

      // Find the user with matching password
      const user = users?.find(u => u.password_hash === password);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Get admin data if exists
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id);

      if (adminError) {
        console.error('Error fetching admin data:', adminError);
      }

      // Attach admin data to user object
      user.admin = adminData || [];

      return user;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }
};