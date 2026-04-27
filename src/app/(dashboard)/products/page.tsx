import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'

const CATEGORY_LABEL: Record<string, string> = {
  HH: 'Hàng hóa',
  CCDC: 'Công cụ dụng cụ',
  COMBO: 'Combo',
}

const CATEGORY_COLOR: Record<string, string> = {
  HH: 'bg-emerald-100 text-emerald-700',
  CCDC: 'bg-blue-100 text-blue-700',
  COMBO: 'bg-purple-100 text-purple-700',
}

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('category')
    .order('code')

  const byCategory = products?.reduce((acc: any, p) => {
    acc[p.category] = [...(acc[p.category] ?? []), p]
    return acc
  }, {}) ?? {}

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Danh mục sản phẩm</h1>
        <p className="text-sm text-gray-500 mt-0.5">{products?.length ?? 0} sản phẩm</p>
      </div>

      {Object.entries(byCategory).map(([cat, items]: any) => (
        <section key={cat}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {CATEGORY_LABEL[cat] ?? cat} ({items.length})
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Mã</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Đơn vị</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Tồn tối thiểu</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">HSD (ngày)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.unit}</td>
                    <td className="px-4 py-3 text-gray-500">{p.min_stock}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.shelf_life_days ? `${p.shelf_life_days} ngày` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? 'Đang bán' : 'Ngưng'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
