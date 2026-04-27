'use client'

import { useTransition } from 'react'
import { toggleBranchActive } from './actions'

export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => toggleBranchActive(id, isActive))}
      disabled={pending}
      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700'
          : 'bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-700'
      }`}
      title={isActive ? 'Nhấn để ngưng hoạt động' : 'Nhấn để kích hoạt lại'}
    >
      {pending ? '...' : isActive ? 'Hoạt động' : 'Ngưng'}
    </button>
  )
}
