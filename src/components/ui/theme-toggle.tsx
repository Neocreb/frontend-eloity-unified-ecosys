import React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemeToggle: React.FC = () => {
  // Add fallback handling for theme context
  const [fallbackTheme, setFallbackTheme] = React.useState<
    "light" | "dark" | "system"
  >("light");

  let theme: string = fallbackTheme;
  let setTheme: (theme: "light" | "dark" | "system") => void = setFallbackTheme;
  let isDark: boolean = false;

  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    setTheme = themeContext.setTheme;
    isDark = themeContext.isDark;
  } catch (error) {
    console.warn(
      "ThemeToggle: Theme context not available, using fallback",
      error,
    );
    // Use fallback values defined above
    isDark = fallbackTheme === "dark";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-accent" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
