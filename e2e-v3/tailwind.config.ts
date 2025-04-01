import type { Config } from 'tailwindcss';

const getColors = () => ({
  50: '#000',
  ...Array.from({ length: 9 })
    .fill(undefined)
    .reduce<Record<string, string>>((acc, _, i) => ({ ...acc, [(i + 1) * 100]: '#000' }), {}),
  DEFAULT: '#000'
});

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  prefix: 'ui-',
  theme: {
    extend: {
      colors: {
        destructive: getColors(),
        info: getColors(),
        positive: getColors(),
        primary: getColors(),
        secondary: getColors(),
        surface: getColors(),
        warning: getColors()
      }
    }
  }
} satisfies Config;
