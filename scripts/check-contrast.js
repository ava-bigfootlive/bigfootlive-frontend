#!/usr/bin/env node

/**
 * Simple contrast checker for BigfootLive theme colors
 */

// Convert HSL to RGB
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h * 12) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return [f(0), f(8), f(4)];
}

// Calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(rgb1, rgb2) {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Parse HSL string like "271 91% 25%"
function parseHSL(hslString) {
  const parts = hslString.split(' ');
  return {
    h: parseInt(parts[0]),
    s: parseInt(parts[1].replace('%', '')),
    l: parseInt(parts[2].replace('%', ''))
  };
}

// Test colors from our theme
const colors = {
  light: {
    primary: "271 91% 25%",
    primaryForeground: "0 0% 98%",
    background: "0 0% 100%",
    foreground: "240 10% 3.9%"
  },
  dark: {
    primary: "271 91% 45%", 
    primaryForeground: "0 0% 100%",
    background: "0 0% 12%",
    foreground: "0 0% 95%"
  }
};

console.log('🎨 BigfootLive Color Contrast Check\n');
console.log('WCAG 2.1 Standards:');
console.log('  AA Normal: ≥ 4.5:1');
console.log('  AA Large: ≥ 3:1');
console.log('  AAA Normal: ≥ 7:1');
console.log('  AAA Large: ≥ 4.5:1\n');

for (const [theme, themeColors] of Object.entries(colors)) {
  console.log(`=== ${theme.toUpperCase()} THEME ===`);
  
  // Primary button contrast (primary bg + primary foreground text)
  const primaryHsl = parseHSL(themeColors.primary);
  const primaryFgHsl = parseHSL(themeColors.primaryForeground);
  
  const primaryRgb = hslToRgb(primaryHsl.h, primaryHsl.s, primaryHsl.l);
  const primaryFgRgb = hslToRgb(primaryFgHsl.h, primaryFgHsl.s, primaryFgHsl.l);
  
  const primaryContrast = getContrastRatio(primaryRgb, primaryFgRgb);
  
  console.log(`Primary Button:`);
  console.log(`  Background: hsl(${themeColors.primary}) → rgb(${primaryRgb.join(', ')})`);
  console.log(`  Text: hsl(${themeColors.primaryForeground}) → rgb(${primaryFgRgb.join(', ')})`);
  console.log(`  Contrast Ratio: ${primaryContrast.toFixed(2)}:1`);
  
  const primaryPass = {
    'AA Normal': primaryContrast >= 4.5,
    'AA Large': primaryContrast >= 3.0,
    'AAA Normal': primaryContrast >= 7.0,
    'AAA Large': primaryContrast >= 4.5
  };
  
  console.log(`  Standards:`);
  for (const [standard, passes] of Object.entries(primaryPass)) {
    console.log(`    ${standard}: ${passes ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  console.log('');
}

console.log('🚨 Focus: The primary button must pass WCAG AA Normal (4.5:1) for accessibility compliance.');
