import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupGlobalErrorHandlers } from './services/errorLogger'

// 글로벌 에러 핸들러 설정
setupGlobalErrorHandlers()

// MSW 초기화 (개발 환경에서만)
async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }

  const { worker } = await import('./mocks/browser')

  // Service Worker 시작
  return worker.start({
    onUnhandledRequest: 'bypass', // 처리되지 않은 요청은 통과
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
