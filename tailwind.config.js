/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tsri: {
          navy: '#062B63',      // Deep Corporate Navy (Main Header, Sidebar, Title)
          navyDark: '#031738',  // Deep Dark Background
          blue: '#1356A3',      // Primary Blue (Panels, Process, Icons)
          blueLight: '#2C73C7', // Bright Active Blue
          teal: '#168A91',      // Teal (Learning, Knowledge, System)
          tealLight: '#20B2AA', // Bright Teal
          orange: '#F36C21',    // Strategic Orange Accent (Attention, Badges, Highlights)
          orangeHover: '#D95813',
          ice: '#F0F5FA',       // Light Ice Blue Panel Background
          slate: '#E2EEF8',     // Border & Card Accent
        },
      },
      fontFamily: {
        sans: ['"Noto Sans Thai"', '"IBM Plex Sans Thai"', 'Sarabun', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
