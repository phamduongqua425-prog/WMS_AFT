import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default async function StocktakesPage() {
  const supabase = await createClient()
  const { data: stocktakes } = await supabase
    .from('stocktakes')
    .select('*, branch:branches(name)')
    .order('date', { ascending: false })
    .limit(50)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Kiểm kê</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kiểm kê định kỳ từng điểm bán</p>
        </div>
        <a
          href="/stocktakes/new"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Tạo kiểm kê
        </a>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm bán</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nộp lúc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {stocktakes && stocktakes.length > 0 ? stocktakes.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {format(new Date(s.date), 'dd/MM/yyyy', { locale: vi })}
                </td>
                <td className="px-4 py-3 text-gray-700">{s.branch?.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {s.status === 'submitted' ? 'Đã nộp' : 'Nháp'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{s.note ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400">
                  {s.submitted_at ? format(new Date(s.submitted_at), 'dd/MM HH:mm', { locale: vi }) : '—'}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  Chưa có kiểm kê nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
