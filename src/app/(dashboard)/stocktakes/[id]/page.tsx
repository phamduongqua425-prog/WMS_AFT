export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { DeleteStocktakeButton } from './delete-button'

export default async function StocktakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: stocktake } = await supabase
    .from('stocktakes')
    .select(`
      *,
      branch:branches(name, code),
      items:stocktake_items(*, product:products(name, code, unit))
    `)
    .eq('id', id)
    .single()

  if (!stocktake) notFound()

  const items = (stocktake as any).items ?? []
  const discrepancies = items.filter((i: any) => i.actual_quantity !== i.system_quantity)
  const totalDiff = items.reduce((sum: number, i: any) => sum + (i.actual_quantity - i.system_quantity), 0)

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/stocktakes" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">Kiểm kê — {(stocktake as any).branch?.name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
              stocktake.status === 'submitted'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {stocktake.status === 'submitted'
                ? <><CheckCircle2 size={12} /> Đã nộp</>
                : <><Clock size={12} /> Nháp</>
              }
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Ngày {format(new Date(stocktake.date), 'dd/MM/yyyy', { locale: vi })}
            {stocktake.submitted_at && ` · Nộp lúc ${format(new Date(stocktake.submitted_at), 'HH:mm dd/MM/yyyy', { locale: vi })}`}
          </p>
        </div>
        <DeleteStocktakeButton id={stocktake.id} />
      </div>

      {/* Tóm tắt */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Sản phẩm</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{discrepancies.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Sản phẩm chênh</p>
        </div>
        <div className={`bg-white rounded-xl border p-4 text-center ${
          totalDiff === 0 ? 'border-gray-200' : totalDiff > 0 ? 'border-emerald-200' : 'border-red-200'
        }`}>
          <p className={`text-2xl font-bold ${
            totalDiff === 0 ? 'text-gray-400' : totalDiff > 0 ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {totalDiff > 0 ? '+' : ''}{totalDiff}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Chênh lệch tổng</p>
        </div>
      </div>

      {stocktake.note && (
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
          <span className="font-medium text-gray-500">Ghi chú: </span>{stocktake.note}
        </div>
      )}

      {/* Bảng chi tiết */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Chi tiết kiểm kê</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sản phẩm</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">Hệ thống</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">Thực tế</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">Chênh</th>
            </tr>
          </thead>
          <tbody>
            {items
              .sort((a: any, b: any) => Math.abs(b.actual_quantity - b.system_quantity) - Math.abs(a.actual_quantity - a.system_quantity))
              .map((item: any) => {
                const diff = item.actual_quantity - item.system_quantity
                return (
                  <tr key={item.id} className={`border-b border-gray-50 last:border-0 ${diff !== 0 ? 'bg-amber-50/30' : ''}`}>
                    <td className="py-2.5">
                      <p className="font-medium text-gray-800">{item.product?.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{item.product?.code}</p>
                    </td>
                    <td className="py-2.5 text-right text-gray-500">
                      {item.system_quantity} <span className="text-xs">{item.product?.unit}</span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-gray-800">
                      {item.actual_quantity} <span className="text-xs font-normal text-gray-400">{item.product?.unit}</span>
                    </td>
                    <td className="py-2.5 text-right font-semibold">
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
    </div>
  )
}
