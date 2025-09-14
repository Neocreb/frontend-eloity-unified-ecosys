// Centralized feature flags
export const USE_MOCK_DATA = (import.meta.env.VITE_USE_MOCK_DATA === 'true' || import.meta.env.VITE_USE_MOCK_DATA === '1');

export default {
  USE_MOCK_DATA,
};
