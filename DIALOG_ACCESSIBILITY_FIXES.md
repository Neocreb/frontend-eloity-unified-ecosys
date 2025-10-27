# Dialog Accessibility Fixes

## Issue Identified
The accessibility warning "Missing `Description` or `aria-describedby={undefined}` for {DialogContent}" was appearing in the console. This indicates that some Dialog components were not properly implementing accessibility attributes required by Radix UI.

## Root Cause
Several custom Dialog components were missing the accessibility warning system that checks for the presence of DialogTitle components:
1. `ResponsiveDialogContent` component
2. `MobileDialogContent` component
3. `MobileDrawer` component

Additionally, some components might have been using DialogContent without proper DialogTitle components.

## Solution Implemented

### 1. Added Accessibility Warnings
Added development-time warnings to custom Dialog components to ensure proper accessibility:

#### Responsive Dialog Components
- Added useEffect hook to `ResponsiveDialogContent` to check for `ResponsiveDialogTitle`
- Added warning message when `ResponsiveDialogTitle` is missing
- Similar checks for nested components

#### Mobile Dialog Components
- Added useEffect hook to `MobileDialogContent` to check for `MobileDialogTitle`
- Added warning message when `MobileDialogTitle` is missing
- Added same check to `MobileDrawer` component

### 2. Updated Components
The following files were modified to include accessibility checks:

1. `src/components/ui/responsive-dialog.tsx`
   - Added accessibility warning to `ResponsiveDialogContent`
   - Ensures `ResponsiveDialogTitle` is present

2. `src/components/ui/mobile-optimized-dialog.tsx`
   - Added accessibility warning to `MobileDialogContent`
   - Added accessibility warning to `MobileDrawer`
   - Ensures `MobileDialogTitle` is present

## Best Practices for Dialog Accessibility

### 1. Always Include DialogTitle
Every Dialog component should include a DialogTitle component:
```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Optional description</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### 2. Use VisuallyHidden for Hidden Titles
If a visual title is not desired but accessibility is still needed:
```tsx
<Dialog>
  <DialogContent>
    <VisuallyHidden>
      <DialogTitle>Hidden Title for Accessibility</DialogTitle>
    </VisuallyHidden>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### 3. Use Wrapper Components
Use the provided accessibility wrapper components:
```tsx
<AccessibleDialogWrapper
  open={open}
  onOpenChange={setOpen}
  title="My Dialog Title"
  hideTitle={false}
>
  {/* Dialog content */}
</AccessibleDialogWrapper>
```

## Files Modified
1. `src/components/ui/responsive-dialog.tsx` - Added accessibility warnings
2. `src/components/ui/mobile-optimized-dialog.tsx` - Added accessibility warnings

## Verification
The fixes ensure that:
- Development warnings will appear when DialogTitle is missing
- All custom Dialog components follow accessibility best practices
- Users with screen readers will have proper context for Dialog components

## Next Steps
1. Review all Dialog implementations in the codebase to ensure they include proper titles
2. Consider creating a linting rule to enforce DialogTitle usage
3. Document accessibility requirements for future Dialog component development