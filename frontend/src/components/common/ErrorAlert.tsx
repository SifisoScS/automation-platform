import { useState } from 'react'

interface ErrorAlertProps {
  title?: string
  message: string
  onDismiss?: () => void
}

export const ErrorAlert = ({ title = 'Error', message, onDismiss }: ErrorAlertProps) => {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-red-900">{title}</h3>
          <p className="text-red-700 text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-red-400 hover:text-red-600"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

