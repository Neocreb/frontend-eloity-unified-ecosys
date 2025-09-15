import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
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
  Captions,
  Accessibility,
  Palette,
  Focus,
  Hand,
  Brain,
  Monitor,
  Settings,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Plus,
  Minus
} from 'lucide-react';

interface AccessibilitySettings {
  // Visual Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: number;
  colorBlindnessFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  darkMode: boolean;
  focusIndicators: boolean;
  
  // Audio Accessibility
  audioDescriptions: boolean;
  soundEffects: boolean;
  backgroundMusic: boolean;
  volumeAmplification: number;
  audioBalance: number;
  
  // Motor Accessibility
  keyboardNavigation: boolean;
  voiceControl: boolean;
  gestureControl: boolean;
  clickDelay: number;
  autoScroll: boolean;
  
  // Cognitive Accessibility
  autoplay: boolean;
  pauseOnUnfocus: boolean;
  readingSpeed: number;
  complexityLevel: 'simple' | 'standard' | 'advanced';
  distractionFree: boolean;
  
  // Language & Captions
  language: string;
  captionsEnabled: boolean;
  captionSize: number;
  captionBackground: boolean;
  audioTranscription: boolean;
  realTimeTranslation: boolean;
}

interface EnhancedAccessibilityFeaturesProps {
  videoElement?: HTMLVideoElement | null;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

const EnhancedAccessibilityFeatures: React.FC<EnhancedAccessibilityFeaturesProps> = ({
  videoElement,
  onSettingsChange
}) => {
  // Get initial font size based on device
  const getInitialFontSize = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 13 : 13; // 13px for both mobile and desktop
    }
    return 13;
  };

  const [settings, setSettings] = useState<AccessibilitySettings>({
    // Visual Accessibility
    highContrast: false,
    reducedMotion: false,
    fontSize: getInitialFontSize(),
    colorBlindnessFilter: 'none',
    darkMode: true,
    focusIndicators: true,
    
    // Audio Accessibility
    audioDescriptions: false,
    soundEffects: true,
    backgroundMusic: true,
    volumeAmplification: 100,
    audioBalance: 0,
    
    // Motor Accessibility
    keyboardNavigation: true,
    voiceControl: false,
    gestureControl: false,
    clickDelay: 0,
    autoScroll: false,
    
    // Cognitive Accessibility
    autoplay: true,
    pauseOnUnfocus: true,
    readingSpeed: 1,
    complexityLevel: 'standard',
    distractionFree: false,
    
    // Language & Captions
    language: 'en',
    captionsEnabled: false,
    captionSize: 16,
    captionBackground: true,
    audioTranscription: false,
    realTimeTranslation: false
  });

  const [isListening, setIsListening] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState<string[]>([]);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<boolean>(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = settings.language;
        
        recognitionRef.current.onresult = (event: any) => {
          const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
          
          if (event.results[event.results.length - 1].isFinal) {
            processVoiceCommand(command);
            setVoiceCommands(prev => [...prev.slice(-4), command]);
          }
        };
      }
    }
  }, [settings.language]);

  // Handle responsive font size on resize
  useEffect(() => {
    const handleResize = () => {
      const newFontSize = getInitialFontSize();
      if (settings.fontSize === 16 || settings.fontSize === 14) {
        // Only auto-adjust if using default sizes
        setSettings(prev => ({ ...prev, fontSize: newFontSize }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [settings.fontSize]);

  // Apply accessibility settings to the page
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply visual settings
    if (settings.highContrast) {
      root.style.filter = 'contrast(150%)';
    } else {
      root.style.filter = 'none';
    }
    
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    // Apply responsive font size with 13px base
    const isMobile = window.innerWidth < 768;
    const adjustedFontSize = isMobile ? Math.min(settings.fontSize, 13) : settings.fontSize;
    root.style.fontSize = `${adjustedFontSize}px`;
    
    // Apply color blindness filters
    const colorFilters = {
      none: '',
      protanopia: 'url(#protanopia)',
      deuteranopia: 'url(#deuteranopia)',
      tritanopia: 'url(#tritanopia)'
    };
    
    if (settings.colorBlindnessFilter !== 'none') {
      root.style.filter = `${root.style.filter} ${colorFilters[settings.colorBlindnessFilter]}`;
    }
    
    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
    
    // Distraction-free mode
    if (settings.distractionFree) {
      root.classList.add('distraction-free');
    } else {
      root.classList.remove('distraction-free');
    }
    
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  // Keyboard navigation setup
  useEffect(() => {
    if (!settings.keyboardNavigation) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!videoElement) return;
      
      switch (event.key) {
        case ' ':
          event.preventDefault();
          if (videoElement.paused) {
            videoElement.play();
          } else {
            videoElement.pause();
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          videoElement.currentTime -= 10;
          break;
        case 'ArrowRight':
          event.preventDefault();
          videoElement.currentTime += 10;
          break;
        case 'ArrowUp':
          event.preventDefault();
          videoElement.volume = Math.min(1, videoElement.volume + 0.1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          videoElement.volume = Math.max(0, videoElement.volume - 0.1);
          break;
        case 'm':
        case 'M':
          event.preventDefault();
          videoElement.muted = !videoElement.muted;
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            videoElement.requestFullscreen();
          }
          break;
        case 'c':
        case 'C':
          event.preventDefault();
          toggleCaptions();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation, videoElement]);

  const processVoiceCommand = (command: string) => {
    if (!videoElement) return;
    
    const commands = {
      'play': () => videoElement.play(),
      'pause': () => videoElement.pause(),
      'stop': () => videoElement.pause(),
      'mute': () => { videoElement.muted = true; },
      'unmute': () => { videoElement.muted = false; },
      'volume up': () => { videoElement.volume = Math.min(1, videoElement.volume + 0.2); },
      'volume down': () => { videoElement.volume = Math.max(0, videoElement.volume - 0.2); },
      'forward': () => { videoElement.currentTime += 30; },
      'back': () => { videoElement.currentTime -= 30; },
      'fullscreen': () => videoElement.requestFullscreen(),
      'captions on': () => updateSettings('captionsEnabled', true),
      'captions off': () => updateSettings('captionsEnabled', false),
      'high contrast': () => updateSettings('highContrast', !settings.highContrast),
      'reduce motion': () => updateSettings('reducedMotion', !settings.reducedMotion)
    };
    
    const matchedCommand = Object.keys(commands).find(cmd => 
      command.includes(cmd.toLowerCase())
    );
    
    if (matchedCommand) {
      commands[matchedCommand as keyof typeof commands]();
    }
  };

  const updateSettings = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleVoiceControl = () => {
    if (settings.voiceControl && recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const toggleCaptions = () => {
    updateSettings('captionsEnabled', !settings.captionsEnabled);
    
    if (videoElement) {
      const tracks = videoElement.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.kind === 'subtitles' || track.kind === 'captions') {
          track.mode = settings.captionsEnabled ? 'hidden' : 'showing';
        }
      }
    }
  };

  const resetSettings = () => {
    setSettings({
      highContrast: false,
      reducedMotion: false,
      fontSize: 13,
      colorBlindnessFilter: 'none',
      darkMode: true,
      focusIndicators: true,
      audioDescriptions: false,
      soundEffects: true,
      backgroundMusic: true,
      volumeAmplification: 100,
      audioBalance: 0,
      keyboardNavigation: true,
      voiceControl: false,
      gestureControl: false,
      clickDelay: 0,
      autoScroll: false,
      autoplay: true,
      pauseOnUnfocus: true,
      readingSpeed: 1,
      complexityLevel: 'standard',
      distractionFree: false,
      language: 'en',
      captionsEnabled: false,
      captionSize: 16,
      captionBackground: true,
      audioTranscription: false,
      realTimeTranslation: false
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Accessibility className="h-6 w-6 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold">Accessibility Settings</h2>
            <p className="text-muted-foreground">Customize your viewing experience for optimal accessibility</p>
          </div>
        </div>
        <Button variant="outline" onClick={resetSettings}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset All
        </Button>
      </div>

      {/* Quick Access Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Focus className="h-5 w-5" />
            Quick Access
          </CardTitle>
          <CardDescription>Toggle common accessibility features instantly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant={settings.captionsEnabled ? "default" : "outline"}
              onClick={() => updateSettings('captionsEnabled', !settings.captionsEnabled)}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Captions className="h-5 w-5" />
              <span className="text-xs">Captions</span>
            </Button>
            
            <Button
              variant={settings.highContrast ? "default" : "outline"}
              onClick={() => updateSettings('highContrast', !settings.highContrast)}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Contrast className="h-5 w-5" />
              <span className="text-xs">High Contrast</span>
            </Button>
            
            <Button
              variant={settings.reducedMotion ? "default" : "outline"}
              onClick={() => updateSettings('reducedMotion', !settings.reducedMotion)}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Eye className="h-5 w-5" />
              <span className="text-xs">Reduce Motion</span>
            </Button>
            
            <Button
              variant={settings.voiceControl && isListening ? "default" : "outline"}
              onClick={toggleVoiceControl}
              disabled={!settings.voiceControl}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Mic className="h-5 w-5" />
              <span className="text-xs">Voice Control</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Settings */}
      <Tabs defaultValue="visual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="motor">Motor</TabsTrigger>
          <TabsTrigger value="cognitive">Cognitive</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
        </TabsList>

        {/* Visual Accessibility */}
        <TabsContent value="visual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visual Accessibility
              </CardTitle>
              <CardDescription>Adjust visual elements for better readability and comfort</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <Switch
                      id="high-contrast"
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => updateSettings('highContrast', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduced-motion">Reduce Motion</Label>
                    <Switch
                      id="reduced-motion"
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => updateSettings('reducedMotion', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="focus-indicators">Enhanced Focus Indicators</Label>
                    <Switch
                      id="focus-indicators"
                      checked={settings.focusIndicators}
                      onCheckedChange={(checked) => updateSettings('focusIndicators', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSettings('fontSize', Math.max(12, settings.fontSize - 2))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-mono w-16 text-center">{settings.fontSize}px</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSettings('fontSize', Math.min(32, settings.fontSize + 2))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Color Blindness Filter</Label>
                    <Select
                      value={settings.colorBlindnessFilter}
                      onValueChange={(value) => updateSettings('colorBlindnessFilter', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                        <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                        <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Accessibility */}
        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Audio Accessibility
              </CardTitle>
              <CardDescription>Configure audio settings for optimal hearing experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="audio-descriptions">Audio Descriptions</Label>
                    <Switch
                      id="audio-descriptions"
                      checked={settings.audioDescriptions}
                      onCheckedChange={(checked) => updateSettings('audioDescriptions', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-effects">Sound Effects</Label>
                    <Switch
                      id="sound-effects"
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => updateSettings('soundEffects', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="background-music">Background Music</Label>
                    <Switch
                      id="background-music"
                      checked={settings.backgroundMusic}
                      onCheckedChange={(checked) => updateSettings('backgroundMusic', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Volume Amplification</Label>
                    <Slider
                      value={[settings.volumeAmplification]}
                      onValueChange={(value) => updateSettings('volumeAmplification', value[0])}
                      max={200}
                      min={50}
                      step={10}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {settings.volumeAmplification}%
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Audio Balance</Label>
                    <Slider
                      value={[settings.audioBalance]}
                      onValueChange={(value) => updateSettings('audioBalance', value[0])}
                      max={100}
                      min={-100}
                      step={10}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {settings.audioBalance > 0 ? `Right ${settings.audioBalance}%` : 
                       settings.audioBalance < 0 ? `Left ${Math.abs(settings.audioBalance)}%` : 'Centered'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Motor Accessibility */}
        <TabsContent value="motor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="h-5 w-5" />
                Motor Accessibility
              </CardTitle>
              <CardDescription>Adjust interaction methods for motor accessibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="keyboard-nav">Keyboard Navigation</Label>
                    <Switch
                      id="keyboard-nav"
                      checked={settings.keyboardNavigation}
                      onCheckedChange={(checked) => updateSettings('keyboardNavigation', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-control">Voice Control</Label>
                    <Switch
                      id="voice-control"
                      checked={settings.voiceControl}
                      onCheckedChange={(checked) => updateSettings('voiceControl', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gesture-control">Gesture Control</Label>
                    <Switch
                      id="gesture-control"
                      checked={settings.gestureControl}
                      onCheckedChange={(checked) => updateSettings('gestureControl', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-scroll">Auto Scroll</Label>
                    <Switch
                      id="auto-scroll"
                      checked={settings.autoScroll}
                      onCheckedChange={(checked) => updateSettings('autoScroll', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Click Delay (ms)</Label>
                    <Slider
                      value={[settings.clickDelay]}
                      onValueChange={(value) => updateSettings('clickDelay', value[0])}
                      max={2000}
                      min={0}
                      step={100}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {settings.clickDelay}ms
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Keyboard Shortcuts Reference */}
              {settings.keyboardNavigation && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    Keyboard Shortcuts
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div><code className="bg-background px-1 rounded">Space</code> - Play/Pause</div>
                    <div><code className="bg-background px-1 rounded">←/→</code> - Seek</div>
                    <div><code className="bg-background px-1 rounded">↑/↓</code> - Volume</div>
                    <div><code className="bg-background px-1 rounded">M</code> - Mute</div>
                    <div><code className="bg-background px-1 rounded">F</code> - Fullscreen</div>
                    <div><code className="bg-background px-1 rounded">C</code> - Captions</div>
                  </div>
                </div>
              )}
              
              {/* Voice Commands Reference */}
              {settings.voiceControl && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Voice Commands
                    {isListening && <Badge variant="secondary" className="animate-pulse">Listening</Badge>}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-3">
                    <div>"Play" / "Pause"</div>
                    <div>"Volume up" / "Volume down"</div>
                    <div>"Mute" / "Unmute"</div>
                    <div>"Forward" / "Back"</div>
                    <div>"Fullscreen"</div>
                    <div>"Captions on" / "Captions off"</div>
                  </div>
                  {voiceCommands.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Recent: {voiceCommands.slice(-3).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cognitive Accessibility */}
        <TabsContent value="cognitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Cognitive Accessibility
              </CardTitle>
              <CardDescription>Settings to reduce cognitive load and improve comprehension</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoplay">Autoplay Videos</Label>
                    <Switch
                      id="autoplay"
                      checked={settings.autoplay}
                      onCheckedChange={(checked) => updateSettings('autoplay', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pause-unfocus">Pause on Unfocus</Label>
                    <Switch
                      id="pause-unfocus"
                      checked={settings.pauseOnUnfocus}
                      onCheckedChange={(checked) => updateSettings('pauseOnUnfocus', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="distraction-free">Distraction-Free Mode</Label>
                    <Switch
                      id="distraction-free"
                      checked={settings.distractionFree}
                      onCheckedChange={(checked) => updateSettings('distractionFree', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reading Speed</Label>
                    <Slider
                      value={[settings.readingSpeed]}
                      onValueChange={(value) => updateSettings('readingSpeed', value[0])}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {settings.readingSpeed}x speed
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Interface Complexity</Label>
                    <Select
                      value={settings.complexityLevel}
                      onValueChange={(value) => updateSettings('complexityLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple - Essential features only</SelectItem>
                        <SelectItem value="standard">Standard - Balanced interface</SelectItem>
                        <SelectItem value="advanced">Advanced - Full feature set</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language & Captions */}
        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Language & Captions
              </CardTitle>
              <CardDescription>Configure language, captions, and translation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => updateSettings('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="captions">Enable Captions</Label>
                    <Switch
                      id="captions"
                      checked={settings.captionsEnabled}
                      onCheckedChange={(checked) => updateSettings('captionsEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="caption-bg">Caption Background</Label>
                    <Switch
                      id="caption-bg"
                      checked={settings.captionBackground}
                      onCheckedChange={(checked) => updateSettings('captionBackground', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Caption Size</Label>
                    <Slider
                      value={[settings.captionSize]}
                      onValueChange={(value) => updateSettings('captionSize', value[0])}
                      max={32}
                      min={12}
                      step={2}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {settings.captionSize}px
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="audio-transcription">Audio Transcription</Label>
                    <Switch
                      id="audio-transcription"
                      checked={settings.audioTranscription}
                      onCheckedChange={(checked) => updateSettings('audioTranscription', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="real-time-translation">Real-time Translation</Label>
                    <Switch
                      id="real-time-translation"
                      checked={settings.realTimeTranslation}
                      onCheckedChange={(checked) => updateSettings('realTimeTranslation', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Color Blindness Filters SVG */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default EnhancedAccessibilityFeatures;
