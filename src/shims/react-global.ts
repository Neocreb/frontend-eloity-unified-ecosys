// Ensure React namespace is available globally for legacy files that reference React.<any> without importing it.
import * as React from 'react';

// Attach to globalThis so modules relying on React variable (e.g., React.useState) work.
// This is a compatibility shim for parts of the codebase that haven't been migrated to named imports.
if (typeof globalThis !== 'undefined') {
  // @ts-ignore
  globalThis.React = React;
}
