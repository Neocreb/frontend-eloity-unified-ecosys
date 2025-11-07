// @ts-nocheck
import {
  useState,
  useEffect,
  useContext,
  createContext,
  type ReactNode,
  type FC,
} from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accessibility,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Type,
  Contrast,
  MousePointer,
  Keyboard,
  Mic,
  Languages,
  Palette,
  Moon,
  Sun,
  Zap,
  Focus,
  Hand,
  Headphones,
  Settings,
  HelpCircle,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Move,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Plus,
  Minus,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Accessibility Context
interface AccessibilitySettings {
  // Visual
  highContrast: boolean;
  darkMode: boolean;
  fontSize: number;
  fontFamily: string;
  reducedMotion: boolean;
  colorBlindSupport: boolean;
  focusIndicators: boolean;

  // Audio
  screenReader: boolean;
  audioDescriptions: boolean;
  soundEnabled: boolean;
  volume: number;

  // Motor
  stickyKeys: boolean;
  slowKeys: boolean;
  bounceKeys: boolean;
  mouseKeys: boolean;
  clickAssist: boolean;

  // Cognitive
  simplifiedUI: boolean;
  readingGuide: boolean;
  autoScroll: boolean;
  memoryAid: boolean;

  // Language
  language: string;
  rightToLeft: boolean;
  translationEnabled: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  speak: (text: string) => void;
  announceToScreenReader: (message: string) => void;
  focusNext: () => void;
  focusPrevious: () => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  darkMode: false,
  fontSize: 13,
  fontFamily: "system",
  reducedMotion: false,
  colorBlindSupport: false,
  focusIndicators: true,
  screenReader: false,
  audioDescriptions: false,
  soundEnabled: true,
  volume: 70,
  stickyKeys: false,
  slowKeys: false,
  bounceKeys: false,
  mouseKeys: false,
  clickAssist: false,
  simplifiedUI: false,
  readingGuide: false,
  autoScroll: false,
  memoryAid: false,
  language: "en",
  rightToLeft: false,
  translationEnabled: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(
  null,
);

// Accessibility Provider
export const AccessibilityProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("accessibility-settings");
    return saved
      ? { ...defaultSettings, ...JSON.parse(saved) }
      : defaultSettings;
  });

  const [speechSynthesis, setSpeechSynthesis] =
    useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
    applyAccessibilitySettings(settings);
  }, [settings]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const speak = (text: string) => {
    if (speechSynthesis && settings.screenReader) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = settings.volume / 100;
      speechSynthesis.speak(utterance);
    }
  };

  const announceToScreenReader = (message: string) => {
    if (settings.screenReader) {
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.style.position = "absolute";
      announcement.style.left = "-10000px";
      announcement.style.width = "1px";
      announcement.style.height = "1px";
      announcement.style.overflow = "hidden";
      announcement.textContent = message;

      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  };

  const focusNext = () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const current = document.activeElement;
    const currentIndex = Array.from(focusableElements).indexOf(
      current as Element,
    );
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    (focusableElements[nextIndex] as HTMLElement)?.focus();
  };

  const focusPrevious = () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const current = document.activeElement;
    const currentIndex = Array.from(focusableElements).indexOf(
      current as Element,
    );
    const prevIndex =
      currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    (focusableElements[prevIndex] as HTMLElement)?.focus();
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        speak,
        announceToScreenReader,
        focusNext,
        focusPrevious,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

// Hook to use accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within AccessibilityProvider",
    );
  }
  return context;
};

// Apply accessibility settings to the DOM
const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
  const root = document.documentElement;

  // Font size
  root.style.fontSize = `${settings.fontSize}px`;

  // Font family
  if (settings.fontFamily !== "system") {
    root.style.fontFamily = settings.fontFamily;
  }

  // High contrast
  if (settings.highContrast) {
    root.classList.add("high-contrast");
  } else {
    root.classList.remove("high-contrast");
  }

  // Reduced motion
  if (settings.reducedMotion) {
    root.style.setProperty("--animation-duration", "0.01ms");
    root.style.setProperty("--transition-duration", "0.01ms");
  } else {
    root.style.removeProperty("--animation-duration");
    root.style.removeProperty("--transition-duration");
  }

  // RTL support
  if (settings.rightToLeft) {
    root.dir = "rtl";
  } else {
    root.dir = "ltr";
  }

  // Focus indicators
  if (settings.focusIndicators) {
    root.classList.add("enhanced-focus");
  } else {
    root.classList.remove("enhanced-focus");
  }
};

