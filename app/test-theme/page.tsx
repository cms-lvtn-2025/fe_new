'use client'

import { useTheme } from '@/lib/contexts/theme-context'
import { Button } from '@/components/common'

export default function TestThemePage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Dark Mode Test
        </h1>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <p className="text-gray-800 dark:text-gray-200 mb-2">
            Current theme: <strong>{theme}</strong>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            HTML class: <strong>{typeof document !== 'undefined' ? document.documentElement.className : 'N/A'}</strong>
          </p>
        </div>

        <Button onClick={toggleTheme} size="lg">
          Toggle to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </Button>

        <div className="mt-8 space-y-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
            <p className="text-blue-900 dark:text-blue-100">Blue background test</p>
          </div>
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
            <p className="text-green-900 dark:text-green-100">Green background test</p>
          </div>
          <div className="p-4 bg-red-100 dark:bg-red-900 rounded">
            <p className="text-red-900 dark:text-red-100">Red background test</p>
          </div>
        </div>
      </div>
    </div>
  )
}
