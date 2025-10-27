import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ResponsiveDialog = DialogPrimitive.Root;

const ResponsiveDialogTrigger = DialogPrimitive.Trigger;

const ResponsiveDialogPortal = DialogPrimitive.Portal;

const ResponsiveDialogClose = DialogPrimitive.Close;

const ResponsiveDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
ResponsiveDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface ResponsiveDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  mobileFullScreen?: boolean;
}

const ResponsiveDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ResponsiveDialogContentProps
>(
  (
    { className, children, size = "md", mobileFullScreen = false, ...props },
    ref,
  ) => {
    // Development warning for missing DialogTitle
    React.useEffect(() => {
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
        const childrenArray = React.Children.toArray(children);
        const hasDialogTitle = childrenArray.some(child =>
          React.isValidElement(child) &&
          (child.type === ResponsiveDialogTitle ||
           (typeof child.type === 'object' && child.type?.displayName === 'DialogTitle') ||
           child.props?.children && React.Children.toArray(child.props.children).some(grandchild =>
             React.isValidElement(grandchild) &&
             (grandchild.type === ResponsiveDialogTitle ||
              (typeof grandchild.type === 'object' && grandchild.type?.displayName === 'DialogTitle'))
           ))
        );

        if (!hasDialogTitle) {
          console.warn('ResponsiveDialogContent requires a ResponsiveDialogTitle for accessibility. Consider adding a ResponsiveDialogTitle or wrapping it with VisuallyHidden if you want to hide it visually.');
        }
      }
    }, [children]);

    const sizeClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      full: "max-w-4xl",
    };

    return (
      <ResponsiveDialogPortal>
        <ResponsiveDialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            // Base styles
            "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            // Desktop styles
            `rounded-lg ${sizeClasses[size]}`,
            // Mobile styles
            mobileFullScreen
              ? "sm:max-w-[95vw] sm:max-h-[95vh] max-w-[100vw] max-h-[100vh] sm:rounded-lg rounded-none h-full w-full sm:h-auto sm:w-auto top-0 left-0 translate-x-0 translate-y-0 sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]"
              : "max-w-[95vw] max-h-[95vh] sm:rounded-lg rounded-lg",
            className,
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </ResponsiveDialogPortal>
    );
  },
);
ResponsiveDialogContent.displayName = DialogPrimitive.Content.displayName;

const ResponsiveDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left pr-8",
      className,
    )}
    {...props}
  />
);
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader";

const ResponsiveDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0",
      className,
    )}
    {...props}
  />
);
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter";

const ResponsiveDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
ResponsiveDialogTitle.displayName = DialogPrimitive.Title.displayName;

const ResponsiveDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ResponsiveDialogDescription.displayName =
  DialogPrimitive.Description.displayName;

// Responsive scrollable content area
const ResponsiveDialogScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-y-auto max-h-[60vh] sm:max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
ResponsiveDialogScrollArea.displayName = "ResponsiveDialogScrollArea";

export {
  ResponsiveDialog,
  ResponsiveDialogPortal,
  ResponsiveDialogOverlay,
  ResponsiveDialogClose,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogScrollArea,
};