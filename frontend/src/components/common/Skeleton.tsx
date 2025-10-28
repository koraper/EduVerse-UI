interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded'
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
      default:
        return 'rounded-lg'
    }
  }

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse'
      case 'wave':
        return 'animate-shimmer'
      case 'none':
      default:
        return ''
    }
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`bg-gray-200 ${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={style}
    />
  )
}

// 테이블 행 스켈레톤
export const TableRowSkeleton = ({ columns = 8 }: { columns?: number }) => {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <Skeleton variant="text" className="w-full" />
        </td>
      ))}
    </tr>
  )
}

// 카드 스켈레톤
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
        <div className="flex items-center justify-between pt-4">
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      </div>
    </div>
  )
}

// 통계 카드 스켈레톤
export const StatCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton variant="text" width="50%" height={16} className="mb-3" />
          <Skeleton variant="text" width="40%" height={32} />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <div className="mt-4">
        <Skeleton variant="text" width="60%" height={14} />
      </div>
    </div>
  )
}

// 사용자 관리 테이블 스켈레톤
export const UserTableSkeleton = ({ rows = 10 }: { rows?: number }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['ID', '이메일', '이름', '역할', '상태', '인증', '가입일', '작업'].map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, index) => (
            <TableRowSkeleton key={index} columns={8} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 대시보드 스켈레톤
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <Skeleton variant="text" width="40%" height={32} className="mb-2" />
        <Skeleton variant="text" width="60%" height={20} />
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Skeleton variant="text" width="30%" height={24} className="mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
              <Skeleton variant="circular" width={32} height={32} className="mb-2" />
              <Skeleton variant="text" width="80%" height={16} />
            </div>
          ))}
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton variant="text" width="30%" height={24} />
          <Skeleton variant="text" width={100} height={20} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton variant="text" width="70%" height={16} className="mb-2" />
                  <Skeleton variant="text" width="40%" height={12} />
                </div>
              </div>
              <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Skeleton
