import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Automation Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create, manage, and execute automated workflows without writing code
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

