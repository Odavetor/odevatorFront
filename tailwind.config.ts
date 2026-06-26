import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-onest)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'gr-2xs': ['10px', { lineHeight: '1.618' }],
        'gr-xs': ['13px', { lineHeight: '1.618' }],
        'gr-sm': ['16px', { lineHeight: '1.618' }],
        'gr-md': ['20px', { lineHeight: '1.272' }],
        'gr-lg': ['26px', { lineHeight: '1.272' }],
        'gr-xl': ['42px', { lineHeight: '1.0' }],
        'gr-2xl': ['68px', { lineHeight: '0.95' }],
      },
      spacing: {
        'phi-1': '4px',
        'phi-2': '6px',
        'phi-3': '10px',
        'phi-4': '16px',
        'phi-5': '26px',
        'phi-6': '42px',
        'phi-7': '68px',
      },
      aspectRatio: {
        golden: '1 / 1.618',
        'golden-sq': '1.272 / 1',
      },
      colors: {
        ink: {
          950: '#0D0D0F',
          900: '#111116',
          800: '#18181F',
          700: '#1F1F28',
          600: '#2A2A35',
          500: '#3A3A48',
        },
        rose: {
          50: '#FEF0F4',
          100: '#FCDDE6',
          200: '#F8ACCB',
          300: '#F07298',
          400: '#E03F6A',
          500: '#C9294A',
          600: '#A81E38',
          mist: 'rgba(224, 63, 106, 0.08)',
          DEFAULT: '#E03F6A',
        },
        gold: {
          50: '#FDF5EE',
          100: '#F7E2CC',
          200: '#ECC89A',
          300: '#DDA96A',
          400: '#C9966A',
          500: '#B07D52',
          glow: 'rgba(201, 150, 106, 0.18)',
          rule: 'rgba(201, 150, 106, 0.35)',
          DEFAULT: '#C9966A',
        },
        cream: {
          50: '#FBF5F7',
          100: '#F5EEF0',
          200: '#EBDDE2',
          300: '#D9C0CB',
          400: '#C4889E',
          500: '#A8607A',
          600: '#8A4460',
          700: '#7A4A5E',
        },
        veil: {
          DEFAULT: 'rgba(13, 13, 15, 0.72)',
          soft: 'rgba(13, 13, 15, 0.32)',
        },
        splash: {
          violet: '#7B5CF6',
          'violet-bg': 'rgba(123,92,246,0.14)',
          cyan: '#3FD4E0',
          'cyan-bg': 'rgba(63,212,224,0.14)',
          orange: '#FF8A4C',
          'orange-bg': 'rgba(255,138,76,0.14)',
          green: '#5FD296',
          'green-bg': 'rgba(95,210,150,0.14)',
        },
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
        tactile: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        glide: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        breathe: 'breathe 3.5s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'glow-breathe': 'glowBreathe 4.5s ease-in-out infinite',
        float: 'float 4.5s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'shimmer-slow': 'shimmer 4.5s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        marquee: 'marquee 38s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.025)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.15', transform: 'scale(0.92)' },
          '50%': { opacity: '0.5', transform: 'scale(1.04)' },
        },
        glowBreathe: {
          '0%, 100%': { opacity: '0.35', filter: 'blur(22px)' },
          '50%': { opacity: '0.65', filter: 'blur(22px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0%)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'neon-rose':
          '0 0 0 1px rgba(224,63,106,0.6), 0 0 24px rgba(224,63,106,0.55), 0 12px 40px -6px rgba(224,63,106,0.55)',
        'neon-cta':
          'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 28px rgba(224,63,106,0.55), 0 18px 44px -10px rgba(224,63,106,0.6)',
        'glow-rose': '0 0 48px rgba(224,63,106,0.25), 0 0 96px rgba(224,63,106,0.1)',
        'glow-sm': '0 0 24px rgba(224,63,106,0.2)',
        'glow-selected':
          '0 0 0 1.5px #E03F6A, 0 0 24px rgba(224,63,106,0.45), inset 0 0 12px rgba(224,63,106,0.05)',
        'glow-violet': '0 0 0 1.5px #8B5CF6, 0 0 20px rgba(139,92,246,0.35)',
        inner: 'inset 0 1px 0 rgba(255,255,255,0.07)',
        card: '0 4px 32px rgba(0,0,0,0.6)',
        'card-hover': '0 8px 48px rgba(0,0,0,0.7)',
        premium:
          'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.5), 0 18px 60px -12px rgba(180,30,60,0.18)',
        'premium-gold':
          'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.5), 0 18px 60px -12px rgba(201,150,106,0.22)',
        engrave:
          'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'surface-shine': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
        'gold-rule': 'linear-gradient(90deg, transparent, rgba(201,150,106,0.55), transparent)',
        'rose-rule': 'linear-gradient(90deg, transparent, rgba(224,63,106,0.45), transparent)',
        'champagne-sweep':
          'linear-gradient(135deg, rgba(201,150,106,0.22) 0%, rgba(176,125,82,0.05) 100%)',
      },
    },
  },
  plugins: [],
}

export default config
