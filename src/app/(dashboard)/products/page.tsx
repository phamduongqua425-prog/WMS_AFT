export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { AddProductButton, EditProductButton } from './product-form'
import { ToggleProductButton } from './toggle-active-button'

const CATEGORY_LABEL: Record<string, string> = {
  HH: 'Hàng hóa',
  CCDC: 'Công cụ dụng cụ',
  COMBO: 'Combo',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Danh mục sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products?.length ?? 0} sản phẩm</p>
        </div>
        <AddProductButton />
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Tồn tối thiểu</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">HSD (ngày)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Trạng thái</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((p: any) => (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.unit}</td>
                    <td className="px-4 py-3 text-gray-500">{p.min_stock ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.shelf_life_days ? `${p.shelf_life_days} ngày` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ToggleProductButton id={p.id} isActive={p.is_active} />
                    </td>
                    <td className="px-4 py-3">
                      <EditProductButton product={p} />
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
