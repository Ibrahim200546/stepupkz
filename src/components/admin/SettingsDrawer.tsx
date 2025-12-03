/**
 * Settings Drawer - крутые настройки как в Slash Admin
 */
import { useState } from 'react';
import { Settings, X, Moon, Sun, Monitor, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type Theme = 'light' | 'dark' | 'system';
type Layout = 'vertical' | 'horizontal' | 'mini';
type PresetColor = 'default' | 'blue' | 'green' | 'purple' | 'orange';

export default function SettingsDrawer() {
  const [theme, setTheme] = useState<Theme>('light');
  const [layout, setLayout] = useState<Layout>('vertical');
  const [stretch, setStretch] = useState(false);
  const [preset, setPreset] = useState<PresetColor>('default');
  const [breadcrumb, setBreadcrumb] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleThemeChange = (value: Theme) => {
    setTheme(value);
    // Apply theme
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (value === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const presetColors = {
    default: 'hsl(222.2 47.4% 11.2%)',
    blue: 'hsl(221 83% 53%)',
    green: 'hsl(142 76% 36%)',
    purple: 'hsl(262 83% 58%)',
    orange: 'hsl(25 95% 53%)',
  };

  const handlePresetChange = (color: PresetColor) => {
    setPreset(color);
    document.documentElement.style.setProperty('--primary', presetColors[color]);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-lg z-50"
          variant="default"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </SheetTitle>
          <SheetDescription>
            Customize your admin panel appearance
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Mode */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Mode</Label>
            <RadioGroup value={theme} onValueChange={(v) => handleThemeChange(v as Theme)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                  <Sun className="h-4 w-4" />
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                  <Moon className="h-4 w-4" />
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                  <Monitor className="h-4 w-4" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Layout */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Layout</Label>
            <RadioGroup value={layout} onValueChange={(v) => setLayout(v as Layout)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vertical" id="vertical" />
                <Label htmlFor="vertical" className="cursor-pointer">
                  Vertical
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="horizontal" id="horizontal" />
                <Label htmlFor="horizontal" className="cursor-pointer">
                  Horizontal
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mini" id="mini" />
                <Label htmlFor="mini" className="cursor-pointer">
                  Mini
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Stretch */}
          <div className="flex items-center justify-between">
            <Label htmlFor="stretch" className="text-base font-semibold">
              Stretch
            </Label>
            <Switch
              id="stretch"
              checked={stretch}
              onCheckedChange={setStretch}
            />
          </div>

          <Separator />

          {/* Presets */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Presets</Label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(presetColors).map(([key, color]) => (
                <button
                  key={key}
                  onClick={() => handlePresetChange(key as PresetColor)}
                  className={`h-12 rounded-md transition-all ${
                    preset === key ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={key}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Page BreadCrumb */}
          <div className="flex items-center justify-between">
            <Label htmlFor="breadcrumb" className="text-base font-semibold">
              Page BreadCrumb
            </Label>
            <Switch
              id="breadcrumb"
              checked={breadcrumb}
              onCheckedChange={setBreadcrumb}
            />
          </div>

          <Separator />

          {/* Fullscreen */}
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Fullscreen</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <>
                  <Minimize className="h-4 w-4 mr-2" />
                  Exit
                </>
              ) : (
                <>
                  <Maximize className="h-4 w-4 mr-2" />
                  Enter
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              handleThemeChange('light');
              setLayout('vertical');
              setStretch(false);
              handlePresetChange('default');
              setBreadcrumb(true);
              if (document.fullscreenElement) {
                document.exitFullscreen();
                setIsFullscreen(false);
              }
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
