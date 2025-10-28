import { Card, CardBody, CardHeader } from '@/components/ui/Card'

const NODE_TYPES = [
  {
    id: 'http_request',
    name: 'HTTP Request',
    description: 'Make HTTP requests to external APIs',
    icon: '🌐',
  },
  {
    id: 'delay',
    name: 'Delay',
    description: 'Wait for a specified duration',
    icon: '⏱️',
  },
  {
    id: 'conditional',
    name: 'Conditional',
    description: 'Execute based on conditions',
    icon: '🔀',
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Send email notifications',
    icon: '📧',
    disabled: true,
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Execute database queries',
    icon: '🗄️',
    disabled: true,
  },
]

interface NodePaletteProps {
  onNodeSelect?: (nodeType: string) => void
}

export const NodePalette = ({ onNodeSelect }: NodePaletteProps) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Available Nodes</h3>
      </CardHeader>
      <CardBody>
        <div className="grid gap-3">
          {NODE_TYPES.map((node) => (
            <div
              key={node.id}
              onClick={() => !node.disabled && onNodeSelect?.(node.id)}
              className={`p-3 rounded border-2 transition ${
                node.disabled
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  : 'border-blue-200 bg-blue-50 hover:border-blue-400 cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{node.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{node.name}</p>
                  <p className="text-sm text-gray-600">{node.description}</p>
                  {node.disabled && (
                    <p className="text-xs text-gray-500 mt-1">Coming soon</p>
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

