/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './components/**/*.tsx',
    './hooks/**/*.ts',
    './services/**/*.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Rounded body face. Nunito has no CJK glyphs, so Chinese uses the system's own.
        sans: ['Nunito', '"PingFang SC"', '"Noto Sans SC"', '"Microsoft YaHei"', 'system-ui', '-apple-system', 'sans-serif'],
        // Rounded display face for titles and the "story" the mind added.
        // Fredoka has no CJK glyphs, so Chinese falls through to ZCOOL KuaiLe.
        display: ['Fredoka', '"ZCOOL KuaiLe"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
