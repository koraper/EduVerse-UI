import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@store': path.resolve(__dirname, './src/store'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3005,
    // MSW 사용 시 프록시 비활성화
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5000',
    //     changeOrigin: true,
    //   },
    // },
  },
  build: {
    rollupOptions: {
      external: [
        // Professor 컴포넌트에서 사용하는 미설치 패키지 무시
        '@tanstack/react-query',
        'react-hook-form',
      ],
      output: {
        manualChunks: {
          // React 관련 라이브러리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Chart 라이브러리
          'chart-vendor': ['recharts'],

          // Lucide Icons
          'icon-vendor': ['lucide-react'],

          // MSW (개발 환경)
          'msw-vendor': ['msw'],

          // 페이지별 청크는 자동 분리되도록 제거 (React.lazy가 자동 처리)
        },
      },
    },
    chunkSizeWarningLimit: 1000, // 경고 임계값을 1000KB로 상향
  },
})
