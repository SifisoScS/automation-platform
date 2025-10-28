'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { isAuthenticated } from '@/lib/auth'
import { useWorkflow, useUpdateWorkflow } from '@/hooks/useWorkflows'
import { WorkflowCanvas } from '@/components/workflow-editor/WorkflowCanvas'
import { NodePalette } from '@/components/workflow-editor/NodePalette'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'

export default function EditWorkflowPage() {
  const router = useRouter()
  const params = useParams()
  const workflowId = params.id as string
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState('')

  const { data: workflow, isLoading } = useWorkflow(workflowId)
  const updateWorkflow = useUpdateWorkflow()

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push('/auth/login')
    }
  }, [router])

  const handleSaveWorkflow = async (definition: any) => {
    try {
      setError('')
      await updateWorkflow.mutateAsync({
        workflowId,
        data: { definition },
      })
      // Show success message
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save workflow')
    }
  }

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading workflow..." />
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <p className="text-gray-600">Workflow not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/workflows')}
            >
              Back to Workflows
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline"
          >
            ← Back
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {workflow.name}
          </h1>
          {workflow.description && (
            <p className="text-gray-600">{workflow.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <WorkflowCanvas
              workflowId={workflowId}
              onSave={handleSaveWorkflow}
            />
          </div>

          <div>
            <NodePalette />
          </div>
        </div>
      </div>
    </div>
  )
}

