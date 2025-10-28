/**
 * localStorage 기반 데이터 영속성 관리
 *
 * 새로고침 후에도 데이터를 유지하기 위한 유틸리티
 */

const STORAGE_KEY = 'eduverse-mock-db'
const STORAGE_VERSION = '1.0'

export interface StorageData {
  version: string
  timestamp: string
  data: {
    users: any[]
    curricula: any[]
    classes: any[]
    weeklySessions: any[]
    enrollments: any[]
    submissions: any[]
    questions: any[]
    answers: any[]
    adminLogs: any[]
  }
}

/**
 * localStorage에서 데이터 로드
 */
export const loadFromStorage = (): StorageData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      console.log('[Storage] 저장된 데이터가 없습니다. 시드 데이터를 사용합니다.')
      return null
    }

    const parsed: StorageData = JSON.parse(stored)

    // 버전 체크
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('[Storage] 저장된 데이터 버전이 다릅니다. 초기화합니다.')
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    console.log('[Storage] 저장된 데이터를 로드했습니다.')
    console.log('  - 저장 시간:', parsed.timestamp)
    console.log('  - Users:', parsed.data.users.length)
    console.log('  - Classes:', parsed.data.classes.length)

    return parsed
  } catch (error) {
    console.error('[Storage] 데이터 로드 실패:', error)
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

/**
 * localStorage에 데이터 저장
 */
export const saveToStorage = (data: StorageData['data']): void => {
  try {
    const storageData: StorageData = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
    console.log('[Storage] 데이터를 저장했습니다.')
  } catch (error) {
    // localStorage 용량 초과 또는 비활성화 시
    console.error('[Storage] 데이터 저장 실패:', error)

    // 용량 초과 시 자동 정리
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('[Storage] 용량 초과. 데이터를 초기화합니다.')
      clearStorage()
    }
  }
}

/**
 * localStorage 초기화
 */
export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('[Storage] 저장된 데이터를 삭제했습니다.')
  } catch (error) {
    console.error('[Storage] 데이터 삭제 실패:', error)
  }
}

/**
 * 저장된 데이터 정보 확인
 */
export const getStorageInfo = (): {
  exists: boolean
  size: number
  timestamp: string | null
  version: string | null
} => {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return {
      exists: false,
      size: 0,
      timestamp: null,
      version: null,
    }
  }

  const sizeInBytes = new Blob([stored]).size
  const sizeInKB = (sizeInBytes / 1024).toFixed(2)

  try {
    const parsed: StorageData = JSON.parse(stored)
    return {
      exists: true,
      size: parseFloat(sizeInKB),
      timestamp: parsed.timestamp,
      version: parsed.version,
    }
  } catch {
    return {
      exists: true,
      size: parseFloat(sizeInKB),
      timestamp: null,
      version: null,
    }
  }
}

/**
 * localStorage 사용 가능 여부 확인
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * 데이터 내보내기 (JSON 파일)
 */
export const exportData = (): void => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    console.warn('[Storage] 내보낼 데이터가 없습니다.')
    return
  }

  const blob = new Blob([stored], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `eduverse-mockdb-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)

  console.log('[Storage] 데이터를 내보냈습니다.')
}

/**
 * 데이터 가져오기 (JSON 파일)
 */
export const importData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsed: StorageData = JSON.parse(content)

        // 버전 체크
        if (parsed.version !== STORAGE_VERSION) {
          reject(new Error('버전이 호환되지 않습니다.'))
          return
        }

        localStorage.setItem(STORAGE_KEY, content)
        console.log('[Storage] 데이터를 가져왔습니다.')
        resolve()
      } catch (error) {
        console.error('[Storage] 데이터 가져오기 실패:', error)
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'))
    }

    reader.readAsText(file)
  })
}
