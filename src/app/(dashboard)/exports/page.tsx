import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  destroy:  { label: 'Xuất hủy',   color: 'bg-red-100 text-red-700' },
  sample:   { label: 'Xuất mẫu',   color: 'bg-blue-100 text-blue-700' },
  gift:     { label: 'Biếu tặng',  color: 'bg-purple-100 text-purple-700' },
  sold:     { label: 'Xuất bán',   color: 'bg-emerald-100 text-emerald-700' },
  other:    { label: 'Khác',       color: 'bg-gray-100 text-gray-600' },
}

export default async function ExportsPage() {
  const supabase = await createClient()
  const { data: movements } = await supabase
    .from('stock_movements')
    .select('*, branch:branches(name), product:products(name, unit, code)')
    .in('type', ['destroy', 'sample', 'gift', 'other'])
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Xuất khác</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hủy, mẫu, biếu tặng...</p>
        </div>
        <a
          href="/exports/new"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Tạo phiếu xuất
        </a>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm bán</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số lượng</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {movements && movements.length > 0 ? movements.map((m: any) => {
              const cfg = TYPE_CONFIG[m.type] ?? TYPE_CONFIG.other
              return (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {format(new Date(m.created_at), 'dd/MM/yyyy', { locale: vi })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{m.branch?.name}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{m.product?.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{m.product?.code}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">
                    -{m.quantity} {m.product?.unit}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{m.note ?? '—'}</td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
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
