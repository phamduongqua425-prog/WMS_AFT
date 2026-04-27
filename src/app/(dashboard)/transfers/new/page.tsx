import { createClient } from '@/lib/supabase/server'
import { TransferForm } from './transfer-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewTransferPage() {
  const supabase = await createClient()

  const [{ data: branches }, { data: products }] = await Promise.all([
    supabase.from('branches').select('*').eq('is_active', true).order('type', { ascending: false }).order('name'),
    supabase.from('products').select('*').eq('is_active', true).order('name'),
  ])

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/transfers" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tạo phiếu điều chuyển</h1>
          <p className="text-sm text-gray-500 mt-0.5">Chuyển hàng giữa các điểm bán / kho</p>
        </div>
      </div>

      <TransferForm branches={branches ?? []} products={products ?? []} />
    </div>
  )
}
