import { createClient } from '@/lib/supabase/server'
import { StocktakeForm } from './stocktake-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewStocktakePage() {
  const supabase = await createClient()

  const [{ data: branches }, { data: products }, { data: stock }] = await Promise.all([
    supabase.from('branches').select('*').eq('is_active', true).order('type', { ascending: false }).order('name'),
    supabase.from('products').select('*').eq('is_active', true).order('name'),
    supabase.from('stock').select('branch_id, product_id, quantity'),
  ])

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/stocktakes" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tạo phiếu kiểm kê</h1>
          <p className="text-sm text-gray-500 mt-0.5">Đối chiếu tồn kho thực tế với hệ thống</p>
        </div>
      </div>

      <StocktakeForm
        branches={branches ?? []}
        products={products ?? []}
        allStock={stock ?? []}
      />
    </div>
  )
}
