import Spinner from './Spinner'
import type { LoadingProps } from './types'

const Loading = ({ fullScreen = false, text, size = 'lg' }: LoadingProps) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
        <Spinner size={size} />
        {text && (
          <p className="mt-4 text-gray-600 text-lg font-medium">{text}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Spinner size={size} />
      {text && (
        <p className="mt-4 text-gray-600 text-sm">{text}</p>
      )}
    </div>
  )
}

export default Loading
