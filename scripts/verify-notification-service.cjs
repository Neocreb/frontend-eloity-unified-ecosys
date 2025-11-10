#!/usr/bin/env node

// Simple script to verify notification service methods exist
const fs = require('fs');
const path = require('path');

console.log('=== Notification Service Verification ===');

// Check if the notification service file exists
const servicePath = path.join(__dirname, '..', 'src', 'services', 'notificationService.ts');
if (!fs.existsSync(servicePath)) {
  console.error('❌ notificationService.ts not found');
  process.exit(1);
}

console.log('✓ notificationService.ts exists');

// Read the file content
const content = fs.readFileSync(servicePath, 'utf8');

// Check for required methods
const requiredMethods = [
  'getUserNotifications',
  'getUnreadCount',
  'markAsRead',
  'markAllAsRead',
  'createNotification',
  'sendUserNotification',
  'sendGroupNotification'
];

console.log('\nChecking for required methods:');
let allMethodsFound = true;

requiredMethods.forEach(method => {
  if (content.includes(method)) {
    console.log(`✓ ${method}`);
  } else {
    console.error(`❌ ${method} not found`);
    allMethodsFound = false;
  }
});

console.log('\n=== Verification Summary ===');
if (allMethodsFound) {
  console.log('✅ All required methods found in notificationService.ts');
  process.exit(0);
} else {
  console.error('❌ Some required methods are missing');
  process.exit(1);
}