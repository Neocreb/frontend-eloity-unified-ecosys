// Simple import test to verify components can be imported
import MapComponent from '@/components/shared/MapComponent';
import LocationPicker from '@/components/shared/LocationPicker';

// Export to verify successful import
export { MapComponent, LocationPicker };

// Simple function to verify TypeScript compilation
export const testFunction = (): string => {
  return "Import test successful";
};