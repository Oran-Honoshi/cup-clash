// Cup Clash — Tailwind config (drop into tailwind.config.ts)
// Tokens are mirrored 1:1 from tokens.css. Edit either, then keep them in sync.

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:        '#050810',
        bgAlt:     '#080510',
        surface:   'rgba(18,14,38,0.32)',
        surfaceStrong: 'rgba(18,14,38,0.5)',
        border:    { DEFAULT: 'rgba(255,255,255,0.14)', strong: 'rgba(255,255,255,0.18)' },
        ac:        '#00FF88',
        cyan:      '#00D4FF',
        purple:    '#8B5CF6',
        amber:     '#fbbf24',
        pink:      '#ec4899',
        danger:    '#f87171',
        fg:        { DEFAULT: '#ffffff', muted: 'rgba(255,255,255,0.7)', dim: 'rgba(255,255,255,0.5)', faint: 'rgba(255,255,255,0.35)' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        ui:      ['"Outfit"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        hero:    ['clamp(48px, 7vw, 92px)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
        h2:      ['clamp(40px, 5vw, 64px)', { lineHeight: '1.1',  fontWeight: '800' }],
        h3:      ['26px', { lineHeight: '1.15', fontWeight: '800' }],
        card:    ['19px', { lineHeight: '1.2',  fontWeight: '800' }],
        'body-lg':['19px',{ lineHeight: '1.5',  fontWeight: '500' }],
        body:    ['14px', { lineHeight: '1.55', fontWeight: '500' }],
        meta:    ['13px', { lineHeight: '1.4',  fontWeight: '500' }],
        label:   ['11px', { lineHeight: '1',    fontWeight: '700', letterSpacing: '0.18em' }],
        chip:    ['11px', { lineHeight: '1',    fontWeight: '700', letterSpacing: '0.1em' }],
      },
      borderRadius: {
        sm: '8px', md: '10px', lg: '14px', xl: '18px',
        '2xl': '22px', '3xl': '24px',
        phone: '34px', phoneXL: '44px',
        pill: '100px',
      },
      boxShadow: {
        glass:      '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)',
        'glow-ac':    '0 8px 30px rgba(0,255,136,0.4)',
        'glow-cyan':  '0 8px 30px rgba(0,212,255,0.4)',
        'glow-purple':'0 8px 30px rgba(139,92,246,0.4)',
      },
      backdropBlur: { glass: '40px' },
      transitionDuration: { fast: '140ms', normal: '220ms', slow: '400ms' },
      transitionTimingFunction: { out: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      animation: {
        livePulse: 'livePulse 1.4s ease-in-out infinite',
        floatY:    'floatY 6s ease-in-out infinite',
        fadeUp:    'fadeUp 250ms ease-out',
        slideDown: 'slideDown 220ms ease-out',
      },
      keyframes: {
        livePulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        floatY:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        fadeUp:    { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
