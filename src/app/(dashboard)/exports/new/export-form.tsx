'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createExport } from '../actions'
import { Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import type { Branch, Product } from '@/lib/supabase/types'

interface LineItem {
  id: number
  product_id: string
  quantity: string
  note: string
}

const TYPE_OPTIONS = [
  { value: 'destroy', label: 'Xuất hủy', desc: 'Hàng hết HSD, hỏng, không dùng được' },
  { value: 'sample',  label: 'Xuất mẫu', desc: 'Mẫu thử, demo cho khách' },
  { value: 'gift',    label: 'Biếu tặng', desc: 'Tặng đối tác, nhân viên' },
  { value: 'other',   label: 'Khác',      desc: 'Các trường hợp xuất khác' },
]

let lineId = 0

export function ExportForm({ branches, products }: { branches: Branch[]; products: Product[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [branchId, setBranchId] = useState('')
  const [type, setType] = useState('destroy')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<LineItem[]>([
    { id: ++lineId, product_id: '', quantity: '', note: '' },
  ])

  const activeBranches = branches.filter(b => b.is_active)
  const activeProducts = products.filter(p => p.is_active && p.category === 'HH')

  function addRow() {
    setItems(p => [...p, { id: ++lineId, product_id: '', quantity: '', note: '' }])
  }
  function removeRow(id: number) {
    setItems(p => p.filter(r => r.id !== id))
  }
  function updateRow(id: number, field: keyof LineItem, value: string) {
    setItems(p => p.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!branchId) { setError('Vui lòng chọn điểm bán'); return }

    const validItems = items.filter(i => i.product_id && Number(i.quantity) > 0)
    if (validItems.length === 0) { setError('Vui lòng thêm ít nhất 1 sản phẩm với số lượng hợp lệ'); return }

    const fd = new FormData()
    fd.append('branch_id', branchId)
    fd.append('type', type)
    fd.append('note', note)
    fd.append('items', JSON.stringify(validItems.map(i => ({
      product_id: i.product_id,
      quantity: Number(i.quantity),
      note: i.note,
    }))))

    startTransition(async () => {
      try { await createExport(fd) } catch (err: any) { setError(err.message ?? 'Có lỗi xảy ra') }
    })
  }

  const selectedType = TYPE_OPTIONS.find(t => t.value === type)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Thông tin phiếu */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Thông tin phiếu xuất</h2>

        {/* Loại xuất */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Loại xuất <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`text-left p-3 rounded-lg border text-sm transition-all ${
                  type === opt.value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <p className="font-medium">{opt.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Điểm bán */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Điểm bán <span className="text-red-500">*</span></label>
            <select
              value={branchId}
              onChange={e => setBranchId(e.target.value)}
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

          {/* Ghi chú chung */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Ghi chú chung</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={type === 'destroy' ? 'VD: Hàng mốc, hết HSD...' : type === 'sample' ? 'VD: Mẫu cho khách tham quan...' : 'Lý do xuất...'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Sản phẩm */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Sản phẩm xuất</h2>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium hover:text-emerald-800"
          >
            <Plus size={16} /> Thêm dòng
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm *</th>
                <th className="text-left pb-2 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Số lượng *</th>
                <th className="text-left pb-2 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú dòng</th>
                <th className="pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const product = activeProducts.find(p => p.id === item.product_id)
                return (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3">
                      <select
                        value={item.product_id}
                        onChange={e => updateRow(item.id, 'product_id', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">-- Chọn sản phẩm --</option>
                        {activeProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateRow(item.id, 'quantity', e.target.value)}
                          placeholder="0"
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {product && <span className="text-xs text-gray-400 shrink-0">{product.unit}</span>}
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={item.note}
                        onChange={e => updateRow(item.id, 'note', e.target.value)}
                        placeholder="Lý do cụ thể..."
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-2">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
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
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isPending ? 'Đang lưu...' : `Xác nhận ${selectedType?.label ?? 'xuất'}`}
        </button>
      </div>
    </form>
  )
}
