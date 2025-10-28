'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { isAuthenticated } from '@/lib/auth'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ExecutionStatus } from '@/components/executions/ExecutionStatus'
import { apiClient } from '@/lib/api-client'
import { Execution } from '@/lib/types'

export default function ExecutionsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    fetchExecutions()
  }, [router])

  const fetchExecutions = async () => {
    try {
      setLoading(true)
      // Fetch all executions from all workflows
      const response = await apiClient.get<Execution[]>('/executions')
      setExecutions(response)
    } catch (error) {
      console.error('Failed to fetch executions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExecutions = executions.filter((exec) => {
    if (filter === 'all') return true
    return exec.status === filter
  })

  if (!mounted) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading executions..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
            Automation Platform
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Execution History</h1>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'success', 'failed', 'running', 'pending'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {filteredExecutions.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-600">
                {executions.length === 0
                  ? 'No executions yet'
                  : `No ${filter} executions`}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredExecutions.map((execution) => (
              <Link key={execution.id} href={`/executions/${execution.id}`}>
                <Card className="hover:shadow-lg transition cursor-pointer">
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            Workflow: {execution.workflow_id}
                          </h3>
                          <ExecutionStatus status={execution.status} />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {new Date(execution.created_at).toLocaleString()}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-gray-600">
                            Trigger: {execution.trigger_type}
                          </span>
                          {execution.started_at && execution.completed_at && (
                            <span className="text-gray-600">
                              Duration:{' '}
                              {(
                                (new Date(execution.completed_at).getTime() -
                                  new Date(execution.started_at).getTime()) /
                                1000
                              ).toFixed(2)}
                              s
                            </span>
                          )}
                        </div>
                      </div>
                      {execution.error_message && (
                        <div className="text-right">
                          <p className="text-sm text-red-600 max-w-xs truncate">
                            {execution.error_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

