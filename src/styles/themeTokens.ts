// TypeScript Interface for BigfootLive Design Tokens
export interface ThemeTokens {
  colors: {
    border: string;
    input: string;
    ring: string;
    background: string;
    foreground: string;
    brand: Record<number | string, string>;
    primary: Record<number | string, string>;
    secondary: {
      DEFAULT: string;
      foreground: string;
    };
    destructive: Record<number | string, string>;
    muted: {
      DEFAULT: string;
      foreground: string;
    };
    accent: Record<number | string, string>;
    success: Record<number | string, string>;
    warning: Record<number | string, string>;
    info: Record<number | string, string>;
    popover: {
      DEFAULT: string;
      foreground: string;
    };
    card: {
      DEFAULT: string;
      foreground: string;
    };
    live: {
      DEFAULT: string;
      glow: string;
      foreground: string;
    };
  };
  fontSize: Record<string, [string, { lineHeight: string }]>;
  fontFamily: Record<string, string[]>;
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
  zIndex: Record<string, string | number>;
  spacing: Record<string, string>;
}

// Example usage
export const themeTokens: ThemeTokens = {
  colors: {
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    brand: {
      DEFAULT: "hsl(var(--primary))",
      50: "hsl(271 91% 95%)",
      100: "hsl(271 91% 90%)",
      200: "hsl(271 91% 80%)",
      300: "hsl(271 91% 70%)",
      400: "hsl(271 91% 65%)",
      500: "hsl(var(--primary))",
      600: "hsl(271 91% 55%)",
      700: "hsl(271 91% 45%)",
      800: "hsl(271 91% 35%)",
      900: "hsl(271 91% 25%)",
      950: "hsl(271 91% 15%)",
      foreground: "hsl(var(--primary-foreground))",
    },
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
    },
    secondary: {
      DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))",
    },
    destructive: {
      DEFAULT: "hsl(var(--destructive))",
      foreground: "hsl(var(--destructive-foreground))",
    },
    muted: {
      DEFAULT: "hsl(var(--muted))",
      foreground: "hsl(var(--muted-foreground))",
    },
    accent: {
      DEFAULT: "hsl(var(--accent))",
      50: "hsl(328 85% 95%)",
      100: "hsl(328 85% 90%)",
      200: "hsl(328 85% 80%)",
      300: "hsl(328 85% 75%)",
      400: "hsl(328 85% 70%)",
      500: "hsl(var(--accent))",
      600: "hsl(328 85% 60%)",
      700: "hsl(328 85% 50%)",
      800: "hsl(328 85% 40%)",
      900: "hsl(328 85% 30%)",
      950: "hsl(328 85% 20%)",
      foreground: "hsl(var(--accent-foreground))",
    },
    success: {
      DEFAULT: "hsl(var(--success))",
      50: "hsl(142 71% 95%)",
      100: "hsl(142 71% 90%)",
      200: "hsl(142 71% 80%)",
      300: "hsl(142 71% 65%)",
      400: "hsl(142 71% 55%)",
      500: "hsl(var(--success))",
      600: "hsl(142 71% 35%)",
      700: "hsl(142 71% 25%)",
      800: "hsl(142 71% 20%)",
      900: "hsl(142 71% 15%)",
      950: "hsl(142 71% 10%)",
      foreground: "hsl(0 0% 100%)",
    },
    warning: {
      DEFAULT: "hsl(var(--warning))",
      50: "hsl(38 92% 95%)",
      100: "hsl(38 92% 90%)",
      200: "hsl(38 92% 80%)",
      300: "hsl(38 92% 65%)",
      400: "hsl(38 92% 55%)",
      500: "hsl(var(--warning))",
      600: "hsl(38 92% 45%)",
      700: "hsl(38 92% 35%)",
      800: "hsl(38 92% 25%)",
      900: "hsl(38 92% 15%)",
      950: "hsl(38 92% 10%)",
      foreground: "hsl(0 0% 0%)",
    },
    info: {
      DEFAULT: "hsl(var(--info))",
      50: "hsl(217 91% 95%)",
      100: "hsl(217 91% 90%)",
      200: "hsl(217 91% 80%)",
      300: "hsl(217 91% 70%)",
      400: "hsl(217 91% 65%)",
      500: "hsl(var(--info))",
      600: "hsl(217 91% 50%)",
      700: "hsl(217 91% 40%)",
      800: "hsl(217 91% 30%)",
      900: "hsl(217 91% 20%)",
      950: "hsl(217 91% 10%)",
      foreground: "hsl(0 0% 100%)",
    },
    popover: {
      DEFAULT: "hsl(var(--popover))",
      foreground: "hsl(var(--popover-foreground))",
    },
    card: {
      DEFAULT: "hsl(var(--card))",
      foreground: "hsl(var(--card-foreground))",
    },
    live: {
      DEFAULT: "hsl(var(--live))",
      glow: "hsl(var(--live-glow))",
      foreground: "hsl(0 0% 100%)",
    },
  },
  fontSize: {
    'xs': ['0.75rem', { lineHeight: '1rem' }],
    'sm': ['0.875rem', { lineHeight: '1.25rem' }],
    'base': ['1rem', { lineHeight: '1.5rem' }],
    'lg': ['1.125rem', { lineHeight: '1.75rem' }],
    'xl': ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
  },
  fontFamily: {
    'sans': ['Inter', 'system-ui', 'sans-serif'],
    'mono': ['JetBrains Mono', 'monospace'],
    'display': ['Inter', 'system-ui', 'sans-serif'],
  },
  borderRadius: {
    'none': '0px',
    'xs': '0.125rem',
    'sm': '0.25rem',
    'DEFAULT': '0.375rem',
    'md': '0.5rem',
    'lg': '0.75rem',
    'xl': '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    'full': '9999px',
    'radius': 'var(--radius)',
    'radius-sm': 'calc(var(--radius) - 2px)',
    'radius-lg': 'calc(var(--radius) + 2px)',
  },
  boxShadow: {
    'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    'none': '0 0 #0000',
    'glow': '0 0 20px -5px hsl(var(--primary) / 0.5)',
    'soft': '0 2px 10px rgb(0 0 0 / 0.05)',
    'neon': '0 0 20px hsl(var(--primary) / 0.5)',
  },
  zIndex: {
    '0': '0',
    '10': '10',
    '20': '20',
    '30': '30',
    '40': '40',
    '50': '50',
    'auto': 'auto',
    'hide': '-1',
    'base': '0',
    'docked': '10',
    'dropdown': '1000',
    'overlay': '1040',
    'modal': '1050',
    'popover': '1060',
    'toast': '1080',
    'tooltip': '1090',
  },
  spacing: {
    '0.5': '0.125rem',
    '1.5': '0.375rem',
    '2.5': '0.625rem',
    '3.5': '0.875rem',
    '4.5': '1.125rem',
    '5.5': '1.375rem',
    '6.5': '1.625rem',
    '7.5': '1.875rem',
    '8.5': '2.125rem',
    '9.5': '2.375rem',
    '10.5': '2.625rem',
    '11.5': '2.875rem',
    '12.5': '3.125rem',
    '13': '3.25rem',
  },
};

export default themeTokens;

