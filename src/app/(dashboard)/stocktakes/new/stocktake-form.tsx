'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createStocktake } from '../actions'
import { Loader2, AlertCircle, Save, CheckCircle2 } from 'lucide-react'
import type { Branch, Product } from '@/lib/supabase/types'

interface StockRow {
  product_id: string
  system_quantity: number
  actual_quantity: string
}

interface StockEntry {
  branch_id: string
  product_id: string
  quantity: number
}

export function StocktakeForm({
  branches,
  products,
  allStock,
}: {
  branches: Branch[]
  products: Product[]
  allStock: StockEntry[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingAction, setPendingAction] = useState<'draft' | 'submit' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [branchId, setBranchId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [rows, setRows] = useState<Record<string, string>>({})

  const activeBranches = branches.filter(b => b.is_active)
  const activeProducts = products.filter(p => p.is_active && p.category === 'HH')

  const branchStock = useMemo(() => {
    if (!branchId) return {}
    return Object.fromEntries(
      allStock.filter(s => s.branch_id === branchId).map(s => [s.product_id, s.quantity])
    )
  }, [branchId, allStock])

  function updateActual(product_id: string, value: string) {
    setRows(prev => ({ ...prev, [product_id]: value }))
  }

  function handleSubmit(submitFlag: boolean) {
    setError(null)
    if (!branchId) { setError('Vui lòng chọn điểm bán'); return }

    const items = activeProducts.map(p => ({
      product_id: p.id,
      system_quantity: branchStock[p.id] ?? 0,
      actual_quantity: Number(rows[p.id] ?? branchStock[p.id] ?? 0),
    }))

    const fd = new FormData()
    fd.append('branch_id', branchId)
    fd.append('date', date)
    fd.append('note', note)
    fd.append('submit', submitFlag ? '1' : '0')
    fd.append('items', JSON.stringify(items))

    setPendingAction(submitFlag ? 'submit' : 'draft')
    startTransition(async () => {
      try { await createStocktake(fd) } catch (err: any) { setError(err.message ?? 'Có lỗi xảy ra') }
      finally { setPendingAction(null) }
    })
  }

  const totalDiff = activeProducts.reduce((sum, p) => {
    const actual = Number(rows[p.id] ?? branchStock[p.id] ?? 0)
    const system = branchStock[p.id] ?? 0
    return sum + (actual - system)
  }, 0)

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Thông tin */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Thông tin kiểm kê</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Điểm bán <span className="text-red-500">*</span></label>
            <select
              value={branchId}
              onChange={e => { setBranchId(e.target.value); setRows({}) }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Chọn điểm bán / kho --</option>
              <optgroup label="Kho trung tâm">
                {activeBranches.filter(b => b.type === 'warehouse').map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </optgroup>
              <optgroup label="Điểm bán">
                {activeBranches.filter(b => b.type === 'store').map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Ngày kiểm kê <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Ghi chú</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="VD: Kiểm kê cuối tháng..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Kiểm kê tồn kho</h2>
          {branchId && (
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              totalDiff === 0 ? 'bg-gray-100 text-gray-500' :
              totalDiff > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              Chênh lệch tổng: {totalDiff > 0 ? '+' : ''}{totalDiff}
            </span>
          )}
        </div>

        {!branchId ? (
          <p className="text-sm text-gray-400 text-center py-8">Chọn điểm bán để bắt đầu kiểm kê</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="text-right pb-2 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Tồn hệ thống</th>
                  <th className="text-left pb-2 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Tồn thực tế</th>
                  <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Chênh lệch</th>
                </tr>
              </thead>
              <tbody>
                {activeProducts.map(p => {
                  const system = branchStock[p.id] ?? 0
                  const actual = Number(rows[p.id] ?? system)
                  const diff = actual - system
                  return (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 pr-3">
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.code}</p>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <span className="font-semibold text-gray-600">{system}</span>
                        <span className="text-gray-400 ml-1 text-xs">{p.unit}</span>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={rows[p.id] ?? system}
                            onChange={e => updateActual(p.id, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="text-xs text-gray-400 shrink-0">{p.unit}</span>
                        </div>
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {diff === 0 ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          <span className={diff > 0 ? 'text-emerald-600' : 'text-red-600'}>
                            {diff > 0 ? '+' : ''}{diff}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={isPending || !branchId}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {isPending && pendingAction === 'draft' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Lưu nháp
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={isPending || !branchId}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
        >
          {isPending && pendingAction === 'submit' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          Nộp kiểm kê
        </button>
      </div>
    </div>
  )
}
