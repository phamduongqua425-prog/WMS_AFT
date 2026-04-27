export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { TransferActions } from './transfer-actions'

const STATUS_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  pending:       { label: 'Chờ xử lý',    color: 'bg-amber-100 text-amber-700',    description: 'Phiếu mới tạo, chờ xác nhận xuất kho' },
  confirmed_out: { label: 'Đã xuất kho',  color: 'bg-blue-100 text-blue-700',      description: 'Hàng đã xuất, chờ điểm nhận xác nhận' },
  done:          { label: 'Hoàn thành',   color: 'bg-emerald-100 text-emerald-700', description: 'Điểm nhận đã xác nhận nhận hàng' },
  cancelled:     { label: 'Đã hủy',       color: 'bg-gray-100 text-gray-500',      description: 'Phiếu đã bị hủy' },
}

export default async function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('transfer_orders')
    .select(`
      *,
      from_branch:branches!from_branch_id(name, code),
      to_branch:branches!to_branch_id(name, code),
      items:transfer_order_items(*, product:products(name, unit, category))
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/transfers" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900 font-mono">{order.code ?? '—'}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{cfg.description}</p>
        </div>
      </div>

      {/* Thông tin phiếu */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Thông tin phiếu</h2>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Điểm xuất</p>
            <p className="font-semibold text-gray-800">{(order as any).from_branch?.name}</p>
            <p className="text-xs text-gray-400">{(order as any).from_branch?.code}</p>
          </div>
          <ArrowRight size={20} className="text-gray-300 shrink-0" />
          <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Điểm nhận</p>
            <p className="font-semibold text-gray-800">{(order as any).to_branch?.name}</p>
            <p className="text-xs text-gray-400">{(order as any).to_branch?.code}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Ngày tạo</p>
            <p className="text-gray-800">{format(new Date(order.requested_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
          </div>
          {order.confirmed_out_at && (
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Xuất kho lúc</p>
              <p className="text-gray-800">{format(new Date(order.confirmed_out_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
            </div>
          )}
          {order.confirmed_in_at && (
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Nhận hàng lúc</p>
              <p className="text-gray-800">{format(new Date(order.confirmed_in_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
            </div>
          )}
          {order.note && (
            <div className="col-span-2">
              <p className="text-gray-400 text-xs mb-0.5">Ghi chú</p>
              <p className="text-gray-800">{order.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Sản phẩm điều chuyển</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sản phẩm</th>
              <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-32">HSD</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {(order as any).items?.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0">
                <td className="py-3">
                  <p className="font-medium text-gray-800">{item.product?.name}</p>
                </td>
                <td className="py-3">
                  {item.expiry_date ? (
                    <span className="text-sm text-gray-700">
                      {format(new Date(item.expiry_date), 'dd/MM/yyyy')}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-300">—</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <span className="font-semibold text-gray-800">{item.quantity}</span>
                  <span className="text-gray-400 ml-1">{item.product?.unit}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <TransferActions orderId={id} status={order.status} />
    </div>
  )
}
