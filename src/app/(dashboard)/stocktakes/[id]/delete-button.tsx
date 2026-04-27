'use client'

import { useState, useTransition } from 'react'
import { deleteStocktake } from '../actions'
import { Trash2 } from 'lucide-react'

export function DeleteStocktakeButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteStocktake(id)
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Xác nhận xóa phiếu kiểm kê này?</span>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? 'Đang xóa...' : 'Xóa'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-gray-600 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Hủy
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
    >
      <Trash2 size={13} /> Xóa phiếu
    </button>
  )
}
