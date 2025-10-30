import { useTheme } from '@/contexts/ThemeContext'
import { Check } from 'lucide-react'

interface Step {
  id: number
  title: string
  description?: string
}

interface StepProgressProps {
  steps: Step[]
  currentStep: number
}

const StepProgress = ({ steps, currentStep }: StepProgressProps) => {
  const { currentTheme } = useTheme()

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isUpcoming = step.id > currentStep

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    isCompleted
                      ? 'bg-primary-500 text-white'
                      : isCurrent
                      ? currentTheme === 'dark'
                        ? 'bg-primary-500 text-white ring-4 ring-primary-500/30'
                        : 'bg-primary-500 text-white ring-4 ring-primary-500/30'
                      : currentTheme === 'dark'
                      ? 'bg-gray-700 text-gray-400 border-2 border-gray-600'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent
                        ? currentTheme === 'dark'
                          ? 'text-primary-400'
                          : 'text-primary-600'
                        : isCompleted
                        ? currentTheme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-700'
                        : currentTheme === 'dark'
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div
                      className={`text-xs mt-1 ${
                        currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-all ${
                    step.id < currentStep
                      ? 'bg-primary-500'
                      : currentTheme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-gray-300'
                  }`}
                  style={{ marginTop: '-2.5rem' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StepProgress
