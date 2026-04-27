export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  destroy: { label: 'Xuất hủy',  color: 'bg-red-100 text-red-700' },
  sample:  { label: 'Xuất mẫu',  color: 'bg-blue-100 text-blue-700' },
  gift:    { label: 'Biếu tặng', color: 'bg-purple-100 text-purple-700' },
  other:   { label: 'Khác',      color: 'bg-gray-100 text-gray-600' },
}

export default async function ExportsPage() {
  const supabase = await createClient()
  const { data: movements } = await supabase
    .from('stock_movements')
    .select('*, branch:branches(name, code), product:products(name, unit, code)')
    .in('type', ['destroy', 'sample', 'gift', 'other'])
    .order('created_at', { ascending: false })
    .limit(500)

  // Group by session_id
  const sessionMap = new Map<string, typeof movements>()
  movements?.forEach(m => {
    const key = (m as any).session_id ?? m.id
    if (!sessionMap.has(key)) sessionMap.set(key, [])
    sessionMap.get(key)!.push(m)
  })

  const sessions = Array.from(sessionMap.entries())
    .map(([sessionId, items]) => ({
      sessionId,
      branch: (items[0] as any).branch,
      type: items[0].type,
      note: items[0].note,
      createdAt: items[0].created_at,
      totalQty: items.reduce((s, i) => s + i.quantity, 0),
      productCount: items.length,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Xuất khác</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sessions.length} phiếu xuất</p>
        </div>
        <Link
          href="/exports/new"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Tạo phiếu xuất
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm xuất</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Số dòng</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Tổng SL</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sessions.length > 0 ? sessions.map(s => {
              const cfg = TYPE_CONFIG[s.type] ?? TYPE_CONFIG.other
              return (
                <tr key={s.sessionId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    <p>{format(new Date(s.createdAt), 'dd/MM/yyyy', { locale: vi })}</p>
                    <p className="text-xs text-gray-400">{format(new Date(s.createdAt), 'HH:mm')}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{s.branch?.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.branch?.code}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{s.note ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{s.productCount}</td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">-{s.totalQty}</td>
                  <td className="px-4 py-3">
                    <Link href={`/exports/${s.sessionId}`} className="text-gray-300 hover:text-emerald-600 transition-colors">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  Chưa có phiếu xuất nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
