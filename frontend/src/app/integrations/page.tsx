'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { isAuthenticated } from '@/lib/auth'
import { useIntegrations } from '@/hooks/useIntegrations'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function IntegrationsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { data: integrations, isLoading } = useIntegrations()

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push('/auth/login')
    }
  }, [router])

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading integrations..." />
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
          <Button>Add Integration</Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Integrations</h1>

        {!integrations || integrations.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-600 mb-4">No integrations configured yet</p>
              <Button>Add Your First Integration</Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardBody className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Type: {integration.type}
                    </p>
                    <p className={`text-xs mt-2 ${integration.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                      {integration.is_active ? '✓ Active' : '○ Inactive'}
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

