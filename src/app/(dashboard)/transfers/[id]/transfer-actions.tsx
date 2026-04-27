'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { confirmTransferOut, confirmTransferIn, cancelTransfer } from '../actions'
import { Loader2, AlertCircle, CheckCircle2, PackageCheck, X } from 'lucide-react'

export function TransferActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState<string | null>(null)

  function handle(fn: () => Promise<void>, label: string) {
    setError(null)
    setAction(label)
    startTransition(async () => {
      try {
        await fn()
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Có lỗi xảy ra')
      } finally {
        setAction(null)
      }
    })
  }

  if (status === 'done' || status === 'cancelled') return null

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <div className="flex items-center gap-3 justify-end">
        {status === 'pending' && (
          <>
            <button
              onClick={() => handle(() => cancelTransfer(orderId), 'cancel')}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {isPending && action === 'cancel' && <Loader2 size={14} className="animate-spin" />}
              <X size={14} />
              Hủy phiếu
            </button>
            <button
              onClick={() => handle(() => confirmTransferOut(orderId), 'out')}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {isPending && action === 'out' ? <Loader2 size={14} className="animate-spin" /> : <PackageCheck size={14} />}
              Xác nhận xuất kho
            </button>
          </>
        )}

        {status === 'confirmed_out' && (
          <button
            onClick={() => handle(() => confirmTransferIn(orderId), 'in')}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
          >
            {isPending && action === 'in' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Xác nhận nhận hàng
          </button>
        )}
      </div>
    </div>
  )
}
