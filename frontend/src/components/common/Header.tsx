'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { getUser, clearUser } from '@/lib/auth'
import { useState, useEffect } from 'react'

export const Header = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    clearUser()
    router.push('/auth/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
            Automation Platform
          </Link>

          {user && (
            <nav className="flex items-center gap-6">
              <Link
                href="/workflows"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Workflows
              </Link>
              <Link
                href="/executions"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Executions
              </Link>
              <Link
                href="/integrations"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Integrations
              </Link>

              <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                <span className="text-sm text-gray-600">{user.full_name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}

