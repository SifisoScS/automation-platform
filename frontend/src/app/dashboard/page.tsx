'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { getUser, isAuthenticated } from '@/lib/auth'
import { User } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    const currentUser = getUser()
    setUser(currentUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Automation Platform</h1>
          <div className="text-sm text-gray-600">
            Welcome, {user?.full_name}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Workflows
              </h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600 mt-2">Active workflows</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Executions
              </h3>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600 mt-2">Total executions</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Integrations
              </h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600 mt-2">Connected services</p>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Link href="/workflows/new">
              <Button className="w-full">Create New Workflow</Button>
            </Link>
            <Link href="/workflows">
              <Button variant="outline" className="w-full">
                View All Workflows
              </Button>
            </Link>
            <Link href="/executions">
              <Button variant="outline" className="w-full">
                View Execution History
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

