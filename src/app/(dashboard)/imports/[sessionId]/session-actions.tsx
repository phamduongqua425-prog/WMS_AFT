'use client'

import { useState, useTransition } from 'react'
import { deleteImportSession } from '../actions'
import { Trash2, Pencil } from 'lucide-react'
import Link from 'next/link'

export function ImportSessionActions({ sessionId }: { sessionId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteImportSession(sessionId)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/imports/${sessionId}/edit`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Pencil size={13} /> Sửa phiếu
      </Link>

      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-600">Xóa phiếu và hoàn tồn kho?</span>
          <button onClick={handleDelete} disabled={pending} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50">
            {pending ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
          <button onClick={() => setConfirming(false)} className="px-3 py-1.5 text-gray-600 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
            Hủy
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Trash2 size={13} /> Xóa phiếu
        </button>
      )}
    </div>
  )
}
