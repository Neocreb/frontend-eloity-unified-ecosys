// Simple test to verify the crypto service can be imported and used
console.log("Testing crypto service import...");

// Try to import the crypto service
import('./src/services/cryptoService.ts')
  .then((module) => {
    console.log("✓ Crypto service imported successfully");
    console.log("Available methods:", Object.keys(module));
    
    // Try to create an instance
    try {
      const service = new module.CryptoService();
      console.log("✓ CryptoService class instantiated successfully");
    } catch (error) {
      console.log("⚠ Could not instantiate CryptoService class:", error.message);
    }
    
    // Try to use the singleton instance
    try {
      if (module.cryptoService) {
        console.log("✓ cryptoService singleton available");
      } else {
        console.log("⚠ cryptoService singleton not available");
      }
    } catch (error) {
      console.log("⚠ Error accessing cryptoService singleton:", error.message);
    }
  })
  .catch((error) => {
    console.log("✗ Failed to import crypto service:", error.message);
  });