import { authHandlers } from './auth'
import { profileHandlers } from './profile'
import { coursesHandlers } from './courses'
import { adminHandlers } from './admin'
import { professorClassHandlers } from './professor/class'
import { qnaHandlers } from './qna'

// 모든 핸들러를 하나로 결합
export const handlers = [
  ...authHandlers,
  ...profileHandlers,
  ...coursesHandlers,
  ...adminHandlers,
  ...professorClassHandlers,
  ...qnaHandlers,
]
