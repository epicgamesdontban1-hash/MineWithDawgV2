
export interface Theme {
  id: string;
  name: string;
  description: string;
  type: 'dark' | 'light';
  colors: {
    // Background colors
    background: string;
    'background-secondary': string;
    'background-tertiary': string;
    
    // Text colors
    foreground: string;
    'foreground-secondary': string;
    'foreground-muted': string;
    
    // Accent colors
    primary: string;
    'primary-dark': string;
    secondary: string;
    accent: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Border colors
    border: string;
    'border-light': string;
    
    // Minecraft-specific colors
    'minecraft-green': string;
    'minecraft-dark-green': string;
    'minecraft-gold': string;
    'minecraft-stone': string;
    'minecraft-dark-stone': string;
    
    // Chat and status colors
    'chat-bg': string;
    'status-online': string;
    'status-offline': string;
    'status-connecting': string;
  };
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'Default Dark',
    description: 'Classic dark theme with green accents',
    type: 'dark',
    colors: {
      background: 'hsl(222.2 84% 4.9%)',
      'background-secondary': 'hsl(217.2 32.6% 17.5%)',
      'background-tertiary': 'hsl(217.2 32.6% 15%)',
      foreground: 'hsl(210 40% 98%)',
      'foreground-secondary': 'hsl(215 20.2% 65.1%)',
      'foreground-muted': 'hsl(215.4 16.3% 46.9%)',
      primary: 'hsl(102 45% 49%)',
      'primary-dark': 'hsl(102 45% 30%)',
      secondary: 'hsl(217.2 32.6% 17.5%)',
      accent: 'hsl(217.2 32.6% 17.5%)',
      success: 'hsl(102 45% 49%)',
      warning: 'hsl(45 98% 51%)',
      error: 'hsl(0 84.2% 60.2%)',
      info: 'hsl(217.2 91.2% 59.8%)',
      border: 'hsl(217.2 32.6% 17.5%)',
      'border-light': 'hsl(217.2 32.6% 25%)',
      'minecraft-green': 'hsl(102 45% 49%)',
      'minecraft-dark-green': 'hsl(102 45% 30%)',
      'minecraft-gold': 'hsl(45 98% 51%)',
      'minecraft-stone': 'hsl(0 0% 46%)',
      'minecraft-dark-stone': 'hsl(0 0% 26%)',
      'chat-bg': 'hsl(0 0% 10%)',
      'status-online': 'hsl(102 45% 49%)',
      'status-offline': 'hsl(4 90% 58%)',
      'status-connecting': 'hsl(39 100% 50%)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Deep blue theme inspired by ocean depths',
    type: 'dark',
    colors: {
      background: 'hsl(220 40% 8%)',
      'background-secondary': 'hsl(220 35% 15%)',
      'background-tertiary': 'hsl(220 30% 12%)',
      foreground: 'hsl(220 20% 95%)',
      'foreground-secondary': 'hsl(220 15% 75%)',
      'foreground-muted': 'hsl(220 10% 55%)',
      primary: 'hsl(200 100% 50%)',
      'primary-dark': 'hsl(200 100% 35%)',
      secondary: 'hsl(220 35% 15%)',
      accent: 'hsl(180 100% 50%)',
      success: 'hsl(160 100% 40%)',
      warning: 'hsl(45 100% 60%)',
      error: 'hsl(0 100% 60%)',
      info: 'hsl(200 100% 50%)',
      border: 'hsl(220 35% 15%)',
      'border-light': 'hsl(220 35% 25%)',
      'minecraft-green': 'hsl(160 100% 40%)',
      'minecraft-dark-green': 'hsl(160 100% 25%)',
      'minecraft-gold': 'hsl(45 100% 60%)',
      'minecraft-stone': 'hsl(220 20% 50%)',
      'minecraft-dark-stone': 'hsl(220 30% 30%)',
      'chat-bg': 'hsl(220 40% 5%)',
      'status-online': 'hsl(160 100% 40%)',
      'status-offline': 'hsl(0 100% 60%)',
      'status-connecting': 'hsl(45 100% 60%)',
    },
  },
  {
    id: 'purple',
    name: 'Purple Galaxy',
    description: 'Cosmic purple theme with starry accents',
    type: 'dark',
    colors: {
      background: 'hsl(270 30% 8%)',
      'background-secondary': 'hsl(270 25% 15%)',
      'background-tertiary': 'hsl(270 20% 12%)',
      foreground: 'hsl(270 15% 95%)',
      'foreground-secondary': 'hsl(270 10% 75%)',
      'foreground-muted': 'hsl(270 8% 55%)',
      primary: 'hsl(270 100% 70%)',
      'primary-dark': 'hsl(270 100% 50%)',
      secondary: 'hsl(270 25% 15%)',
      accent: 'hsl(300 100% 70%)',
      success: 'hsl(120 100% 40%)',
      warning: 'hsl(45 100% 60%)',
      error: 'hsl(350 100% 60%)',
      info: 'hsl(270 100% 70%)',
      border: 'hsl(270 25% 15%)',
      'border-light': 'hsl(270 25% 25%)',
      'minecraft-green': 'hsl(120 100% 40%)',
      'minecraft-dark-green': 'hsl(120 100% 25%)',
      'minecraft-gold': 'hsl(45 100% 60%)',
      'minecraft-stone': 'hsl(270 15% 50%)',
      'minecraft-dark-stone': 'hsl(270 20% 30%)',
      'chat-bg': 'hsl(270 30% 5%)',
      'status-online': 'hsl(120 100% 40%)',
      'status-offline': 'hsl(350 100% 60%)',
      'status-connecting': 'hsl(45 100% 60%)',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Futuristic neon theme with electric colors',
    type: 'dark',
    colors: {
      background: 'hsl(180 100% 3%)',
      'background-secondary': 'hsl(180 50% 8%)',
      'background-tertiary': 'hsl(180 40% 6%)',
      foreground: 'hsl(180 100% 90%)',
      'foreground-secondary': 'hsl(180 50% 70%)',
      'foreground-muted': 'hsl(180 30% 50%)',
      primary: 'hsl(320 100% 60%)',
      'primary-dark': 'hsl(320 100% 40%)',
      secondary: 'hsl(180 50% 8%)',
      accent: 'hsl(60 100% 50%)',
      success: 'hsl(120 100% 50%)',
      warning: 'hsl(30 100% 50%)',
      error: 'hsl(0 100% 50%)',
      info: 'hsl(200 100% 50%)',
      border: 'hsl(180 50% 8%)',
      'border-light': 'hsl(180 50% 15%)',
      'minecraft-green': 'hsl(120 100% 50%)',
      'minecraft-dark-green': 'hsl(120 100% 30%)',
      'minecraft-gold': 'hsl(60 100% 50%)',
      'minecraft-stone': 'hsl(180 30% 50%)',
      'minecraft-dark-stone': 'hsl(180 40% 30%)',
      'chat-bg': 'hsl(180 100% 2%)',
      'status-online': 'hsl(120 100% 50%)',
      'status-offline': 'hsl(0 100% 50%)',
      'status-connecting': 'hsl(30 100% 50%)',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural green theme inspired by forests',
    type: 'dark',
    colors: {
      background: 'hsl(120 30% 8%)',
      'background-secondary': 'hsl(120 25% 15%)',
      'background-tertiary': 'hsl(120 20% 12%)',
      foreground: 'hsl(120 15% 95%)',
      'foreground-secondary': 'hsl(120 10% 75%)',
      'foreground-muted': 'hsl(120 8% 55%)',
      primary: 'hsl(120 60% 50%)',
      'primary-dark': 'hsl(120 60% 30%)',
      secondary: 'hsl(120 25% 15%)',
      accent: 'hsl(80 60% 50%)',
      success: 'hsl(120 60% 50%)',
      warning: 'hsl(45 100% 60%)',
      error: 'hsl(0 80% 60%)',
      info: 'hsl(200 80% 60%)',
      border: 'hsl(120 25% 15%)',
      'border-light': 'hsl(120 25% 25%)',
      'minecraft-green': 'hsl(120 60% 50%)',
      'minecraft-dark-green': 'hsl(120 60% 30%)',
      'minecraft-gold': 'hsl(45 100% 60%)',
      'minecraft-stone': 'hsl(120 15% 50%)',
      'minecraft-dark-stone': 'hsl(120 20% 30%)',
      'chat-bg': 'hsl(120 30% 5%)',
      'status-online': 'hsl(120 60% 50%)',
      'status-offline': 'hsl(0 80% 60%)',
      'status-connecting': 'hsl(45 100% 60%)',
    },
  },
  {
    id: 'light',
    name: 'Light Modern',
    description: 'Clean light theme for daytime coding',
    type: 'light',
    colors: {
      background: 'hsl(0 0% 98%)',
      'background-secondary': 'hsl(0 0% 95%)',
      'background-tertiary': 'hsl(0 0% 92%)',
      foreground: 'hsl(0 0% 10%)',
      'foreground-secondary': 'hsl(0 0% 30%)',
      'foreground-muted': 'hsl(0 0% 50%)',
      primary: 'hsl(210 100% 50%)',
      'primary-dark': 'hsl(210 100% 40%)',
      secondary: 'hsl(0 0% 95%)',
      accent: 'hsl(210 100% 50%)',
      success: 'hsl(120 60% 40%)',
      warning: 'hsl(45 100% 50%)',
      error: 'hsl(0 80% 50%)',
      info: 'hsl(210 100% 50%)',
      border: 'hsl(0 0% 85%)',
      'border-light': 'hsl(0 0% 90%)',
      'minecraft-green': 'hsl(120 60% 40%)',
      'minecraft-dark-green': 'hsl(120 60% 30%)',
      'minecraft-gold': 'hsl(45 100% 45%)',
      'minecraft-stone': 'hsl(0 0% 60%)',
      'minecraft-dark-stone': 'hsl(0 0% 40%)',
      'chat-bg': 'hsl(0 0% 96%)',
      'status-online': 'hsl(120 60% 40%)',
      'status-offline': 'hsl(0 80% 50%)',
      'status-connecting': 'hsl(45 100% 50%)',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm sunset colors with orange and red hues',
    type: 'dark',
    colors: {
      background: 'hsl(15 40% 8%)',
      'background-secondary': 'hsl(15 35% 15%)',
      'background-tertiary': 'hsl(15 30% 12%)',
      foreground: 'hsl(15 20% 95%)',
      'foreground-secondary': 'hsl(15 15% 75%)',
      'foreground-muted': 'hsl(15 10% 55%)',
      primary: 'hsl(25 100% 60%)',
      'primary-dark': 'hsl(25 100% 45%)',
      secondary: 'hsl(15 35% 15%)',
      accent: 'hsl(45 100% 60%)',
      success: 'hsl(120 60% 50%)',
      warning: 'hsl(45 100% 60%)',
      error: 'hsl(0 100% 60%)',
      info: 'hsl(200 80% 60%)',
      border: 'hsl(15 35% 15%)',
      'border-light': 'hsl(15 35% 25%)',
      'minecraft-green': 'hsl(120 60% 50%)',
      'minecraft-dark-green': 'hsl(120 60% 30%)',
      'minecraft-gold': 'hsl(45 100% 60%)',
      'minecraft-stone': 'hsl(15 20% 50%)',
      'minecraft-dark-stone': 'hsl(15 30% 30%)',
      'chat-bg': 'hsl(15 40% 5%)',
      'status-online': 'hsl(120 60% 50%)',
      'status-offline': 'hsl(0 100% 60%)',
      'status-connecting': 'hsl(45 100% 60%)',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic Blue',
    description: 'Cool arctic theme with icy blue tones',
    type: 'light',
    colors: {
      background: 'hsl(200 30% 96%)',
      'background-secondary': 'hsl(200 25% 92%)',
      'background-tertiary': 'hsl(200 20% 88%)',
      foreground: 'hsl(200 30% 15%)',
      'foreground-secondary': 'hsl(200 25% 35%)',
      'foreground-muted': 'hsl(200 20% 55%)',
      primary: 'hsl(200 100% 40%)',
      'primary-dark': 'hsl(200 100% 30%)',
      secondary: 'hsl(200 25% 92%)',
      accent: 'hsl(180 60% 50%)',
      success: 'hsl(120 60% 40%)',
      warning: 'hsl(45 100% 50%)',
      error: 'hsl(0 80% 50%)',
      info: 'hsl(200 100% 40%)',
      border: 'hsl(200 25% 85%)',
      'border-light': 'hsl(200 25% 90%)',
      'minecraft-green': 'hsl(120 60% 40%)',
      'minecraft-dark-green': 'hsl(120 60% 30%)',
      'minecraft-gold': 'hsl(45 100% 45%)',
      'minecraft-stone': 'hsl(200 20% 60%)',
      'minecraft-dark-stone': 'hsl(200 25% 40%)',
      'chat-bg': 'hsl(200 30% 94%)',
      'status-online': 'hsl(120 60% 40%)',
      'status-offline': 'hsl(0 80% 50%)',
      'status-connecting': 'hsl(45 100% 50%)',
    },
  },
];

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  
  // Store theme preference
  localStorage.setItem('theme', theme.id);
}

export function getStoredTheme(): string {
  return localStorage.getItem('theme') || 'default';
}

export function getThemeById(id: string): Theme {
  return themes.find(theme => theme.id === id) || themes[0];
}
