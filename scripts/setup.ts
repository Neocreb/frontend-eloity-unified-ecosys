#!/usr/bin/env npx tsx

import { execSync } from "child_process";
import { existsSync, copyFileSync } from "fs";
import { join } from "path";

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

const runCommand = (command: string, description: string) => {
  try {
    log(`🔄 ${description}...`);
    execSync(command, { stdio: "inherit" });
    log(`✅ ${description} completed`);
  } catch (error) {
    log(`❌ ${description} failed`, "error");
    throw error;
  }
};

const checkRequirements = () => {
  log("🔍 Checking requirements...");

  try {
    execSync("node --version", { stdio: "ignore" });
    log("✅ Node.js is installed");
  } catch {
    log("❌ Node.js is not installed or not in PATH", "error");
    process.exit(1);
  }

  try {
    execSync("npm --version", { stdio: "ignore" });
    log("✅ npm is installed");
  } catch {
    log("❌ npm is not installed or not in PATH", "error");
    process.exit(1);
  }
};

const setupEnvironment = () => {
  log("🔧 Setting up environment...");

  if (!existsSync(".env")) {
    if (existsSync(".env.example")) {
      copyFileSync(".env.example", ".env");
      log("✅ Created .env file from .env.example");
      log(
        "⚠️  Please update .env with your actual configuration values",
        "warning",
      );
    } else {
      log("❌ .env.example file not found", "error");
      process.exit(1);
    }
  } else {
    log("✅ .env file already exists");
  }
};

const installDependencies = () => {
  runCommand("npm install", "Installing dependencies");
};

const setupDatabase = () => {
  log("🗄️  Setting up database...");

  if (!process.env.DATABASE_URL) {
    log("⚠️  DATABASE_URL not found in environment variables", "warning");
    log(
      "⚠️  Please set DATABASE_URL in your .env file before running database setup",
      "warning",
    );
    return;
  }

  try {
    runCommand("npm run db:generate", "Generating database schema");
    runCommand("npm run db:push", "Pushing schema to database");
    log("✅ Database setup completed");
  } catch (error) {
    log(
      "⚠️  Database setup failed - you may need to set up your database manually",
      "warning",
    );
  }
};

const createDirectories = () => {
  log("📁 Creating required directories...");

  const directories = ["logs", "uploads", "temp"];

  directories.forEach((dir) => {
    try {
      execSync(`mkdir -p ${dir}`, { stdio: "ignore" });
      log(`✅ Created ${dir} directory`);
    } catch {
      log(`⚠️  Could not create ${dir} directory`, "warning");
    }
  });
};

const displayNextSteps = () => {
  log("\n🎉 Setup completed successfully!", "success");
  log("\n📋 Next steps:", "info");
  log("1. Update your .env file with actual configuration values");
  log("2. Set up your Neon database and update DATABASE_URL");
  log("3. Configure your email service (SMTP settings)");
  log("4. Set up AWS S3 for file uploads (optional)");
  log("5. Configure Stripe for payments (optional)");
  log("6. Set up Redis for caching (optional)");
  log("\n🚀 Start the development server with: npm run dev");
  log("🔗 The server will be available at: http://localhost:5000");
  log("📊 Health check endpoint: http://localhost:5000/health");
  log(
    "\n📚 Documentation: Check BACKEND_IMPLEMENTATION_GUIDE.md for detailed setup instructions",
  );
};

const main = async () => {
  try {
    log("🚀 Starting Eloity platform setup...", "info");

    checkRequirements();
    setupEnvironment();
    installDependencies();
    createDirectories();
    setupDatabase();

    displayNextSteps();
  } catch (error) {
    log("\n❌ Setup failed!", "error");
    log("Please check the error messages above and try again.", "error");
    process.exit(1);
  }
};

main();
