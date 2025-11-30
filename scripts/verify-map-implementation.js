#!/usr/bin/env node

// Script to verify map implementation
console.log('Verifying map implementation...');

// Check if our components exist
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const components = [
  'src/components/shared/MapComponent.tsx',
  'src/components/shared/LocationPicker.tsx',
  'src/components/shared/index.ts'
];

components.forEach(component => {
  if (fs.existsSync(path.join(__dirname, '..', component))) {
    console.log(`✓ ${component} found`);
  } else {
    console.log(`✗ ${component} missing`);
  }
});

// Check if enhanced components exist
const enhancedComponents = [
  'src/components/feed/CheckInModal.tsx',
  'src/components/feed/FeelingLocationModal.tsx'
];

enhancedComponents.forEach(component => {
  if (fs.existsSync(path.join(__dirname, '..', component))) {
    console.log(`✓ ${component} found`);
  } else {
    console.log(`✗ ${component} missing`);
  }
});

console.log('\nMap implementation verification complete.');
console.log('\nNote: Dependencies verification skipped in this script.');
console.log('To verify dependencies, run: npm list leaflet react-leaflet @types/leaflet');