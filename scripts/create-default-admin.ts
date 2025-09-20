#!/usr/bin/env npx tsx

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { wallets, adminUsers } from "../shared/enhanced-schema";
import { users, profiles } from "../shared/schema";

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
          emailConfirmed: true,
        })
        .where(eq(users.id, userId));

      // Check if admin record exists
      const existingAdmin = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.userId, userId))
        .limit(1);

      if (existingAdmin.length > 0) {
        // Update admin
        await db
          .update(adminUsers)
          .set({
            roles,
            permissions: generatePermissions(roles),
            department,
            position,
            employeeId,
            isActive: true,
          })
          .where(eq(adminUsers.userId, userId));
      } else {
        // Create admin record
        await db.insert(adminUsers).values({
          userId,
          roles,
          permissions: generatePermissions(roles),
          department,
          position,
          employeeId,
          isActive: true,
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
          emailConfirmed: true,
        })
        .returning();

      userId = newUser.id;

      // Create profile
      await db.insert(profiles).values({
        userId: userId,
        fullName: name,
        name,
        role: "admin",
        status: "active",
        isVerified: true,
      });

      // Create wallet
      await db.insert(wallets).values({
        userId: userId,
        isActive: true,
      });

      // Create admin user
      await db.insert(adminUsers).values({
        userId: userId,
        roles,
        permissions: generatePermissions(roles),
        department,
        position,
        employeeId,
        isActive: true,
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
