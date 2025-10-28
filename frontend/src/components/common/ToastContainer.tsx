import { useToast } from './ToastContext'
import Toast from './Toast'

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div
      className={`
        fixed top-20 left-1/2 -translate-x-1/2 z-50
        flex flex-col gap-2
        pointer-events-auto
      `}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
