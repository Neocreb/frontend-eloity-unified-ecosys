// @ts-nocheck
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ResponsiveTabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  shortLabel?: string; // For mobile display
}

interface ResponsiveTabsProps {
  items: ResponsiveTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  enableMobileScroll?: boolean;
}

export const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({
  items,
  value,
  onValueChange,
  children,
  className,
  enableMobileScroll = true,
}) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      {enableMobileScroll ? (
        <>
          {/* Mobile tabs with horizontal scroll */}
          <div className="lg:hidden mobile-tabs-container">
            <TabsList className="flex w-full overflow-x-auto gap-1 p-1 h-auto min-h-[60px] mobile-tabs-scroll">
              {items.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex flex-col items-center gap-1 text-xs min-w-[65px] h-auto py-2 px-2 mobile-tab-item touch-target"
                >
                  {item.icon && (
                    <div className="w-4 h-4 flex-shrink-0">{item.icon}</div>
                  )}
                  <span className="text-[10px] leading-tight text-center">
                    {item.shortLabel || item.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Desktop tabs with proper grid */}
          <div className="hidden lg:block">
            <TabsList
              className={cn("grid w-full", `grid-cols-${items.length}`)}
            >
              {items.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex flex-row items-center gap-2 text-sm"
                >
                  {item.icon && <div className="w-4 h-4">{item.icon}</div>}
                  <span>{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </>
      ) : (
        /* Responsive grid layout */
        <TabsList className="responsive-tabs-grid w-full p-1 h-auto">
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm h-auto py-2 px-1 sm:px-2 touch-target"
            >
              {item.icon && (
                <div className="w-4 h-4 flex-shrink-0">{item.icon}</div>
              )}
              <span className="text-[10px] sm:text-sm leading-tight text-center">
                {item.shortLabel || item.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      {children}
    </Tabs>
  );
};

export { ResponsiveTabs };
