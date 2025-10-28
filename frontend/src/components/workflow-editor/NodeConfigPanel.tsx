'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface NodeConfigPanelProps {
  nodeId?: string
  nodeType?: string
  config?: Record<string, any>
  onSave?: (config: Record<string, any>) => void
  onClose?: () => void
}

export const NodeConfigPanel = ({
  nodeId,
  nodeType,
  config = {},
  onSave,
  onClose,
}: NodeConfigPanelProps) => {
  const [formData, setFormData] = useState(config)

  const handleInputChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      [key]: value,
    })
  }

  const handleSave = () => {
    onSave?.(formData)
  }

  if (!nodeId) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-600">Select a node to configure</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Configure Node</h3>
            <p className="text-sm text-gray-600 mt-1">{nodeId}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {nodeType === 'http_request' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Method
                </label>
                <select
                  value={formData.method || 'GET'}
                  onChange={(e) => handleInputChange('method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                  <option>PATCH</option>
                </select>
              </div>

              <Input
                label="URL"
                type="text"
                placeholder="https://api.example.com/endpoint"
                value={formData.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
              />

              <Input
                label="Headers (JSON)"
                type="text"
                placeholder='{"Authorization": "Bearer token"}'
                value={formData.headers ? JSON.stringify(formData.headers) : ''}
                onChange={(e) => {
                  try {
                    handleInputChange('headers', JSON.parse(e.target.value))
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
              />

              <Input
                label="Timeout (seconds)"
                type="number"
                value={formData.timeout || 30}
                onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
              />
            </>
          )}

          {nodeType === 'delay' && (
            <Input
              label="Delay (seconds)"
              type="number"
              value={formData.delay_seconds || 0}
              onChange={(e) => handleInputChange('delay_seconds', parseFloat(e.target.value))}
            />
          )}

          {nodeType === 'conditional' && (
            <>
              <Input
                label="Left Value"
                type="text"
                placeholder="{{node_1.output.status}}"
                value={formData.left_value || ''}
                onChange={(e) => handleInputChange('left_value', e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operator
                </label>
                <select
                  value={formData.operator || '=='}
                  onChange={(e) => handleInputChange('operator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="==">=</option>
                  <option value="!=">!=</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                  <option value="contains">contains</option>
                  <option value="in">in</option>
                </select>
              </div>

              <Input
                label="Right Value"
                type="text"
                placeholder="200"
                value={formData.right_value || ''}
                onChange={(e) => handleInputChange('right_value', e.target.value)}
              />
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Configuration
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

