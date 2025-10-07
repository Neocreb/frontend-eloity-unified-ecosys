// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Kbd,
  Search,
  Navigation,
  Zap,
  Accessibility,
  Volume2,
  VolumeX,
  Eye,
  Type,
  MousePointer,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  action: () => void;
  category: "navigation" | "actions" | "accessibility";
}

interface KeyboardShortcutsProps {
  onNavigate: (tab: string) => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onNavigate,
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      id: "overview",
      keys: ["g", "o"],
      description: "Go to Overview",
      action: () => onNavigate("overview"),
      category: "navigation",
    },
    {
      id: "projects",
      keys: ["g", "p"],
      description: "Go to Projects",
      action: () => onNavigate("projects"),
      category: "navigation",
    },
    {
      id: "proposals",
      keys: ["g", "r"],
      description: "Go to Proposals",
      action: () => onNavigate("proposals"),
      category: "navigation",
    },
    {
      id: "earnings",
      keys: ["g", "e"],
      description: "Go to Earnings",
      action: () => onNavigate("earnings"),
      category: "navigation",
    },
    {
      id: "campaigns",
      keys: ["g", "c"],
      description: "Go to Campaigns",
      action: () => onNavigate("campaigns"),
      category: "navigation",
    },
    {
      id: "analytics",
      keys: ["g", "a"],
      description: "Go to Analytics",
      action: () => onNavigate("analytics"),
      category: "navigation",
    },

    // Action shortcuts
    {
      id: "command-palette",
      keys: ["cmd", "k"],
      description: "Open Command Palette",
      action: () => setIsCommandPaletteOpen(true),
      category: "actions",
    },
    {
      id: "help",
      keys: ["?"],
      description: "Show Keyboard Shortcuts",
      action: () => setIsHelpOpen(true),
      category: "actions",
    },

    // Accessibility shortcuts
    {
      id: "skip-to-content",
      keys: ["alt", "s"],
      description: "Skip to Main Content",
      action: () => {
        const content = document.querySelector('[data-testid="main-content"]');
        if (content) {
          (content as HTMLElement).focus();
        }
      },
      category: "accessibility",
    },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const isModifier = ["control", "meta", "alt", "shift"].includes(key);
    
    if (isModifier) {
      setPressedKeys(prev => new Set(prev.add(key === "meta" ? "cmd" : key)));
      return;
    }

    const currentKeys = new Set(pressedKeys);
    currentKeys.add(key);

    // Check for shortcut matches
    const shortcut = shortcuts.find(s => {
      if (s.keys.length !== currentKeys.size) return false;
      return s.keys.every(k => currentKeys.has(k));
    });

    if (shortcut) {
      e.preventDefault();
      shortcut.action();
    }

    // Special case for single key shortcuts when no modifiers are pressed
    if (currentKeys.size === 1 && pressedKeys.size === 0) {
      const singleKeyShortcut = shortcuts.find(s => 
        s.keys.length === 1 && s.keys[0] === key
      );
      if (singleKeyShortcut) {
        e.preventDefault();
        singleKeyShortcut.action();
      }
    }
  }, [pressedKeys, shortcuts, onNavigate]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    setPressedKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(key === "meta" ? "cmd" : key);
      return newKeys;
    });
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const KeyBadge: React.FC<{ keys: string[] }> = ({ keys }) => (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && <span className="text-xs text-gray-400">+</span>}
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {key === "cmd" ? "⌘" : key === "alt" ? "⌥" : key === "shift" ? "⇧" : key.toUpperCase()}
          </Badge>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <>
      {/* Keyboard Shortcuts Help Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {Object.entries(
              shortcuts.reduce((acc, shortcut) => {
                if (!acc[shortcut.category]) acc[shortcut.category] = [];
                acc[shortcut.category].push(shortcut);
                return acc;
              }, {} as Record<string, KeyboardShortcut[]>)
            ).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="font-semibold mb-3 flex items-center gap-2 capitalize">
                  {category === "navigation" && <Navigation className="w-4 h-4" />}
                  {category === "actions" && <Zap className="w-4 h-4" />}
                  {category === "accessibility" && <Accessibility className="w-4 h-4" />}
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <KeyBadge keys={shortcut.keys} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Press <KeyBadge keys={["?"]} /> anytime to see this help
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <Dialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
        <DialogContent className="max-w-lg p-0">
          <Command>
            <CommandInput placeholder="Search commands..." />
            <CommandList>
              <CommandEmpty>No commands found.</CommandEmpty>
              <CommandGroup heading="Navigation">
                {shortcuts
                  .filter(s => s.category === "navigation")
                  .map((shortcut) => (
                    <CommandItem
                      key={shortcut.id}
                      onSelect={() => {
                        shortcut.action();
                        setIsCommandPaletteOpen(false);
                      }}
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      <span>{shortcut.description}</span>
                      <div className="ml-auto">
                        <KeyBadge keys={shortcut.keys} />
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Actions">
                {shortcuts
                  .filter(s => s.category === "actions")
                  .map((shortcut) => (
                    <CommandItem
                      key={shortcut.id}
                      onSelect={() => {
                        shortcut.action();
                        setIsCommandPaletteOpen(false);
                      }}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      <span>{shortcut.description}</span>
                      <div className="ml-auto">
                        <KeyBadge keys={shortcut.keys} />
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Accessibility Settings Component
export const AccessibilitySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
  });

  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = (key: keyof typeof settings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] };
      
      // Apply settings to document
      if (key === "highContrast") {
        document.documentElement.classList.toggle("high-contrast", newSettings.highContrast);
      }
      if (key === "largeText") {
        document.documentElement.classList.toggle("large-text", newSettings.largeText);
      }
      if (key === "reducedMotion") {
        document.documentElement.classList.toggle("reduced-motion", newSettings.reducedMotion);
      }
      
      return newSettings;
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 h-12 w-12 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 text-white z-40"
        aria-label="Accessibility Settings"
      >
        <Accessibility className="w-5 h-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Accessibility Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">High Contrast</span>
                </div>
                <Button
                  variant={settings.highContrast ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting("highContrast")}
                >
                  {settings.highContrast ? "On" : "Off"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <span className="text-sm font-medium">Large Text</span>
                </div>
                <Button
                  variant={settings.largeText ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting("largeText")}
                >
                  {settings.largeText ? "On" : "Off"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4" />
                  <span className="text-sm font-medium">Reduced Motion</span>
                </div>
                <Button
                  variant={settings.reducedMotion ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting("reducedMotion")}
                >
                  {settings.reducedMotion ? "On" : "Off"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.screenReader ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-sm font-medium">Screen Reader Support</span>
                </div>
                <Button
                  variant={settings.screenReader ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting("screenReader")}
                >
                  {settings.screenReader ? "On" : "Off"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Keyboard Navigation</span>
                </div>
                <Button
                  variant={settings.keyboardNavigation ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting("keyboardNavigation")}
                >
                  {settings.keyboardNavigation ? "On" : "Off"}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                These settings are saved locally and will persist across sessions.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Skip to Content Link
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Skip to main content
    </a>
  );
};

export default KeyboardShortcuts;
