import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ArrowRight } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:       { label: 'Chờ xử lý',    color: 'bg-amber-100 text-amber-700' },
  confirmed_out: { label: 'Đã xuất kho',  color: 'bg-blue-100 text-blue-700' },
  confirmed_in:  { label: 'Đã nhận hàng', color: 'bg-purple-100 text-purple-700' },
  done:          { label: 'Hoàn thành',   color: 'bg-emerald-100 text-emerald-700' },
  cancelled:     { label: 'Đã hủy',       color: 'bg-gray-100 text-gray-500' },
}

export default async function TransfersPage() {
  const supabase = await createClient()
  const { data: transfers } = await supabase
    .from('transfer_orders')
    .select(`
      *,
      from_branch:branches!from_branch_id(name, code),
      to_branch:branches!to_branch_id(name, code),
      items:transfer_order_items(*, product:products(name, unit))
    `)
    .order('requested_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Phiếu điều chuyển</h1>
          <p className="text-sm text-gray-500 mt-0.5">{transfers?.length ?? 0} phiếu gần đây</p>
        </div>
        <a
          href="/transfers/new"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Tạo phiếu
        </a>
      </div>

      <div className="space-y-3">
        {transfers && transfers.length > 0 ? transfers.map((t: any) => {
          const cfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.pending
          return (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-gray-700">{t.code ?? '—'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="font-medium">{t.from_branch?.name}</span>
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className="font-medium">{t.to_branch?.name}</span>
                  </div>

                  {t.items && t.items.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.items.map((item: any) => (
                        <span key={item.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {item.product?.name}: <strong>{item.quantity}</strong> {item.product?.unit}
                        </span>
                      ))}
                    </div>
                  )}

                  {t.note && (
                    <p className="mt-2 text-sm text-gray-400">{t.note}</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">
                    {format(new Date(t.requested_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </p>
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p className="text-gray-400">Chưa có phiếu điều chuyển nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
