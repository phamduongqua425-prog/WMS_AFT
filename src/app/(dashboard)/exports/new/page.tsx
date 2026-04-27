import { createClient } from '@/lib/supabase/server'
import { ExportForm } from './export-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewExportPage() {
  const supabase = await createClient()

  const [{ data: branches }, { data: products }] = await Promise.all([
    supabase.from('branches').select('*').eq('is_active', true).order('type', { ascending: false }).order('name'),
    supabase.from('products').select('*').eq('is_active', true).order('name'),
  ])

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/exports" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tạo phiếu xuất</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xuất hủy, xuất mẫu, biếu tặng...</p>
        </div>
      </div>

      <ExportForm branches={branches ?? []} products={products ?? []} />
    </div>
  )
}
