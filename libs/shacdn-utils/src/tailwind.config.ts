const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

// Hàm buildConfig này sẽ nhận thư mục gốc của project (ví dụ: 'apps/client')
// và tạo ra một cấu hình Tailwind hoàn chỉnh.
function buildConfig(projectRoot: string) {
  return {
    content: [
      join(projectRoot, 'src/**/*.{ts,tsx,js,jsx}'),
      // Dòng này rất quan trọng để Nx tự động tìm các component trong các thư viện khác
      ...createGlobPatternsForDependencies(projectRoot),
    ],
    darkMode: 'class', // Thêm darkMode cho Shadcn UI
    theme: {
      container: { // Thêm cấu hình container cho Shadcn UI
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
      extend: {
        // Đây là phần quan trọng nhất được gộp từ file thứ hai của bạn
        colors: {
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: {
            DEFAULT: 'hsl(var(--primary))',
            foreground: 'hsl(var(--primary-foreground))',
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary))',
            foreground: 'hsl(var(--secondary-foreground))',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          accent: {
            DEFAULT: 'hsl(var(--accent))',
            foreground: 'hsl(var(--accent-foreground))',
          },
          popover: {
            DEFAULT: 'hsl(var(--popover))',
            foreground: 'hsl(var(--popover-foreground))',
          },
          card: {
            DEFAULT: 'hsl(var(--card))',
            foreground: 'hsl(var(--card-foreground))',
          },
        },
        borderRadius: {
          lg: `var(--radius)`,
          md: `calc(var(--radius) - 2px)`,
          sm: 'calc(var(--radius) - 4px)',
        },
        keyframes: { // Thêm keyframes cho animation của Shadcn UI
          'accordion-down': {
            from: { height: '0' },
            to: { height: 'var(--radix-accordion-content-height)' },
          },
          'accordion-up': {
            from: { height: 'var(--radix-accordion-content-height)' },
            to: { height: '0' },
          },
        },
        animation: { // Thêm animation cho Shadcn UI
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out',
        },
      },
    },
    plugins: [require('tailwindcss-animate')], // Plugin cần thiết cho Shadcn UI
  };
}

// Xuất hàm này ra để các file tailwind.config.js khác có thể import và sử dụng
module.exports = { buildConfig };