'use client'

import { useTransition } from 'react'
import { toggleProductActive } from './actions'

export function ToggleProductButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => toggleProductActive(id, isActive))}
      disabled={pending}
      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700'
          : 'bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-700'
      }`}
      title={isActive ? 'Nhấn để ngưng' : 'Nhấn để kích hoạt'}
    >
      {pending ? '...' : isActive ? 'Đang bán' : 'Ngưng'}
    </button>
  )
}
