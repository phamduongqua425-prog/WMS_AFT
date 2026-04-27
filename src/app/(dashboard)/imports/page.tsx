export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronRight, Package } from 'lucide-react'

export default async function ImportsPage() {
  const supabase = await createClient()

  // Fetch movements grouped — we group by session_id in JS
  const { data: movements } = await supabase
    .from('stock_movements')
    .select('*, branch:branches(name, code), product:products(name, unit, code)')
    .eq('type', 'import')
    .order('created_at', { ascending: false })
    .limit(500)

  // Group by session_id (or fallback to id if null)
  const sessionMap = new Map<string, typeof movements>()
  movements?.forEach(m => {
    const key = (m as any).session_id ?? m.id
    if (!sessionMap.has(key)) sessionMap.set(key, [])
    sessionMap.get(key)!.push(m)
  })

  // Sort sessions by most recent created_at
  const sessions = Array.from(sessionMap.entries())
    .map(([sessionId, items]) => ({
      sessionId,
      branch: (items[0] as any).branch,
      note: items[0].note,
      createdAt: items[0].created_at,
      totalQty: items.reduce((s, i) => s + i.quantity, 0),
      productCount: items.length,
      hasSession: !!(items[0] as any).session_id,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Nhập kho</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sessions.length} phiếu nhập</p>
        </div>
        <Link
          href="/imports/new"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Nhập hàng
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kho / Điểm nhập</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Số dòng</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Tổng SL</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sessions.length > 0 ? sessions.map(s => (
              <tr key={s.sessionId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  <p>{format(new Date(s.createdAt), 'dd/MM/yyyy', { locale: vi })}</p>
                  <p className="text-xs text-gray-400">{format(new Date(s.createdAt), 'HH:mm')}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{s.branch?.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{s.branch?.code}</p>
                </td>
                <td className="px-4 py-3 text-gray-400">{s.note ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-gray-600">
                    <Package size={13} className="text-gray-400" />
                    {s.productCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-700">+{s.totalQty}</td>
                <td className="px-4 py-3">
                  {s.hasSession ? (
                    <Link href={`/imports/${s.sessionId}`} className="text-gray-300 hover:text-emerald-600 transition-colors">
                      <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <span className="text-gray-200"><ChevronRight size={16} /></span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  Chưa có phiếu nhập nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
