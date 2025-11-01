// Simple test function to verify Edge Function deployment
// @ts-nocheck

console.log("🚀 Test function started");

Deno.serve(async (_req) => {
  return new Response(
    JSON.stringify({ 
      message: "Test function is working!",
      timestamp: new Date().toISOString()
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
