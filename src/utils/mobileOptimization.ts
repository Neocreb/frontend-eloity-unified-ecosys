// Mobile optimization utilities and responsive design helpers

export const breakpoints = {
  xs: '320px',   // Extra small devices
  sm: '640px',   // Small devices
  md: '768px',   // Medium devices
  lg: '1024px',  // Large devices
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // 2X large devices
} as const;

// Responsive text sizes that scale properly across devices
export const responsiveText = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-sm sm:text-base lg:text-lg',
  lg: 'text-base sm:text-lg lg:text-xl',
  xl: 'text-lg sm:text-xl lg:text-2xl',
  '2xl': 'text-xl sm:text-2xl lg:text-3xl',
  '3xl': 'text-2xl sm:text-3xl lg:text-4xl',
} as const;

// Touch-friendly minimum sizes (44px as per accessibility guidelines)
export const touchTarget = {
  sm: 'min-h-[36px] min-w-[36px]',
  base: 'min-h-[44px] min-w-[44px]',
  lg: 'min-h-[48px] min-w-[48px]',
} as const;

// Responsive padding and margins
export const responsiveSpacing = {
  xs: 'p-2 sm:p-3',
  sm: 'p-3 sm:p-4',
  base: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
  xl: 'p-8 sm:p-12',
} as const;

// Common responsive grid patterns
export const responsiveGrids = {
  auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  cards: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  features: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  dashboard: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  products: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  navigation: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8',
  tabs: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6',
} as const;

// Responsive modal and dialog sizes
export const responsiveModal = {
  sm: 'w-full max-w-sm sm:max-w-md',
  base: 'w-full max-w-lg sm:max-w-xl',
  lg: 'w-full max-w-xl sm:max-w-2xl lg:max-w-4xl',
  xl: 'w-full max-w-2xl sm:max-w-4xl lg:max-w-6xl',
  full: 'w-full h-full sm:w-auto sm:h-auto sm:max-w-4xl',
} as const;

// Mobile-first container classes
export const mobileContainer = {
  base: 'w-full px-4 sm:px-6 lg:px-8',
  tight: 'w-full px-2 sm:px-4',
  wide: 'w-full px-4 sm:px-6 lg:px-8 xl:px-12',
  centered: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
} as const;

// Mobile-optimized chart and visualization sizes
export const responsiveCharts = {
  sm: 'h-[200px] sm:h-[250px] lg:h-[300px]',
  base: 'h-[250px] sm:h-[350px] lg:h-[400px]',
  lg: 'h-[300px] sm:h-[400px] lg:h-[500px]',
  xl: 'h-[400px] sm:h-[500px] lg:h-[600px]',
} as const;

// Safe area considerations for mobile devices
export const safeArea = {
  top: 'pt-safe-or-4',
  bottom: 'pb-safe-or-4',
  paddingBottom: 'pb-4 sm:pb-6 safe-area-pb',
} as const;

// Utility function to check if device is mobile
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// Utility function to get responsive class based on screen size
export const getResponsiveClass = (
  mobile: string,
  tablet?: string,
  desktop?: string
): string => {
  const classes = [mobile];
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  return classes.join(' ');
};

// Touch gesture helpers
export const touchGestures = {
  swipeable: 'touch-pan-x select-none',
  scrollable: 'overflow-auto overscroll-contain',
  noScroll: 'overflow-hidden overscroll-none',
} as const;

// Z-index management for mobile layers
export const zIndex = {
  base: 'z-0',
  dropdown: 'z-10',
  overlay: 'z-50',
  modal: 'z-60',
  tooltip: 'z-70',
  toast: 'z-80',
  mobileMenu: 'z-90',
  loading: 'z-100',
} as const;

// Mobile-specific animations
export const mobileAnimations = {
  slideUp: 'animate-in slide-in-from-bottom-full duration-300',
  slideDown: 'animate-in slide-in-from-top-full duration-300',
  fadeIn: 'animate-in fade-in duration-200',
  scaleIn: 'animate-in zoom-in-95 duration-200',
} as const;

// Keyboard-aware viewport height for mobile
export const viewportHeight = {
  screen: 'h-screen',
  safe: 'h-[100dvh]', // Dynamic viewport height
  keyboard: 'h-[100svh]', // Small viewport height (keyboard aware)
} as const;

// Typography scales for better readability on mobile
export const mobileTypography = {
  display: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight',
  heading: 'text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight',
  subheading: 'text-lg sm:text-xl lg:text-2xl font-medium',
  body: 'text-sm sm:text-base lg:text-lg leading-relaxed',
  caption: 'text-xs sm:text-sm leading-normal',
  label: 'text-xs sm:text-sm font-medium',
} as const;

// Input and form optimizations for mobile
export const mobileInputs = {
  base: 'w-full px-3 py-2 text-base sm:text-sm rounded-md border focus:ring-2 focus:ring-primary focus:border-transparent',
  large: 'w-full px-4 py-3 text-lg sm:text-base rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent',
  search: 'w-full pl-10 pr-4 py-2 text-base sm:text-sm rounded-full border focus:ring-2 focus:ring-primary focus:border-transparent',
} as const;

// Button sizes optimized for touch
export const mobileButtons = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  base: 'px-4 py-2 text-sm sm:text-base min-h-[44px]',
  lg: 'px-6 py-3 text-base min-h-[48px]',
  icon: 'p-2 min-h-[44px] min-w-[44px]',
  fab: 'w-14 h-14 rounded-full fixed bottom-4 right-4 z-50',
} as const;

// Card and content containers for mobile
export const mobileCards = {
  base: 'w-full bg-white rounded-lg border shadow-sm p-4 sm:p-6',
  compact: 'w-full bg-white rounded-lg border shadow-sm p-3 sm:p-4',
  feature: 'w-full bg-white rounded-xl border shadow-md p-6 sm:p-8',
  interactive: 'w-full bg-white rounded-lg border shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer',
} as const;

// Export helper function to combine classes
export const cn = (...classes: (string | undefined | false | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Mobile optimization wrapper component props
export interface MobileOptimizedProps {
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  children: React.ReactNode;
}

// Default mobile-first configuration
export const mobileDefaults = {
  maxWidth: 'max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl',
  spacing: responsiveSpacing.base,
  text: responsiveText.base,
  grid: responsiveGrids.auto,
  modal: responsiveModal.base,
  button: mobileButtons.base,
  input: mobileInputs.base,
  card: mobileCards.base,
} as const;
