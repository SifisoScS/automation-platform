'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { isAuthenticated } from '@/lib/auth'
import { useWorkflows, useDeleteWorkflow } from '@/hooks/useWorkflows'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'

export default function WorkflowsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState('')
  const { data: workflows, isLoading } = useWorkflows()
  const deleteWorkflow = useDeleteWorkflow()

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push('/auth/login')
    }
  }, [router])

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return

    try {
      await deleteWorkflow.mutateAsync(workflowId)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete workflow')
    }
  }

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading workflows..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
            Automation Platform
          </Link>
          <Link href="/workflows/new">
            <Button>Create Workflow</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Workflows</h1>

        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

        {!workflows || workflows.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-600 mb-4">No workflows yet</p>
              <Link href="/workflows/new">
                <Button>Create Your First Workflow</Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardBody>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {workflow.name}
                      </h3>
                      {workflow.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {workflow.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          workflow.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {workflow.is_active ? '✓ Active' : '○ Inactive'}
                        </span>
                        {workflow.schedule && (
                          <span className="text-xs text-gray-600">
                            Schedule: {workflow.schedule}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Created {new Date(workflow.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/workflows/${workflow.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        disabled={deleteWorkflow.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

