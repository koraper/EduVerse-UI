/**
 * API 에러 타입 정의
 */
export type ApiErrorType = 'network' | 'auth' | 'permission' | 'validation' | 'server' | 'unknown'

export interface ApiErrorInfo {
  type: ApiErrorType
  message: string
  statusCode?: number
  originalError?: unknown
}

/**
 * API 에러를 분류하고 처리하는 유틸리티 함수
 */
export const handleApiError = (error: unknown): ApiErrorInfo => {
  // 네트워크 에러 (fetch 실패)
  if (error instanceof TypeError) {
    return {
      type: 'network',
      message: '네트워크 연결을 확인해주세요',
      originalError: error,
    }
  }

  // 문자열 에러
  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
      originalError: error,
    }
  }

  // Error 객체 (Response에서 발생한 에러)
  if (error instanceof Error) {
    const message = error.message

    // 응답 JSON 파싱 에러
    if (message.includes('JSON')) {
      return {
        type: 'server',
        message: '서버 응답 형식이 올바르지 않습니다',
        originalError: error,
      }
    }

    return {
      type: 'unknown',
      message,
      originalError: error,
    }
  }

  // 객체 형태의 에러 (API 응답)
  if (typeof error === 'object' && error !== null) {
    const apiError = error as Record<string, unknown>

    // 상태 코드 기반 에러 분류
    const statusCode = apiError.statusCode as number | undefined

    if (statusCode === 401) {
      return {
        type: 'auth',
        message: apiError.message as string || '인증이 필요합니다',
        statusCode,
        originalError: error,
      }
    }

    if (statusCode === 403) {
      return {
        type: 'permission',
        message: apiError.message as string || '접근 권한이 없습니다',
        statusCode,
        originalError: error,
      }
    }

    if (statusCode === 400) {
      return {
        type: 'validation',
        message: apiError.message as string || '입력값이 올바르지 않습니다',
        statusCode,
        originalError: error,
      }
    }

    if (statusCode && statusCode >= 500) {
      return {
        type: 'server',
        message: apiError.message as string || '서버 오류가 발생했습니다',
        statusCode,
        originalError: error,
      }
    }

    // 에러 메시지가 있으면 사용
    if (apiError.message) {
      return {
        type: 'unknown',
        message: apiError.message as string,
        statusCode,
        originalError: error,
      }
    }
  }

  // 기타 알 수 없는 에러
  return {
    type: 'unknown',
    message: '알 수 없는 오류가 발생했습니다',
    originalError: error,
  }
}

/**
 * HTTP Response를 기반으로 에러 처리
 */
export const handleFetchError = async (response: Response): Promise<ApiErrorInfo> => {
  const statusCode = response.status

  // 성공 상태
  if (response.ok) {
    return {
      type: 'unknown',
      message: '요청이 성공했습니다',
      statusCode,
    }
  }

  // 인증 에러
  if (statusCode === 401) {
    return {
      type: 'auth',
      message: '인증이 필요합니다. 다시 로그인해주세요.',
      statusCode,
    }
  }

  // 권한 에러
  if (statusCode === 403) {
    return {
      type: 'permission',
      message: '이 작업을 수행할 권한이 없습니다',
      statusCode,
    }
  }

  // 유효성 검사 에러
  if (statusCode === 400) {
    try {
      const data = await response.json()
      return {
        type: 'validation',
        message: data.message || '입력값이 올바르지 않습니다',
        statusCode,
      }
    } catch {
      return {
        type: 'validation',
        message: '입력값이 올바르지 않습니다',
        statusCode,
      }
    }
  }

  // 서버 에러
  if (statusCode >= 500) {
    return {
      type: 'server',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      statusCode,
    }
  }

  // 기타 에러
  try {
    const data = await response.json()
    return {
      type: 'unknown',
      message: data.message || '요청 처리 중 오류가 발생했습니다',
      statusCode,
    }
  } catch {
    return {
      type: 'unknown',
      message: '요청 처리 중 오류가 발생했습니다',
      statusCode,
    }
  }
}

/**
 * 에러 타입에 따른 Toast 배리언트 결정
 */
export const getToastVariantForErrorType = (errorType: ApiErrorType): 'error' | 'warning' | 'info' => {
  switch (errorType) {
    case 'network':
    case 'server':
    case 'auth':
    case 'permission':
      return 'error'
    case 'validation':
      return 'warning'
    default:
      return 'error'
  }
}
