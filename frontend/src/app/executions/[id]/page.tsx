'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { isAuthenticated } from '@/lib/auth'
import { useExecution, useExecutionLogs } from '@/hooks/useExecutions'
import { ExecutionStatus } from '@/components/executions/ExecutionStatus'
import { ExecutionTimeline } from '@/components/executions/ExecutionTimeline'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function ExecutionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const executionId = params.id as string
  const [mounted, setMounted] = useState(false)

  const { data: execution, isLoading: executionLoading } = useExecution(executionId)
  const { data: logs, isLoading: logsLoading } = useExecutionLogs(executionId)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push('/auth/login')
    }
  }, [router])

  if (!mounted) return null

  if (executionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading execution..." />
      </div>
    )
  }

  if (!execution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <p className="text-gray-600">Execution not found</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  const duration = execution.completed_at
    ? new Date(execution.completed_at).getTime() - new Date(execution.started_at || execution.created_at).getTime()
    : null

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
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Execution Details
              </h1>
              <p className="text-gray-600 mt-2">
                Workflow: {execution.workflow_id}
              </p>
            </div>
            <ExecutionStatus status={execution.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {execution.status}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Trigger Type</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {execution.trigger_type}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {duration ? `${(duration / 1000).toFixed(2)}s` : '-'}
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Timing</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-gray-900">
                  {new Date(execution.created_at).toLocaleString()}
                </p>
              </div>
              {execution.started_at && (
                <div>
                  <p className="text-sm text-gray-600">Started</p>
                  <p className="text-gray-900">
                    {new Date(execution.started_at).toLocaleString()}
                  </p>
                </div>
              )}
              {execution.completed_at && (
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-gray-900">
                    {new Date(execution.completed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {execution.error_message && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-red-900">Error</h3>
              </CardHeader>
              <CardBody>
                <p className="text-red-700 text-sm">{execution.error_message}</p>
              </CardBody>
            </Card>
          )}
        </div>

        <ExecutionTimeline logs={logs || []} isLoading={logsLoading} />

        {execution.result_data && (
          <Card className="mt-6">
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Result Data</h3>
            </CardHeader>
            <CardBody>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(execution.result_data, null, 2)}
              </pre>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}

