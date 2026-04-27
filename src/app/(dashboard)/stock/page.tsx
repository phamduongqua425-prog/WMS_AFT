export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'

export default async function StockPage() {
  const supabase = await createClient()

  const [{ data: branches }, { data: products }, { data: stockData }] = await Promise.all([
    supabase.from('branches').select('id, code, name, type').eq('is_active', true).order('type', { ascending: false }).order('name'),
    supabase.from('products').select('id, code, name, unit, min_stock').eq('is_active', true).eq('category', 'HH').order('code'),
    supabase.from('stock').select('branch_id, product_id, quantity'),
  ])

  // Build lookup: branch_id + product_id → quantity
  const stockMap: Record<string, number> = {}
  stockData?.forEach(s => {
    stockMap[`${s.branch_id}:${s.product_id}`] = s.quantity
  })

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Tồn kho toàn hệ thống</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time theo từng điểm bán</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 min-w-48 z-10">
                Sản phẩm
              </th>
              {branches?.map(b => (
                <th key={b.id} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-24">
                  <p className="truncate max-w-24" title={b.name}>
                    {b.code.replace('156-', '')}
                  </p>
                  <p className="font-normal text-gray-400 normal-case text-xs truncate max-w-24" title={b.name}>
                    {b.name.replace(/^(Kho VP|Kho Offline|Booth|PUP) - /, '')}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products?.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 sticky left-0 bg-white font-medium text-gray-900 border-r border-gray-100">
                  <p>{p.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{p.code}</p>
                </td>
                {branches?.map(b => {
                  const qty = stockMap[`${b.id}:${p.id}`] ?? 0
                  const isLow = qty > 0 && qty < p.min_stock
                  const isEmpty = qty === 0
                  return (
                    <td key={b.id} className="px-4 py-3 text-center">
                      <span className={`
                        text-sm font-semibold
                        ${isEmpty ? 'text-gray-300' : isLow ? 'text-red-600' : 'text-gray-900'}
                      `}>
                        {isEmpty ? '—' : qty}
                      </span>
                      {isLow && (
                        <p className="text-xs text-red-400 mt-0.5">thấp</p>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        🔴 Đỏ = tồn thấp hơn mức tối thiểu &nbsp;|&nbsp; — = chưa có hàng
      </p>
    </div>
  )
}
