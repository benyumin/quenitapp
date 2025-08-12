import { supabase } from './supabaseClient';

// Authentication Service for Quenitapp
// No RLS restrictions - basic development setup

export class AuthService {
  // 1. User Registration
  static async registerUser(email, password, userData) {
    try {
      // Validate input
      if (!email || !password || !userData.full_name) {
        throw new Error('Email, password, and full name are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone || '',
            address: userData.address || ''
          }
        }
      });

      if (authError) throw authError;

      // Profile will be automatically created by the trigger
      // But we can also manually create/update it if needed
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('clientes')
          .upsert([
            {
              id: authData.user.id,
              nombre: userData.full_name,
              telefono: userData.phone || '',
              email: email
              // address: userData.address || '' // Si tu tabla clientes tiene campo dirección
            }
          ]);

        if (profileError) {
          console.warn('Profile creation warning:', profileError);
        }
      }

      return { success: true, user: authData.user, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, user: null, error: error.message };
    }
  }

  // 2. User Login
  static async loginUser(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Fetch user profile
      let profile = null;
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profileError) {
          profile = profileData;
        }
      }

      return { success: true, user: data.user, profile, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, user: null, profile: null, error: error.message };
    }
  }

  // 3. User Logout
  static async logoutUser() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  // 4. Get Current User
  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, user: null, profile: null, error: 'No user logged in' };
      }

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Profile fetch warning:', profileError);
      }

      return { success: true, user, profile, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, user: null, profile: null, error: error.message };
    }
  }

  static async updateProfile(userId, updates) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, profile: data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, profile: null, error: error.message };
    }
  }

  // 6. Create Order
  static async createOrder(orderData) {
    try {
      // Validate order data
      if (!orderData.user_id || !orderData.product || !orderData.quantity || !orderData.total_price) {
        throw new Error('User ID, product, quantity, and total price are required');
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, order: data, error: null };
    } catch (error) {
      console.error('Order creation error:', error);
      return { success: false, order: null, error: error.message };
    }
  }

  // 7. Get User Orders
  static async getUserOrders(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return { success: true, orders: data || [], error: null };
    } catch (error) {
      console.error('Get user orders error:', error);
      return { success: false, orders: [], error: error.message };
    }
  }

  // 8. Get All Orders (no restrictions - for admin purposes)
  static async getAllOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          clientes:user_id (
            nombre,
            email,
            telefono
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      return { success: true, orders: data || [], error: null };
    } catch (error) {
      console.error('Get all orders error:', error);
      return { success: false, orders: [], error: error.message };
    }
  }

  // 9. Get Order by ID
  static async getOrderById(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          clientes:user_id (
            nombre,
            email,
            telefono
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return { success: true, order: data, error: null };
    } catch (error) {
      console.error('Get order by ID error:', error);
      return { success: false, order: null, error: error.message };
    }
  }

  // 10. Delete Order (for admin purposes)
  static async deleteOrder(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Delete order error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export individual functions for easier use
export const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  deleteOrder
} = AuthService;
