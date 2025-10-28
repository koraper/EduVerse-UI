import * as XLSX from 'xlsx'

export interface ExportOptions {
  filename: string
  sheetName?: string
}

/**
 * CSV 형식으로 데이터를 내보냅니다
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  options: ExportOptions
): void => {
  if (!data || data.length === 0) {
    console.warn('내보낼 데이터가 없습니다')
    return
  }

  // 헤더 추출 (첫 번째 객체의 키 사용)
  const headers = Object.keys(data[0])

  // CSV 행 생성
  const csvRows: string[] = []

  // 헤더 행 추가 (쉼표로 구분)
  csvRows.push(headers.map(escapeCSVValue).join(','))

  // 데이터 행 추가
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header]
      return escapeCSVValue(formatValue(value))
    })
    csvRows.push(values.join(','))
  })

  // CSV 문자열 생성
  const csvContent = csvRows.join('\n')

  // BOM 추가 (UTF-8 with BOM - Excel에서 한글이 제대로 표시되도록)
  const BOM = '\uFEFF'
  const csvWithBOM = BOM + csvContent

  // Blob 생성 및 다운로드
  downloadFile(csvWithBOM, options.filename, 'text/csv;charset=utf-8;')
}

/**
 * XLSX(Excel) 형식으로 데이터를 내보냅니다
 */
export const exportToXLSX = <T extends Record<string, any>>(
  data: T[],
  options: ExportOptions
): void => {
  if (!data || data.length === 0) {
    console.warn('내보낼 데이터가 없습니다')
    return
  }

  try {
    // 데이터 포맷 (값 포맷팅)
    const formattedData = data.map((row) => {
      const formatted: Record<string, any> = {}
      Object.entries(row).forEach(([key, value]) => {
        formatted[key] = formatValue(value)
      })
      return formatted
    })

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(formattedData)

    // 워크북 생성
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1')

    // 열 너비 자동 조정
    const maxWidths: Record<string, number> = {}
    Object.keys(formattedData[0] || {}).forEach((key) => {
      maxWidths[key] = Math.max(
        key.length,
        ...formattedData.map((row) => String(row[key] || '').length)
      )
    })

    worksheet['!cols'] = Object.keys(formattedData[0] || {}).map((key) => ({
      wch: Math.min(maxWidths[key] + 2, 50), // 최대 50까지
    }))

    // 파일 저장
    XLSX.writeFile(workbook, options.filename)
  } catch (error) {
    console.error('XLSX 내보내기 실패:', error)
    throw error
  }
}

/**
 * CSV 값을 이스케이프 처리합니다
 */
const escapeCSVValue = (value: string): string => {
  if (!value) return ''

  // 쉼표, 줄바꿈, 큰따옴표가 있으면 큰따옴표로 감싸고 내부의 큰따옴표는 두 배로
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"}`
  }

  return value
}

/**
 * 값을 문자열로 포맷합니다
 */
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return ''

  if (typeof value === 'boolean') return value ? 'Y' : 'N'

  if (typeof value === 'object') {
    if (value instanceof Date) {
      return value.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    }
    return JSON.stringify(value)
  }

  return String(value)
}

/**
 * 파일을 다운로드합니다
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 타임스탬프를 한글 날짜로 포맷합니다
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * 파일명에 현재 날짜를 추가합니다
 */
export const getFilenameWithDate = (baseFilename: string, extension: string): string => {
  const now = new Date()
  const dateStr = now
    .toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(/[/:]/g, '-')
    .replace(/\s/g, '_')

  return `${baseFilename}_${dateStr}.${extension}`
}
