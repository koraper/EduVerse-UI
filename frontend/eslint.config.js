import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // TypeScript 규칙 완화
      '@typescript-eslint/no-explicit-any': 'off', // MSW, 유틸리티에서 any 필요
      '@typescript-eslint/no-unused-vars': 'off', // 개발 중 미사용 변수 허용
      '@typescript-eslint/ban-ts-comment': 'off', // @ts-nocheck 허용 (미완성 professor 코드)

      // React 규칙 완화
      'react-hooks/exhaustive-deps': 'off', // 의존성 배열 경고 비활성화
      'react-refresh/only-export-components': 'off', // Context 등에서 상수 export 허용

      // 기타
      'no-useless-escape': 'off',
      'no-useless-catch': 'off',
    },
  },
])
