import { ExecutionStatus as ExecutionStatusType } from '@/lib/types'

interface ExecutionStatusProps {
  status: ExecutionStatusType
}

export const ExecutionStatus = ({ status }: ExecutionStatusProps) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: '⏳',
      label: 'Pending',
    },
    running: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: '▶️',
      label: 'Running',
    },
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: '✓',
      label: 'Success',
    },
    failed: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: '✕',
      label: 'Failed',
    },
    cancelled: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: '⊘',
      label: 'Cancelled',
    },
  }

  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  )
}

