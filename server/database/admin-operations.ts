import supabaseServer from '../../server/supabaseServer';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Define types based on the schema
interface AdminRole {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminUserCreateInput {
  email: string;
  password: string;
  name: string;
  roleId: string;
  employeeId: string;
  department: string;
  position: string;
}

interface AdminUser {
  id: string;
  user_id: string;
  role_id: string;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  position: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// Database operations for admin roles
export const adminRoleOperations = {
  findByName: async (name: string): Promise<AdminRole | null> => {
    try {
      // First check if the role exists
      const { data, error } = await supabaseServer
        .from('admin_roles')
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        console.warn('Error fetching admin role:', error.message);
        return null;
      }

      return data ? {
        id: data.id,
        name: data.name,
        display_name: data.display_name,
        description: data.description,
        permissions: data.permissions,
        priority: data.priority,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      } : null;
    } catch (error) {
      console.error('Error in adminRoleOperations.findByName:', error);
      return null;
    }
  },

  create: async (roleData: Omit<AdminRole, 'id' | 'created_at' | 'updated_at'>): Promise<AdminRole> => {
    try {
      const { data, error } = await supabaseServer
        .from('admin_roles')
        .insert([{
          ...roleData,
          id: uuidv4()
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create admin role: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        display_name: data.display_name,
        description: data.description,
        permissions: data.permissions,
        priority: data.priority,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error in adminRoleOperations.create:', error);
      throw error;
    }
  }
};

// Database operations for admin users
export const adminUserOperations = {
  findByEmail: async (email: string): Promise<AdminUser | null> => {
    try {
      // Search by email in the admin_users table
      const { data, error } = await supabaseServer
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.warn('Error fetching admin user by email:', error.message);
        return null;
      }

      return data ? {
        id: data.id,
        user_id: data.user_id,
        role_id: data.role_id,
        name: data.name,
        email: data.email,
        employee_id: data.employee_id,
        department: data.department,
        position: data.position,
        is_active: data.is_active,
        last_login: data.last_login,
        created_at: data.created_at,
        updated_at: data.updated_at
      } : null;
    } catch (error) {
      console.error('Error in adminUserOperations.findByEmail:', error);
      return null;
    }
  },

  create: async (userData: AdminUserCreateInput): Promise<{ user: AdminUser }> => {
    try {
      // First, we need to check if the user exists in the main users table
      let { data: existingUser, error: userError } = await supabaseServer
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      // If user doesn't exist, create them in the main users table
      if (!existingUser) {
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const { data: newUser, error: createUserError } = await supabaseServer
          .from('users')
          .insert([{
            email: userData.email,
            password: hashedPassword // Store hashed password
          }])
          .select()
          .single();

        if (createUserError) {
          throw new Error(`Failed to create user account: ${createUserError.message}`);
        }

        existingUser = { id: newUser.id };
      }

      // Now create the admin user record
      const adminUserData = {
        user_id: existingUser.id,
        role_id: userData.roleId,
        name: userData.name,
        email: userData.email,
        employee_id: userData.employeeId,
        department: userData.department,
        position: userData.position,
        is_active: true
      };

      const { data: adminUser, error: adminUserError } = await supabaseServer
        .from('admin_users')
        .insert([adminUserData])
        .select()
        .single();

      if (adminUserError) {
        throw new Error(`Failed to create admin user record: ${adminUserError.message}`);
      }

      return {
        user: {
          id: adminUser.id,
          user_id: adminUser.user_id,
          role_id: adminUser.role_id,
          name: adminUser.name,
          email: adminUser.email,
          employee_id: adminUser.employee_id,
          department: adminUser.department,
          position: adminUser.position,
          is_active: adminUser.is_active,
          last_login: adminUser.last_login,
          created_at: adminUser.created_at,
          updated_at: adminUser.updated_at
        }
      };
    } catch (error) {
      console.error('Error in adminUserOperations.create:', error);
      throw error;
    }
  }
};

// Initialize admin system with default roles
export const initializeAdminSystem = async (): Promise<void> => {
  try {
    // Check if super_admin role exists
    const superAdminRole = await adminRoleOperations.findByName('super_admin');
    
    if (!superAdminRole) {
      console.log('Creating super_admin role...');
      await adminRoleOperations.create({
        name: 'super_admin',
        display_name: 'Super Administrator',
        description: 'Full access to all admin features',
        permissions: ['admin.all'],
        priority: 100,
        is_active: true
      });
      console.log('✅ Super admin role created');
    } else {
      console.log('✅ Super admin role already exists');
    }

    // Check if admin role exists
    const adminRole = await adminRoleOperations.findByName('admin');
    
    if (!adminRole) {
      console.log('Creating admin role...');
      await adminRoleOperations.create({
        name: 'admin',
        display_name: 'Administrator',
        description: 'Standard administrator access',
        permissions: ['admin.standard'],
        priority: 50,
        is_active: true
      });
      console.log('✅ Admin role created');
    } else {
      console.log('✅ Admin role already exists');
    }

    // Check if moderator role exists
    const moderatorRole = await adminRoleOperations.findByName('moderator');
    
    if (!moderatorRole) {
      console.log('Creating moderator role...');
      await adminRoleOperations.create({
        name: 'moderator',
        display_name: 'Moderator',
        description: 'Content moderation access',
        permissions: ['moderation.access'],
        priority: 25,
        is_active: true
      });
      console.log('✅ Moderator role created');
    } else {
      console.log('✅ Moderator role already exists');
    }
  } catch (error) {
    console.error('Error initializing admin system:', error);
    throw error;
  }
};