export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { AlertTriangle, Package, Store, Warehouse } from 'lucide-react'
import { BranchSelector } from './branch-selector'

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>
}) {
  const { branch: selectedBranchId } = await searchParams
  const supabase = await createClient()

  const [{ data: branches }, { data: products }, { data: stockData }] = await Promise.all([
    supabase.from('branches').select('id, code, name, type').eq('is_active', true).order('type', { ascending: false }).order('name'),
    supabase.from('products').select('id, code, name, unit, min_stock, category').eq('is_active', true).eq('category', 'HH').order('name'),
    supabase.from('stock').select('branch_id, product_id, quantity'),
  ])

  const stockMap: Record<string, number> = {}
  stockData?.forEach(s => { stockMap[`${s.branch_id}:${s.product_id}`] = s.quantity })

  const selectedBranch = branches?.find(b => b.id === selectedBranchId)

  // Tính stats cho mỗi branch (dùng cho overview cards)
  const branchStats = branches?.map(b => {
    const items = products?.map(p => ({
      product: p,
      qty: stockMap[`${b.id}:${p.id}`] ?? 0,
    })) ?? []
    const withStock = items.filter(i => i.qty > 0).length
    const lowStock = items.filter(i => i.qty > 0 && i.qty < (i.product.min_stock ?? 0)).length
    const negative = items.filter(i => i.qty < 0).length
    return { branch: b, withStock, lowStock, negative, total: items.length }
  }) ?? []

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tồn kho</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {selectedBranch ? selectedBranch.name : `${branches?.length ?? 0} điểm bán & kho`}
          </p>
        </div>
      </div>

      {/* Branch selector tabs */}
      <BranchSelector branches={branches ?? []} selectedId={selectedBranchId} />

      {/* OVERVIEW — no branch selected */}
      {!selectedBranchId && (
        <div className="space-y-4">
          {/* Warehouses */}
          {branchStats.filter(s => s.branch.type === 'warehouse').length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Warehouse size={12} /> Kho trung tâm
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {branchStats.filter(s => s.branch.type === 'warehouse').map(s => (
                  <BranchCard key={s.branch.id} stats={s} />
                ))}
              </div>
            </section>
          )}

          {/* Stores */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Store size={12} /> Điểm bán
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {branchStats.filter(s => s.branch.type === 'store').map(s => (
                <BranchCard key={s.branch.id} stats={s} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* DETAIL — branch selected */}
      {selectedBranch && products && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Tồn tối thiểu</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Tồn hiện tại</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products
                .map(p => ({ p, qty: stockMap[`${selectedBranch.id}:${p.id}`] ?? 0 }))
                .sort((a, b) => {
                  // Sort: negative first, then low stock, then zero, then ok
                  const rank = (x: typeof a) => x.qty < 0 ? 0 : x.qty === 0 ? 2 : x.qty < (x.p.min_stock ?? 0) ? 1 : 3
                  return rank(a) - rank(b)
                })
                .map(({ p, qty }) => {
                  const isNegative = qty < 0
                  const isLow = qty > 0 && qty < (p.min_stock ?? 0)
                  const isEmpty = qty === 0
                  return (
                    <tr key={p.id} className={`transition-colors ${isNegative ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.code}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">{p.min_stock ?? 0} {p.unit}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${isNegative ? 'text-red-600' : isLow ? 'text-amber-600' : isEmpty ? 'text-gray-300' : 'text-gray-900'}`}>
                          {isEmpty ? '—' : qty}
                        </span>
                        {!isEmpty && <span className="text-gray-400 ml-1 text-xs">{p.unit}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {isNegative && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Âm kho</span>}
                        {isLow && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Tồn thấp</span>}
                        {isEmpty && <span className="text-xs text-gray-300">Chưa có</span>}
                        {!isNegative && !isLow && !isEmpty && <span className="text-xs text-emerald-600">✓ Đủ hàng</span>}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function BranchCard({ stats }: { stats: any }) {
  const { branch, withStock, lowStock, negative, total } = stats
  const hasIssue = negative > 0 || lowStock > 0
  const borderColor = negative > 0 ? 'border-red-200' : lowStock > 0 ? 'border-amber-200' : 'border-gray-100'

  return (
    <a href={`/stock?branch=${branch.id}`}
      className={`block bg-white rounded-xl border p-4 hover:shadow-sm transition-all ${borderColor}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{branch.name}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{branch.code}</p>
        </div>
        {hasIssue && <AlertTriangle size={16} className={negative > 0 ? 'text-red-500 shrink-0' : 'text-amber-500 shrink-0'} />}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg py-2">
          <p className="text-lg font-bold text-gray-800">{withStock}</p>
          <p className="text-xs text-gray-400">Có hàng</p>
        </div>
        <div className={`rounded-lg py-2 ${lowStock > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
          <p className={`text-lg font-bold ${lowStock > 0 ? 'text-amber-600' : 'text-gray-300'}`}>{lowStock}</p>
          <p className="text-xs text-gray-400">Tồn thấp</p>
        </div>
        <div className={`rounded-lg py-2 ${negative > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
          <p className={`text-lg font-bold ${negative > 0 ? 'text-red-600' : 'text-gray-300'}`}>{negative}</p>
          <p className="text-xs text-gray-400">Âm kho</p>
        </div>
      </div>
    </a>
  )
}
