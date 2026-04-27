export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Package } from 'lucide-react'
import { ExportSessionActions } from './session-actions'

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  destroy: { label: 'Xuất hủy',  color: 'bg-red-100 text-red-700' },
  sample:  { label: 'Xuất mẫu',  color: 'bg-blue-100 text-blue-700' },
  gift:    { label: 'Biếu tặng', color: 'bg-purple-100 text-purple-700' },
  other:   { label: 'Khác',      color: 'bg-gray-100 text-gray-600' },
}

export default async function ExportDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: movements } = await supabase
    .from('stock_movements')
    .select('*, branch:branches(name, code), product:products(name, code, unit)')
    .eq('session_id', sessionId)
    .in('type', ['destroy', 'sample', 'gift', 'other'])
    .order('created_at')

  if (!movements || movements.length === 0) notFound()

  const first = movements[0]
  const branch = (first as any).branch
  const cfg = TYPE_CONFIG[first.type] ?? TYPE_CONFIG.other
  const totalQty = movements.reduce((s, m) => s + m.quantity, 0)

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/exports" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">Chi tiết phiếu xuất</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(first.created_at), "HH:mm — dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
          <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Điểm xuất</p>
            <p className="font-semibold text-gray-900 text-sm">{branch?.name}</p>
            <p className="text-xs text-gray-400 font-mono">{branch?.code}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
          <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Thời gian</p>
            <p className="font-semibold text-gray-900 text-sm">
              {format(new Date(first.created_at), 'dd/MM/yyyy', { locale: vi })}
            </p>
            <p className="text-xs text-gray-400">{format(new Date(first.created_at), 'HH:mm')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
          <Package size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Tổng cộng</p>
            <p className="font-semibold text-red-600 text-sm">-{totalQty} đơn vị</p>
            <p className="text-xs text-gray-400">{movements.length} dòng sản phẩm</p>
          </div>
        </div>
      </div>

      <ExportSessionActions sessionId={sessionId} note={first.note} />

      {first.note && (
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
          <span className="font-medium text-gray-500">Ghi chú: </span>{first.note}
        </div>
      )}

      {/* Product table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Số lượng</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú dòng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {movements.map(m => {
              const product = (m as any).product
              return (
                <tr key={m.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{product?.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{product?.code}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-red-600">-{m.quantity}</span>
                    <span className="text-xs text-gray-400 ml-1">{product?.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{m.note ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
