/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // BigfootLive Design Tokens - Colors
      colors: {
        // Core System Colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Brand Colors
        brand: {
          DEFAULT: "hsl(var(--primary))",
          50: "hsl(271 91% 95%)",
          100: "hsl(271 91% 90%)",
          200: "hsl(271 91% 80%)",
          300: "hsl(271 91% 70%)",
          400: "hsl(271 91% 65%)",
          500: "hsl(var(--primary))", // 271 91% 65%
          600: "hsl(271 91% 55%)",
          700: "hsl(271 91% 45%)",
          800: "hsl(271 91% 35%)",
          900: "hsl(271 91% 25%)",
          950: "hsl(271 91% 15%)",
          foreground: "hsl(var(--primary-foreground))",
        },
        
        // Legacy alias for brand
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        
        // Accent Colors (Pink/Magenta)
        accent: {
          DEFAULT: "hsl(var(--accent))", // 328 85% 70%
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
        
        // Neutral Grays
        neutral: {
          50: "hsl(0 0% 98%)",
          100: "hsl(0 0% 96%)",
          200: "hsl(0 0% 89%)",
          300: "hsl(0 0% 83%)",
          400: "hsl(0 0% 64%)",
          500: "hsl(0 0% 45%)",
          600: "hsl(0 0% 32%)",
          700: "hsl(0 0% 25%)",
          800: "hsl(0 0% 15%)",
          900: "hsl(0 0% 9%)",
          950: "hsl(0 0% 4%)",
        },
        
        // Secondary Colors
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        
        // Semantic Colors
        danger: {
          DEFAULT: "hsl(var(--destructive))", // 0 84% 60%
          50: "hsl(0 84% 95%)",
          100: "hsl(0 84% 90%)",
          200: "hsl(0 84% 80%)",
          300: "hsl(0 84% 70%)",
          400: "hsl(0 84% 65%)",
          500: "hsl(var(--destructive))",
          600: "hsl(0 84% 50%)",
          700: "hsl(0 84% 40%)",
          800: "hsl(0 84% 30%)",
          900: "hsl(0 84% 20%)",
          950: "hsl(0 84% 10%)",
          foreground: "hsl(var(--destructive-foreground))",
        },
        
        // Legacy alias for danger
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        
        success: {
          DEFAULT: "hsl(var(--success))", // 142 71% 45%
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
          DEFAULT: "hsl(var(--warning))", // 38 92% 50%
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
          DEFAULT: "hsl(var(--info))", // 217 91% 60%
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
        
        // Muted Colors
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        
        // Popover Colors
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        
        // Card Colors
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Streaming-specific Colors
        live: {
          DEFAULT: "hsl(var(--live))", // 0 100% 50%
          glow: "hsl(var(--live-glow))",
          foreground: "hsl(0 0% 100%)",
        },
        
        stream: {
          offline: "hsl(var(--offline))", // 0 0% 45%
          scheduled: "hsl(var(--scheduled))", // 45 100% 51%
          quality: "hsl(var(--stream-quality))", // 217 91% 60%
          viewers: "hsl(var(--viewer-count))", // 142 71% 45%
        },
        
        // Chart Colors
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      
      // Typography Scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
        '8xl': ['6rem', { lineHeight: '1' }],           // 96px
        '9xl': ['8rem', { lineHeight: '1' }],           // 128px
      },
      
      // Font Families
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // Border Radius Scale
      borderRadius: {
        'none': '0px',
        'xs': '0.125rem',    // 2px
        'sm': '0.25rem',     // 4px
        'DEFAULT': '0.375rem', // 6px
        'md': '0.5rem',      // 8px - var(--radius)
        'lg': '0.75rem',     // 12px
        'xl': '1rem',        // 16px
        '2xl': '1.5rem',     // 24px
        '3xl': '2rem',       // 32px
        'full': '9999px',
        // CSS variable-based radius
        'radius': 'var(--radius)',
        'radius-sm': 'calc(var(--radius) - 2px)',
        'radius-lg': 'calc(var(--radius) + 2px)',
      },
      
      // Shadow Scale
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': '0 0 #0000',
        // Custom shadows
        'glow': '0 0 20px -5px hsl(var(--primary) / 0.5), 0 10px 20px -5px rgb(0 0 0 / 0.1)',
        'glow-accent': '0 0 20px -5px hsl(var(--accent) / 0.5), 0 10px 20px -5px rgb(0 0 0 / 0.1)',
        'soft': '0 2px 10px rgb(0 0 0 / 0.05), 0 10px 30px rgb(0 0 0 / 0.05)',
        'neon': '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.1)',
        'neon-live': '0 0 20px hsl(var(--live) / 0.8), 0 0 40px hsl(var(--live) / 0.5), 0 0 60px hsl(var(--live) / 0.3)',
      },
      
      // Z-Index Scale
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'auto': 'auto',
        // Semantic z-index values
        'hide': '-1',
        'base': '0',
        'docked': '10',
        'dropdown': '1000',
        'sticky': '1020',
        'banner': '1030',
        'overlay': '1040',
        'modal': '1050',
        'popover': '1060',
        'skipLink': '1070',
        'toast': '1080',
        'tooltip': '1090',
        'max': '2147483647',
      },
      
      // Spacing Scale (extends default Tailwind spacing)
      spacing: {
        '0.5': '0.125rem',   // 2px
        '1.5': '0.375rem',   // 6px
        '2.5': '0.625rem',   // 10px
        '3.5': '0.875rem',   // 14px
        '4.5': '1.125rem',   // 18px
        '5.5': '1.375rem',   // 22px
        '6.5': '1.625rem',   // 26px
        '7.5': '1.875rem',   // 30px
        '8.5': '2.125rem',   // 34px
        '9.5': '2.375rem',   // 38px
        '10.5': '2.625rem',  // 42px
        '11.5': '2.875rem',  // 46px
        '12.5': '3.125rem',  // 50px
        '13': '3.25rem',     // 52px
        '15': '3.75rem',     // 60px
        '17': '4.25rem',     // 68px
        '18': '4.5rem',      // 72px
        '19': '4.75rem',     // 76px
        '21': '5.25rem',     // 84px
        '22': '5.5rem',      // 88px
        '25': '6.25rem',     // 100px
        '26': '6.5rem',      // 104px
        '28': '7rem',        // 112px
        '30': '7.5rem',      // 120px
        '32': '8rem',        // 128px
        '34': '8.5rem',      // 136px
        '36': '9rem',        // 144px
        '40': '10rem',       // 160px
        '44': '11rem',       // 176px
        '48': '12rem',       // 192px
        '52': '13rem',       // 208px
        '56': '14rem',       // 224px
        '60': '15rem',       // 240px
        '64': '16rem',       // 256px
        '72': '18rem',       // 288px
        '80': '20rem',       // 320px
        '96': '24rem',       // 384px
      },
      
      // Animation and Keyframes
      keyframes: {
        // Existing animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        
        // BigfootLive custom animations
        "live-pulse": {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
        "slide-in": {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        "fade-in": {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        "scale-in": {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        "blob": {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        "viewer-count-update": {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        "skeleton-loading": {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      
      animation: {
        // Existing animations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        
        // BigfootLive custom animations
        "live-pulse": "live-pulse 2s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "blob": "blob 7s infinite",
        "viewer-count": "viewer-count-update 0.3s ease-out",
        "skeleton": "skeleton-loading 1.5s infinite",
      },
      
      // Animation delays
      animationDelay: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
        '2000': '2000ms',
        '4000': '4000ms',
      },
      
      // Backdrop blur
      backdropBlur: {
        'xs': '2px',
        '3xl': '64px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
