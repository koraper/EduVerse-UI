/**
 * 재시도 설정 옵션
 */
export interface RetryOptions {
  maxAttempts?: number
  delayMs?: number
  backoffMultiplier?: number
  shouldRetry?: (error: unknown, attempt: number) => boolean
  onRetry?: (attempt: number, error: unknown) => void
}

/**
 * 재시도 가능한 작업을 실행합니다
 * @param fn 실행할 비동기 함수
 * @param options 재시도 옵션
 * @returns 함수 실행 결과
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 1.5,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options

  let lastError: unknown
  let currentDelay = delayMs

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // 마지막 시도이거나 재시도하지 않아야 하면 에러 던지기
      if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
        throw error
      }

      // 재시도 콜백 실행
      if (onRetry) {
        onRetry(attempt, error)
      }

      // 지수 백오프로 대기
      await delay(currentDelay)
      currentDelay = Math.floor(currentDelay * backoffMultiplier)
    }
  }

  throw lastError
}

/**
 * 기본 재시도 조건: 네트워크 에러나 5xx 서버 에러일 때만 재시도
 */
function defaultShouldRetry(error: unknown, attempt: number): boolean {
  // 최대 3회까지만 재시도
  if (attempt >= 3) return false

  // 네트워크 에러는 재시도
  if (error instanceof TypeError) {
    return true
  }

  // Response 객체인 경우 상태 코드 확인
  if (error instanceof Response) {
    const status = error.status
    // 500-599 서버 에러는 재시도
    // 408 요청 시간 초과도 재시도
    // 429 너무 많은 요청도 재시도
    return status >= 500 || status === 408 || status === 429
  }

  // 기타 에러는 재시도하지 않음
  return false
}

/**
 * 지정된 시간(ms)만큼 대기
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch 기반 재시도 래퍼
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit & { retryOptions?: RetryOptions }
): Promise<Response> {
  const { retryOptions, ...fetchOptions } = options || {}

  return withRetry(
    async () => {
      const response = await fetch(url, fetchOptions)

      // 성공 상태는 그대로 반환
      if (response.ok) {
        return response
      }

      // 클라이언트 에러는 재시도하지 않음
      if (response.status >= 400 && response.status < 500) {
        return response
      }

      // 서버 에러는 Response 객체를 에러로 던져서 재시도 트리거
      throw response
    },
    retryOptions
  )
}

/**
 * API 호출에 대한 재시도 전략
 * - 네트워크 실패: 3회 재시도
 * - 서버 오류 (5xx): 3회 재시도
 * - 클라이언트 오류 (4xx): 재시도 안 함
 */
export const apiRetryStrategy = {
  // 사용자 조회 등 조회 작업
  query: {
    maxAttempts: 3,
    delayMs: 800,
    backoffMultiplier: 2,
  },

  // 데이터 생성/수정 작업 (멱등하지 않을 수 있음)
  mutation: {
    maxAttempts: 2,
    delayMs: 1000,
    backoffMultiplier: 2,
  },

  // 중요한 작업 (결제, 등록 등)
  critical: {
    maxAttempts: 1, // 재시도하지 않음
    delayMs: 0,
    backoffMultiplier: 1,
  },
}
