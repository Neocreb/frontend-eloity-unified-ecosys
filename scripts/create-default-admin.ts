#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { users } from "../shared/schema";
import { admin_permissions } from "../shared/admin-schema";

// Load environment variables from .env.local
config({ path: '.env.local' });

// Setup database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql);

async function createDefaultAdmin() {
  console.log("🚀 Creating default admin user for SoftChat...\n");

  try {
    const email = "admin@eloity.com";
    const name = "SoftChat Admin";
    const password = "Softchat2024!";
    const roles = ["super_admin"];
    const department = "Administration";
    const position = "System Administrator";
    const employeeId = `ADM-${Date.now()}`;

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${name}`);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let userId: string;

    if (existingUser.length > 0) {
      console.log("⚠️  User already exists. Updating...");
      userId = existingUser[0].id;

      // Update password
      const hashedPassword = await bcrypt.hash(password, 12);
      await db
        .update(users)
        .set({
          password: hashedPassword,
          email_confirmed: true,
        })
        .where(eq(users.id, userId));

      // Check if admin record exists
      const existingAdminPermission = await db
        .select()
        .from(admin_permissions)
        .where(eq(admin_permissions.user_id, userId))
        .where(eq(admin_permissions.role, 'super_admin'))
        .limit(1);

      if (existingAdminPermission.length > 0) {
        // Update admin permission
        await db
          .update(admin_permissions)
          .set({
            permissions: generatePermissions(roles),
            is_active: true,
            granted_by: userId,
          })
          .where(eq(admin_permissions.user_id, userId))
          .where(eq(admin_permissions.role, 'super_admin'));
      } else {
        // Create admin permission record
        await db.insert(admin_permissions).values({
          user_id: userId,
          role: 'super_admin',
          permissions: generatePermissions(roles),
          is_active: true,
          granted_by: userId,
        });
      }
    } else {
      // Create new user
      console.log("🔐 Creating new user account...");

      const hashedPassword = await bcrypt.hash(password, 12);

      const [newUser] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          full_name: name,
          email_confirmed: true,
          role: "admin",
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returning();

      userId = newUser.id;

      // Create admin permission
      await db.insert(admin_permissions).values({
        user_id: userId,
        role: 'super_admin',
        permissions: generatePermissions(roles),
        is_active: true,
        granted_by: userId,
      });
    }

    console.log("\n✅ Default admin user created/updated successfully!");
    console.log("\n📝 Login credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\n🌐 Access admin dashboard at: /admin/login");
    
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

function generatePermissions(roles: string[]): string[] {
  const rolePermissions: Record<string, string[]> = {
    super_admin: [
      "admin.all",
      "users.all", 
      "content.all",
      "marketplace.all",
      "crypto.all",
      "freelance.all",
      "financial.all",
      "settings.all",
      "moderation.all",
      "analytics.all",
      "system.all",
    ],
  };

  const permissions = new Set<string>();
  roles.forEach((role) => {
    const rolePerms = rolePermissions[role] || [];
    rolePerms.forEach((perm) => permissions.add(perm));
  });

  return Array.from(permissions);
}

// Run the script
createDefaultAdmin().catch(console.error);