// Simple in-memory cache utility with expiration support
class MemoryCache {
  private cache: Map<string, { value: any; expiry: number | null }> = new Map();
  
  // Set a value in the cache with optional expiration time (in milliseconds)
  set(key: string, value: any, ttl?: number): void {
    const expiry = ttl ? Date.now() + ttl : null;
    this.cache.set(key, { value, expiry });
  }
  
  // Get a value from the cache if it exists and hasn't expired
  get(key: string): any {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if item has expired
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  // Check if a key exists in the cache and hasn't expired
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // Check if item has expired
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  // Delete a key from the cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  // Clear all items from the cache
  clear(): void {
    this.cache.clear();
  }
  
  // Get the number of items in the cache
  size(): number {
    // Clean up expired items first
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && Date.now() > item.expiry) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

// Create a singleton instance
const cache = new MemoryCache();

export default cache;

// Helper functions for common cache operations
export const cacheGet = (key: string): any => {
  return cache.get(key);
};

export const cacheSet = (key: string, value: any, ttl?: number): void => {
  cache.set(key, value, ttl);
};

export const cacheHas = (key: string): boolean => {
  return cache.has(key);
};

export const cacheDelete = (key: string): boolean => {
  return cache.delete(key);
};

export const cacheClear = (): void => {
  cache.clear();
};