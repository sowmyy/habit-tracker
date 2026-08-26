/** @type {import('tailwindcss').Config} */
// Bold playful palette (indigo primary, white canvas, neutral greys, warm
// accents). Semantic token names are kept so every screen re-themes at once.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary — indigo
        primary: '#4F46E5',
        'on-primary': '#ffffff',
        'primary-container': '#C7D2FE',
        'on-primary-container': '#312E81',
        'surface-tint': '#4F46E5',
        'inverse-primary': '#A5B4FC',
        'primary-fixed': '#E0E7FF',
        'primary-fixed-dim': '#C7D2FE',
        'on-primary-fixed': '#1E1B4B',
        'on-primary-fixed-variant': '#3730A3',

        // Secondary — blue
        secondary: '#2563EB',
        'on-secondary': '#ffffff',
        'secondary-container': '#DBEAFE',
        'on-secondary-container': '#1E3A8A',
        'secondary-fixed': '#DBEAFE',
        'secondary-fixed-dim': '#93C5FD',
        'on-secondary-fixed': '#172554',
        'on-secondary-fixed-variant': '#1E40AF',

        // Tertiary — warm orange (streaks)
        tertiary: '#C2410C',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#FDBA74',
        'on-tertiary-container': '#7C2D12',
        'tertiary-fixed': '#FFEDD5',
        'tertiary-fixed-dim': '#FDBA74',
        'on-tertiary-fixed': '#431407',
        'on-tertiary-fixed-variant': '#9A3412',

        // Error
        error: '#DC2626',
        'on-error': '#ffffff',
        'error-container': '#FEE2E2',
        'on-error-container': '#991B1B',

        // Surfaces / neutrals
        background: '#F5F6F8',
        'on-background': '#111827',
        surface: '#F5F6F8',
        'surface-bright': '#ffffff',
        'surface-dim': '#E5E7EB',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#F1F2F5',
        'surface-container': '#E9EBF0',
        'surface-container-high': '#E3E5EB',
        'surface-container-highest': '#D7DAE2',
        'surface-variant': '#E5E7EB',
        'on-surface': '#111827',
        'on-surface-variant': '#6B7280',
        outline: '#9CA3AF',
        'outline-variant': '#D1D5DB',
        'inverse-surface': '#1F2937',
        'inverse-on-surface': '#F9FAFB',

        // Dark-mode surface set
        'dark-bg': '#0f1115',
        'dark-surface': '#171a20',
        'dark-surface-container': '#1e222a',
        'dark-surface-high': '#2a2f39',
        'dark-on-surface': '#e5e7eb',
        'dark-on-surface-variant': '#9ca3af',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px',
      },
      spacing: {
        gutter: '16px',
        lg: '24px',
        md: '16px',
        'margin-desktop': '48px',
        xs: '4px',
        xl: '32px',
        sm: '8px',
        base: '4px',
        'margin-mobile': '16px',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        'body-lg': ['Geist'],
        'label-md': ['Geist'],
        'headline-md': ['Geist'],
        'body-md': ['Geist'],
        'label-sm': ['Geist'],
        'headline-xl': ['Geist'],
        'headline-lg-mobile': ['Geist'],
        'headline-lg': ['Geist'],
      },
      fontSize: {
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        'headline-xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
}
