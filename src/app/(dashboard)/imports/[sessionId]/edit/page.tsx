export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EditImportForm } from './edit-import-form'

export default async function EditImportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const supabase = await createClient()

  const [{ data: movements }, { data: branches }, { data: products }] = await Promise.all([
    supabase
      .from('stock_movements')
      .select('*, product:products(name, code, unit)')
      .eq('session_id', sessionId)
      .eq('type', 'import')
      .order('created_at'),
    supabase.from('branches').select('*').eq('is_active', true).order('type', { ascending: false }).order('name'),
    supabase.from('products').select('*').eq('is_active', true).eq('category', 'HH').order('name'),
  ])

  if (!movements || movements.length === 0) notFound()

  const first = movements[0]

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/imports/${sessionId}`} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sửa phiếu nhập kho</h1>
          <p className="text-sm text-gray-500 mt-0.5">Thay đổi sẽ cập nhật lại tồn kho tự động</p>
        </div>
      </div>

      <EditImportForm
        sessionId={sessionId}
        branches={branches ?? []}
        products={products ?? []}
        initialBranchId={first.branch_id}
        initialNote={first.note ?? ''}
        initialItems={movements.map(m => ({
          product_id: m.product_id,
          quantity: String(m.quantity),
          expiry_date: (m as any).expiry_date ?? '',
          batch_code: (m as any).batch_code ?? '',
        }))}
      />
    </div>
  )
}
