import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { responsiveModal, mobileAnimations, zIndex, viewportHeight } from '@/utils/mobileOptimization';

const MobileDialog = DialogPrimitive.Root;
const MobileDialogTrigger = DialogPrimitive.Trigger;
const MobileDialogPortal = DialogPrimitive.Portal;
const MobileDialogClose = DialogPrimitive.Close;

const MobileDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 bg-black/50 backdrop-blur-sm',
      zIndex.overlay,
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
MobileDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface MobileDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'base' | 'lg' | 'xl' | 'full';
  mobileFullScreen?: boolean;
}

const MobileDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  MobileDialogContentProps
>(({ className, children, size = 'base', mobileFullScreen = false, ...props }, ref) => {
  // Development warning for missing DialogTitle
  React.useEffect(() => {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
      const childrenArray = React.Children.toArray(children);
      const hasDialogTitle = childrenArray.some(child =>
        React.isValidElement(child) &&
        (child.type === MobileDialogTitle ||
         (typeof child.type === 'object' && child.type?.displayName === 'DialogTitle') ||
         child.props?.children && React.Children.toArray(child.props.children).some(grandchild =>
           React.isValidElement(grandchild) &&
           (grandchild.type === MobileDialogTitle ||
            (typeof grandchild.type === 'object' && grandchild.type?.displayName === 'DialogTitle'))
         ))
      );

      if (!hasDialogTitle) {
        console.warn('MobileDialogContent requires a MobileDialogTitle for accessibility. Consider adding a MobileDialogTitle or wrapping it with VisuallyHidden if you want to hide it visually.');
      }
    }
  }, [children]);

  return (
    <MobileDialogPortal>
      <MobileDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed bg-background border shadow-lg duration-200',
          zIndex.modal,
          // Mobile-first positioning
          mobileFullScreen 
            ? 'inset-0 m-0 rounded-none' // Full screen on mobile
            : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg m-4', // Centered with margin
          // Responsive sizing
          !mobileFullScreen && responsiveModal[size],
          // Mobile-specific height management
          mobileFullScreen 
            ? viewportHeight.safe 
            : 'max-h-[90vh] sm:max-h-[85vh]',
          // Mobile optimizations
          'overflow-y-auto overscroll-contain',
          // Animations
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          mobileFullScreen 
            ? 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95'
            : 'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity',
            'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
            // Touch-friendly close button
            'min-h-[44px] min-w-[44px] flex items-center justify-center'
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </MobileDialogPortal>
  );
});
MobileDialogContent.displayName = DialogPrimitive.Content.displayName;

const MobileDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 p-4 sm:p-6 pb-2 sm:pb-4',
      // Mobile header optimizations
      'border-b border-border/10',
      className
    )}
    {...props}
  />
);
MobileDialogHeader.displayName = 'MobileDialogHeader';

const MobileDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      'p-4 sm:p-6 pt-2 sm:pt-4 gap-2 sm:gap-0',
      // Mobile footer optimizations
      'border-t border-border/10',
      // Safe area for mobile devices with home indicators
      'pb-safe-or-4',
      className
    )}
    {...props}
  />
);
MobileDialogFooter.displayName = 'MobileDialogFooter';

const MobileDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg sm:text-xl font-semibold leading-none tracking-tight',
      // Mobile typography optimization
      'pr-10', // Account for close button
      className
    )}
    {...props}
  />
));
MobileDialogTitle.displayName = DialogPrimitive.Title.displayName;

const MobileDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      'text-sm sm:text-base text-muted-foreground leading-relaxed',
      // Mobile typography optimization
      'pr-10', // Account for close button
      className
    )}
    {...props}
  />
));
MobileDialogDescription.displayName = DialogPrimitive.Description.displayName;

// Mobile-specific body component for better content management
const MobileDialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex-1 p-4 sm:p-6 py-2 sm:py-4',
      // Mobile content optimizations
      'overflow-y-auto overscroll-contain',
      // Better touch scrolling on iOS
      '-webkit-overflow-scrolling: touch',
      className
    )}
    {...props}
  />
);
MobileDialogBody.displayName = 'MobileDialogBody';

// Mobile drawer variant (slides up from bottom)
interface MobileDrawerProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  snapPoints?: number[]; // Percentage heights: [25, 50, 75, 100]
  defaultSnapPoint?: number;
}

const MobileDrawer = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  MobileDrawerProps
>(({ className, children, snapPoints = [50, 100], defaultSnapPoint = 50, ...props }, ref) => {
  const [snapPoint, setSnapPoint] = React.useState(defaultSnapPoint);

  // Development warning for missing DialogTitle
  React.useEffect(() => {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
      const childrenArray = React.Children.toArray(children);
      const hasDialogTitle = childrenArray.some(child =>
        React.isValidElement(child) &&
        (child.type === MobileDialogTitle ||
         (typeof child.type === 'object' && child.type?.displayName === 'DialogTitle') ||
         child.props?.children && React.Children.toArray(child.props.children).some(grandchild =>
           React.isValidElement(grandchild) &&
           (grandchild.type === MobileDialogTitle ||
            (typeof grandchild.type === 'object' && grandchild.type?.displayName === 'DialogTitle'))
         ))
      );

      if (!hasDialogTitle) {
        console.warn('MobileDrawer requires a MobileDialogTitle for accessibility. Consider adding a MobileDialogTitle or wrapping it with VisuallyHidden if you want to hide it visually.');
      }
    }
  }, [children]);

  return (
    <MobileDialogPortal>
      <MobileDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg',
          zIndex.modal,
          // Height based on snap point
          `h-[${snapPoint}%]`,
          // Mobile drawer styling
          'rounded-t-lg sm:rounded-t-xl',
          'overflow-hidden',
          // Animations
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          className
        )}
        {...props}
      >
        {/* Drag handle */}
        <div className="flex justify-center p-2">
          <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
        
        {/* Snap point indicators */}
        {snapPoints.length > 1 && (
          <div className="flex justify-center gap-1 pb-2">
            {snapPoints.map((point) => (
              <button
                key={point}
                onClick={() => setSnapPoint(point)}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  point === snapPoint ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </DialogPrimitive.Content>
    </MobileDialogPortal>
  );
});
MobileDrawer.displayName = 'MobileDrawer';

export {
  MobileDialog,
  MobileDialogPortal,
  MobileDialogOverlay,
  MobileDialogClose,
  MobileDialogTrigger,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogFooter,
  MobileDialogTitle,
  MobileDialogDescription,
  MobileDialogBody,
  MobileDrawer,
};