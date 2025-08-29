
import React, { useState } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Badge } from './badge';
import { Check, Palette, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [open, setOpen] = useState(false);

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-minecraft-green text-minecraft-green hover:bg-minecraft-green hover:text-gray-900"
        >
          <Palette className="h-4 w-4 mr-1" />
          Themes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-800 border-minecraft-dark-stone text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-gaming text-minecraft-green flex items-center">
            <Palette className="mr-2" />
            Choose Your Theme
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {availableThemes.map((theme) => (
            <div
              key={theme.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                currentTheme.id === theme.id
                  ? 'border-minecraft-green bg-minecraft-green/10'
                  : 'border-gray-600 hover:border-minecraft-green/50'
              }`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              {currentTheme.id === theme.id && (
                <div className="absolute top-2 right-2">
                  <Check className="h-5 w-5 text-minecraft-green" />
                </div>
              )}
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{theme.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {theme.type === 'dark' ? (
                    <><Moon className="h-3 w-3 mr-1" /> Dark</>
                  ) : (
                    <><Sun className="h-3 w-3 mr-1" /> Light</>
                  )}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-400 mb-3">{theme.description}</p>
              
              {/* Color Preview */}
              <div className="flex space-x-1 mb-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: theme.colors.background }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: theme.colors.accent }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: theme.colors['minecraft-gold'] }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: theme.colors.success }}
                />
              </div>
              
              {/* Mini Preview */}
              <div 
                className="w-full h-16 rounded border border-gray-600 p-2 text-xs"
                style={{ 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.foreground,
                  borderColor: theme.colors.border
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: theme.colors.primary }}>● Connected</span>
                  <span style={{ color: theme.colors['minecraft-gold'] }}>15ms</span>
                </div>
                <div className="mt-1" style={{ color: theme.colors['foreground-secondary'] }}>
                  Sample chat message...
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-400">
          Selected: <span className="text-minecraft-green font-medium">{currentTheme.name}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
