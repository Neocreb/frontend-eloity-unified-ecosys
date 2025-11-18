#!/usr/bin/env npx tsx

import { execSync } from "child_process";
import supabaseServer from "../server/supabaseServer";

// Use dynamic imports to avoid module resolution issues
let adminRoleOperations: any;
let adminUserOperations: any;
let initializeAdminSystem: any;

const loadAdminOperations = async () => {
  try {
    const adminOps = await import("../server/database/admin-operations");
    adminRoleOperations = adminOps.adminRoleOperations;
    adminUserOperations = adminOps.adminUserOperations;
    initializeAdminSystem = adminOps.initializeAdminSystem;
  } catch (error) {
    console.error("Failed to load admin operations:", error);
    throw error;
  }
};

const log = (
  message: string,
  type: "info" | "success" | "error" | "warning" = "info",
) => {
  const colors = {
    info: "\x1b[36m",
    success: "\x1b[32m",
    error: "\x1b[31m",
    warning: "\x1b[33m",
  };
  const reset = "\x1b[0m";
  console.log(`${colors[type]}${message}${reset}`);
};

const createDefaultAdmin = async () => {
  try {
    // Load admin operations dynamically
    await loadAdminOperations();
    
    log("🔧 Initializing admin system...");

    // Initialize the admin system (roles, etc.)
    await initializeAdminSystem();

    // Get super_admin role
    const superAdminRole = await adminRoleOperations.findByName("super_admin");
    if (!superAdminRole) {
      throw new Error("Super admin role not found");
    }

    // Check if admin already exists
    const existingAdmin =
      await adminUserOperations.findByEmail("admin@eloity.com");
    if (existingAdmin) {
      log("✅ Default admin user already exists", "success");
      log("📧 Email: admin@eloity.com");
      log("🔑 Use your existing password or reset it through the database");
      return;
    }

    // Create default admin user
    log("👤 Creating default admin user...");

    const defaultPassword = "Eloity2024!";

    const { user: adminUser } = await adminUserOperations.create({
      email: "admin@eloity.com",
      password: defaultPassword,
      name: "System Administrator",
      roleId: superAdminRole.id,
      employeeId: "ADMIN001",
      department: "IT",
      position: "System Administrator",
    });

    log("✅ Default admin user created successfully!", "success");
    log("\n📋 Admin Login Credentials:", "info");
    log("📧 Email: admin@eloity.com");
    log(`🔑 Password: ${defaultPassword}`);
    log("🌐 Login URL: /admin/login");

    log("\n⚠️  IMPORTANT SECURITY NOTICE:", "warning");
    log("Please change the default password immediately after first login!");
    log("The default credentials should only be used for initial setup.");
  } catch (error) {
    log("❌ Failed to create admin user:", "error");
    console.error(error);
    throw error;
  }
};

const main = async () => {
  try {
    log("🚀 Creating default admin user for Eloity platform...", "info");

    await createDefaultAdmin();

    log("\n🎉 Admin setup completed successfully!", "success");
    log("\nYou can now access the admin dashboard at /admin/login");
  } catch (error) {
    log("\n❌ Admin setup failed!", "error");
    log(
      "Please check the error messages above and ensure your database is properly configured.",
      "error",
    );
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

main();