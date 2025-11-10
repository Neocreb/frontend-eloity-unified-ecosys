#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Restarting Development Server ===');

// Function to delete directory recursively
function deleteDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        deleteDir(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmdirSync(dirPath);
    console.log(`Deleted directory: ${dirPath}`);
  }
}

try {
  // Clear Vite cache
  const viteCacheDir = path.join(__dirname, '..', 'node_modules', '.vite');
  deleteDir(viteCacheDir);

  // Clear dist directory
  const distDir = path.join(__dirname, '..', 'dist');
  deleteDir(distDir);

  console.log('Cache clearing completed.');

  // Restart the development server
  console.log('Restarting development server...');
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error restarting development server:', error.message);
  process.exit(1);
}