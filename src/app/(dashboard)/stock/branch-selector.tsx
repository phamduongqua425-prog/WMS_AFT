'use client'

import { useRouter } from 'next/navigation'

export function BranchSelector({
  branches,
  selectedId,
}: {
  branches: { id: string; name: string; code: string; type: string }[]
  selectedId?: string
}) {
  const router = useRouter()

  function select(id: string | null) {
    router.push(id ? `/stock?branch=${id}` : '/stock')
  }

  const warehouses = branches.filter(b => b.type === 'warehouse')
  const stores = branches.filter(b => b.type === 'store')

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => select(null)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          !selectedId
            ? 'bg-gray-900 text-white'
            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
        }`}
      >
        Tất cả
      </button>

      {warehouses.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-300">|</span>
          {warehouses.map(b => (
            <button
              key={b.id}
              onClick={() => select(b.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedId === b.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {b.name.replace(/^(Kho VP|Kho Offline|Booth|PUP) - /, '')}
            </button>
          ))}
        </div>
      )}

      <div className="w-full flex flex-wrap gap-1.5">
        {stores.map(b => (
          <button
            key={b.id}
            onClick={() => select(b.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedId === b.id
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-200 hover:text-emerald-700'
            }`}
          >
            {b.name.replace(/^(Kho VP|Kho Offline|Booth|PUP) - /, '')}
          </button>
        ))}
      </div>
    </div>
  )
}
