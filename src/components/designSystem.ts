// src/components/designSystem.ts

/**
 * BarterUp Design System
 * 
 * This file contains all design tokens and styling constants used throughout the application
 * to maintain visual consistency. Follow these guidelines when building UI components.
 */

// ===== COLOR SYSTEM =====
export const colors = {
  // Brand Colors
  primary: {
    light: "#7EE8DD",
    DEFAULT: "#4CE0D2",
    dark: "#36C9B9",
  },
  secondary: {
    light: "#FF8A8A",
    DEFAULT: "#FF6B6B",
    dark: "#FF5252",
  },
  accent: {
    light: "#FFEC9E",
    DEFAULT: "#FFE66D",
    dark: "#FFD93D",
  },
  
  // Background Colors
  background: {
    light: "#2C5364",
    DEFAULT: "#203A43",
    dark: "#0F2027",
  },
  
  // Glass Effects
  glass: {
    light: "rgba(255, 255, 255, 0.15)",
    DEFAULT: "rgba(255, 255, 255, 0.1)",
    dark: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.2)",
  },
  
  // Text Colors
  text: {
    primary: "#FFFFFF",
    secondary: "#E0E0E0",
    muted: "#A0A0A0",
    disabled: "#606060",
  },
};

// ===== TYPOGRAPHY =====
export const typography = {
  fontFamily: {
    primary: "'Inter', sans-serif",
    secondary: "'Poppins', sans-serif",
  },
  fontSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem",    // 48px
    "6xl": "4rem",    // 64px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.6,
    relaxed: 1.75,
    loose: 2,
  },
};

// ===== SPACING SYSTEM =====
export const spacing = {
  0: "0",
  xs: "0.25rem",    // 4px
  sm: "0.5rem",     // 8px
  md: "1rem",       // 16px
  lg: "1.5rem",     // 24px
  xl: "2rem",       // 32px
  "2xl": "3rem",    // 48px
  "3xl": "4rem",    // 64px
};

// ===== RADIUS SYSTEM =====
export const radius = {
  none: "0",
  sm: "0.25rem",    // 4px
  md: "0.5rem",     // 8px
  lg: "0.75rem",    // 12px
  xl: "1rem",       // 16px
  "2xl": "1.25rem", // 20px
  "3xl": "1.5rem",  // 24px
  full: "9999px",   // Circle/Pill
};

// ===== SHADOWS =====
export const shadows = {
  sm: "0 2px 4px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px rgba(0, 0, 0, 0.15)",
  lg: "0 10px 25px rgba(0, 0, 0, 0.2)",
  xl: "0 20px 40px rgba(0, 0, 0, 0.3)",
  glow: {
    primary: "0 0 20px rgba(76, 224, 210, 0.3)",
    secondary: "0 0 20px rgba(255, 107, 107, 0.3)",
    accent: "0 0 20px rgba(255, 230, 109, 0.3)",
  }
};

// ===== ICON SIZES =====
export const iconSizes = {
  xs: "w-3 h-3",   // 12px
  sm: "w-4 h-4",   // 16px
  md: "w-5 h-5",   // 20px
  lg: "w-6 h-6",   // 24px
  xl: "w-8 h-8",   // 32px
  "2xl": "w-12 h-12", // 48px
  "3xl": "w-16 h-16", // 64px
};

// ===== ANIMATION DURATIONS =====
export const animation = {
  duration: {
    fast: "0.2s",
    normal: "0.3s",
    slow: "0.5s",
  },
  easing: {
    default: "ease",
    in: "ease-in",
    out: "ease-out",
    inOut: "ease-in-out",
  }
};

// ===== Z-INDEX SYSTEM =====
export const zIndex = {
  background: -10,
  default: 1,
  elevated: 10,
  dropdown: 50,
  sticky: 100,
  overlay: 200,
  modal: 300,
  popover: 400,
  toast: 500,
};

// ===== LAYOUT SCALES =====
export const layout = {
  maxWidth: {
    xs: "20rem",     // 320px
    sm: "24rem",     // 384px
    md: "28rem",     // 448px
    lg: "32rem",     // 512px
    xl: "36rem",     // 576px
    "2xl": "42rem",  // 672px
    "3xl": "48rem",  // 768px
    "4xl": "56rem",  // 896px
    "5xl": "64rem",  // 1024px
    "6xl": "72rem",  // 1152px
    "7xl": "80rem",  // 1280px
  },
  container: {
    padding: {
      DEFAULT: "1rem", // 16px on each side
      sm: "1.5rem",    // 24px on each side
      lg: "2rem",      // 32px on each side
    },
  },
};
