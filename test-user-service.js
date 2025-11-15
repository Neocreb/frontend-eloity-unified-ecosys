// Test script for UserService
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Test the UserService directly
import { UserService } from './src/services/userService.ts';

async function testUserService() {
  console.log('Testing UserService...');
  
  try {
    // Test searchUsers method
    console.log('Testing searchUsers...');
    const query = 'test';
    
    // Sanitize query to prevent complex parsing issues
    const sanitizedQuery = query.trim().replace(/[^a-zA-Z0-9_\-.\s@]/g, '');
    
    const searchResults = await UserService.searchUsers(sanitizedQuery);
    console.log('Search results:', searchResults.length);
    console.log('Results:', searchResults);
    
    // Test with another query
    console.log('\nTesting with "user" query...');
    const userQuery = 'user';
    const sanitizedUserQuery = userQuery.trim().replace(/[^a-zA-Z0-9_\-.\s@]/g, '');
    
    const userResults = await UserService.searchUsers(sanitizedUserQuery);
    console.log('"user" query results:', userResults.length);
    console.log('"user" results:', userResults);
    
  } catch (error) {
    console.error('Error testing UserService:', error);
    console.error('Error details:', error.message);
  }
}

testUserService();