// Accessibility Control Panel
export const AccessibilityControlPanel: FC = () => {
  const { settings, updateSettings, speak } = useAccessibility();
  const { toast } = useToast();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleTestScreenReader = () => {
    speak(
      "Screen reader test. This is how content will be announced to users with visual impairments.",
    );
    toast({
      title: "Screen reader test",
      description: "Audio announcement has been spoken",
    });
  };

  const resetSettings = () => {
    updateSettings(defaultSettings);
    toast({
      title: "Settings reset",
      description: "All accessibility settings have been reset to defaults",
    });
  };

  // Only show accessibility button on landing and auth pages
  if (location.pathname !== "/" && location.pathname !== "/auth") {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50"
        >
          <Accessibility className="w-4 h-4 mr-2" />
          Accessibility
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Accessibility Settings
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visual Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="w-4 h-4" />
                Visual Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) =>
                    updateSettings({ highContrast: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) =>
                    updateSettings({ darkMode: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Font Size: {settings.fontSize}px</Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) =>
                    updateSettings({ fontSize: value })
                  }
                  min={12}
                  max={24}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) =>
                    updateSettings({ fontFamily: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Default</SelectItem>
                    <SelectItem value="dyslexic">OpenDyslexic</SelectItem>
                    <SelectItem value="arial">Arial</SelectItem>
                    <SelectItem value="verdana">Verdana</SelectItem>
                    <SelectItem value="tahoma">Tahoma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion">Reduce Motion</Label>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) =>
                    updateSettings({ reducedMotion: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="color-blind">Color Blind Support</Label>
                <Switch
                  id="color-blind"
                  checked={settings.colorBlindSupport}
                  onCheckedChange={(checked) =>
                    updateSettings({ colorBlindSupport: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="focus-indicators">
                  Enhanced Focus Indicators
                </Label>
                <Switch
                  id="focus-indicators"
                  checked={settings.focusIndicators}
                  onCheckedChange={(checked) =>
                    updateSettings({ focusIndicators: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Volume2 className="w-4 h-4" />
                Audio Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader">Screen Reader Support</Label>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReader}
                  onCheckedChange={(checked) =>
                    updateSettings({ screenReader: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="audio-descriptions">Audio Descriptions</Label>
                <Switch
                  id="audio-descriptions"
                  checked={settings.audioDescriptions}
                  onCheckedChange={(checked) =>
                    updateSettings({ audioDescriptions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled">Sound Effects</Label>
                <Switch
                  id="sound-enabled"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) =>
                    updateSettings({ soundEnabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Volume: {settings.volume}%</Label>
                <Slider
                  value={[settings.volume]}
                  onValueChange={([value]) => updateSettings({ volume: value })}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <Button
                onClick={handleTestScreenReader}
                variant="outline"
                className="w-full"
              >
                <Headphones className="w-4 h-4 mr-2" />
                Test Screen Reader
              </Button>
            </CardContent>
          </Card>

          {/* Motor Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Hand className="w-4 h-4" />
                Motor Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sticky-keys">Sticky Keys</Label>
                <Switch
                  id="sticky-keys"
                  checked={settings.stickyKeys}
                  onCheckedChange={(checked) =>
                    updateSettings({ stickyKeys: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="slow-keys">Slow Keys</Label>
                <Switch
                  id="slow-keys"
                  checked={settings.slowKeys}
                  onCheckedChange={(checked) =>
                    updateSettings({ slowKeys: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="bounce-keys">Bounce Keys</Label>
                <Switch
                  id="bounce-keys"
                  checked={settings.bounceKeys}
                  onCheckedChange={(checked) =>
                    updateSettings({ bounceKeys: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="mouse-keys">Mouse Keys</Label>
                <Switch
                  id="mouse-keys"
                  checked={settings.mouseKeys}
                  onCheckedChange={(checked) =>
                    updateSettings({ mouseKeys: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="click-assist">Click Assist</Label>
                <Switch
                  id="click-assist"
                  checked={settings.clickAssist}
                  onCheckedChange={(checked) =>
                    updateSettings({ clickAssist: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Cognitive Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Focus className="w-4 h-4" />
                Cognitive Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="simplified-ui">Simplified Interface</Label>
                <Switch
                  id="simplified-ui"
                  checked={settings.simplifiedUI}
                  onCheckedChange={(checked) =>
                    updateSettings({ simplifiedUI: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reading-guide">Reading Guide</Label>
                <Switch
                  id="reading-guide"
                  checked={settings.readingGuide}
                  onCheckedChange={(checked) =>
                    updateSettings({ readingGuide: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-scroll">Auto Scroll</Label>
                <Switch
                  id="auto-scroll"
                  checked={settings.autoScroll}
                  onCheckedChange={(checked) =>
                    updateSettings({ autoScroll: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="memory-aid">Memory Aid</Label>
                <Switch
                  id="memory-aid"
                  checked={settings.memoryAid}
                  onCheckedChange={(checked) =>
                    updateSettings({ memoryAid: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Language & Localization */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Languages className="w-4 h-4" />
                Language & Localization
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => updateSettings({ language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="rtl">Right-to-Left Text</Label>
                <Switch
                  id="rtl"
                  checked={settings.rightToLeft}
                  onCheckedChange={(checked) =>
                    updateSettings({ rightToLeft: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="translation">Auto Translation</Label>
                <Switch
                  id="translation"
                  checked={settings.translationEnabled}
                  onCheckedChange={(checked) =>
                    updateSettings({ translationEnabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Apply Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Screen Reader Announcer Component
export const ScreenReaderAnnouncer: FC<{
  message: string;
  priority?: "polite" | "assertive";
}> = ({ message, priority = "polite" }) => {
  useEffect(() => {
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", priority);
    announcer.setAttribute("aria-atomic", "true");
    announcer.style.position = "absolute";
    announcer.style.left = "-10000px";
    announcer.style.width = "1px";
    announcer.style.height = "1px";
    announcer.style.overflow = "hidden";
    announcer.textContent = message;

    document.body.appendChild(announcer);

    const timeout = setTimeout(() => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    };
  }, [message, priority]);

  return null;
};

// Keyboard Navigation Helper
export const KeyboardNavigationHelper: FC = () => {
  const { settings, focusNext, focusPrevious } = useAccessibility();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip navigation
      if (event.altKey && event.key === "j") {
        event.preventDefault();
        focusNext();
      }

      if (event.altKey && event.key === "k") {
        event.preventDefault();
        focusPrevious();
      }

      // Help toggle
      if (event.altKey && event.key === "?") {
        event.preventDefault();
        setShowHelp(!showHelp);
      }

      // Escape to close help
      if (event.key === "Escape" && showHelp) {
        setShowHelp(false);
      }
    };

    if (settings.focusIndicators) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [settings.focusIndicators, focusNext, focusPrevious, showHelp]);

  if (!showHelp) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-labelledby="keyboard-help-title"
      aria-describedby="keyboard-help-description"
    >
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle id="keyboard-help-title">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent id="keyboard-help-description">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Next element:</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + J</kbd>
            </div>
            <div className="flex justify-between">
              <span>Previous element:</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + K</kbd>
            </div>
            <div className="flex justify-between">
              <span>Show this help:</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + ?</kbd>
            </div>
            <div className="flex justify-between">
              <span>Close help:</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Escape</kbd>
            </div>
            <div className="flex justify-between">
              <span>Tab navigation:</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">
                Tab / Shift+Tab
              </kbd>
            </div>
            <div className="flex justify-between">
              <span>Activate button:</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">
                Enter / Space
              </kbd>
            </div>
          </div>

          <Button
            className="w-full mt-4"
            onClick={() => setShowHelp(false)}
            autoFocus
          >
            Close Help
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Reading Guide Component
export const ReadingGuide: FC = () => {
  const { settings } = useAccessibility();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!settings.readingGuide) return;

    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [settings.readingGuide]);

  if (!settings.readingGuide) return null;

  return (
    <>
      {/* Horizontal line */}
      <div
        className="fixed inset-x-0 h-px bg-yellow-400 pointer-events-none z-50"
        style={{ top: position.y }}
      />
      {/* Vertical line */}
      <div
        className="fixed inset-y-0 w-px bg-yellow-400 pointer-events-none z-50"
        style={{ left: position.x }}
      />
    </>
  );
};

// Text-to-Speech Button
interface TextToSpeechProps {
  text: string;
  children?: ReactNode;
}

export const TextToSpeechButton: FC<TextToSpeechProps> = ({
  text,
  children,
}) => {
  const { speak, settings } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speak(text);
      setIsSpeaking(true);

      // Reset state when speech ends
      setTimeout(() => setIsSpeaking(false), text.length * 50);
    }
  };

  if (!settings.screenReader) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSpeak}
            aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
          >
            {children ||
              (isSpeaking ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              ))}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSpeaking ? "Stop reading" : "Read aloud"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Skip Link Component
export const SkipLink: FC<{
  href: string;
  children: ReactNode;
}> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
    >
      {children}
    </a>
  );
};

export default {
  AccessibilityProvider,
  useAccessibility,
  AccessibilityControlPanel,
  ScreenReaderAnnouncer,
  KeyboardNavigationHelper,
  ReadingGuide,
  TextToSpeechButton,
  SkipLink,
};
