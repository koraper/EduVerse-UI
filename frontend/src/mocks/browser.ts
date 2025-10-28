import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Service Worker 설정
export const worker = setupWorker(...handlers)
