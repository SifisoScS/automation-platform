'use client'

import { useCallback, useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface WorkflowCanvasProps {
  workflowId?: string
  onSave?: (definition: any) => void
}

export const WorkflowCanvas = ({ workflowId, onSave }: WorkflowCanvasProps) => {
  const [nodes, setNodes] = useState<any[]>([])
  const [edges, setEdges] = useState<any[]>([])

  const handleAddNode = useCallback(() => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'http_request',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      config: {},
    }
    setNodes([...nodes, newNode])
  }, [nodes])

  const handleSave = useCallback(() => {
    const definition = { nodes, edges }
    onSave?.(definition)
  }, [nodes, edges, onSave])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Workflow Editor</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAddNode}>
                Add Node
              </Button>
              <Button onClick={handleSave}>Save Workflow</Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                React Flow integration coming soon
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop nodes to create your workflow
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {nodes.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Nodes ({nodes.length})</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <p className="font-medium text-gray-900">{node.id}</p>
                  <p className="text-sm text-gray-600">{node.type}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

