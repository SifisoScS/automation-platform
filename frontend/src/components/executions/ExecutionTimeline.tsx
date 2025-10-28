import { ExecutionLog } from '@/lib/types'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

interface ExecutionTimelineProps {
  logs: ExecutionLog[]
  isLoading?: boolean
}

export const ExecutionTimeline = ({ logs, isLoading }: ExecutionTimelineProps) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'border-blue-200 bg-blue-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return 'ℹ️'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '•'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-600">Loading logs...</p>
        </CardBody>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-600">No logs available</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Execution Timeline</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {logs.map((log, index) => (
            <div
              key={log.id}
              className={`p-4 border-l-4 rounded ${getLevelColor(log.level)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{getLevelIcon(log.level)}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{log.node_id}</p>
                      <p className="text-sm text-gray-600 mt-1">{log.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.metadata && (
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

