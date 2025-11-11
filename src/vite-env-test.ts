// Test what environment variables Vite is loading
console.log('VITE_SUPABASE_URL from import.meta.env:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_PUBLISHABLE_KEY from import.meta.env:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

// Also check process.env if available
if (typeof process !== 'undefined' && process.env) {
  console.log('VITE_SUPABASE_URL from process.env:', process.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY from process.env:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
}

// Export for use in components
export const viteEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
};