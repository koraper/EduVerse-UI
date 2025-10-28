/**
 * 상대 시간 표시 유틸리티
 * 주어진 날짜로부터 현재까지의 경과 시간을 사람이 읽기 쉬운 형식으로 변환합니다.
 *
 * @param dateString - ISO 8601 형식의 날짜 문자열 (예: "2025-10-18T10:30:00Z")
 * @returns 상대 시간 문자열 (예: "2분 전", "3시간 전", "5일 전")
 *
 * @example
 * timeAgo("2025-10-18T10:28:00Z") // "2분 전"
 * timeAgo("2025-10-17T08:00:00Z") // "1일 전"
 */
export function timeAgo(dateString: string): string {
  const now = new Date()
  const past = new Date(dateString)
  const diffInMs = now.getTime() - past.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)

  // 1분 미만
  if (diffInSeconds < 60) {
    return '방금 전'
  }

  // 1시간 미만
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  }

  // 24시간 미만
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  }

  // 30일 미만
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays}일 전`
  }

  // 12개월 미만
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`
  }

  // 1년 이상
  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears}년 전`
}
