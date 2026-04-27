export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Package, AlertTriangle, ArrowLeftRight, Store } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: branches },
    { data: products },
    { data: lowStock },
    { data: pendingTransfers },
    { data: expiringItems },
  ] = await Promise.all([
    supabase.from('branches').select('*').eq('is_active', true),
    supabase.from('products').select('*').eq('is_active', true),
    supabase.from('stock').select('*, product:products(*), branch:branches(*)').filter('quantity', 'lt', 20),
    supabase.from('transfer_orders').select('*, from_branch:branches!from_branch_id(name), to_branch:branches!to_branch_id(name)').eq('status', 'pending').order('requested_at', { ascending: false }).limit(5),
    supabase.from('stock_movements').select('*, product:products(name, unit), branch:branches(name)').not('expiry_date', 'is', null).gte('expiry_date', new Date().toISOString().split('T')[0]).lte('expiry_date', new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]).order('expiry_date').limit(10),
  ])

  const stats = [
    { label: 'Điểm bán hoạt động', value: branches?.filter(b => b.type === 'store').length ?? 0, icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Sản phẩm', value: products?.length ?? 0, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tồn thấp cần bổ sung', value: lowStock?.length ?? 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Phiếu chuyển đang chờ', value: pendingTransfers?.length ?? 0, icon: ArrowLeftRight, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Tổng quan</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {format(new Date(), "EEEE, dd/MM/yyyy", { locale: vi })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Tồn thấp */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Tồn thấp cần bổ sung
          </h2>
          {lowStock && lowStock.length > 0 ? (
            <div className="space-y-2">
              {lowStock.map((s: any) => (
                <div key={`${s.branch_id}-${s.product_id}`} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.product?.name}</p>
                    <p className="text-xs text-gray-400">{s.branch?.name}</p>
                  </div>
                  <span className={`text-sm font-semibold ${s.quantity <= 5 ? 'text-red-600' : 'text-amber-600'}`}>
                    {s.quantity} {s.product?.unit}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Tất cả điểm bán đủ hàng</p>
          )}
        </div>

        {/* Phiếu chuyển đang chờ */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-purple-500" />
            Phiếu điều chuyển đang chờ
          </h2>
          {pendingTransfers && pendingTransfers.length > 0 ? (
            <div className="space-y-2">
              {pendingTransfers.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.code}</p>
                    <p className="text-xs text-gray-400">
                      {t.from_branch?.name} → {t.to_branch?.name}
                    </p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    Chờ xử lý
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Không có phiếu chờ</p>
          )}
        </div>

        {/* Cận HSD */}
        {expiringItems && expiringItems.length > 0 && (
          <div className="bg-white rounded-xl border border-red-100 p-5 xl:col-span-2">
            <h2 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Cảnh báo cận hạn sử dụng (trong 3 ngày)
            </h2>
            <div className="space-y-2">
              {expiringItems.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-red-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.product?.name}</p>
                    <p className="text-xs text-gray-400">{m.branch?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">
                      HSD: {m.expiry_date ? format(new Date(m.expiry_date), 'dd/MM/yyyy') : '-'}
                    </p>
                    <p className="text-xs text-gray-400">{m.quantity} {m.product?.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
