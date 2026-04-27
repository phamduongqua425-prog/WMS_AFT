'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const EXPORT_TYPES = ['destroy', 'sample', 'gift', 'other']

export async function createExport(formData: FormData) {
  const supabase = createAdminClient()

  const branch_id = formData.get('branch_id') as string
  const type = formData.get('type') as string
  const note = formData.get('note') as string
  const items: { product_id: string; quantity: number; note: string }[] =
    JSON.parse(formData.get('items') as string)

  if (!branch_id) throw new Error('Vui lòng chọn điểm bán')
  if (!EXPORT_TYPES.includes(type)) throw new Error('Loại xuất không hợp lệ')
  if (items.length === 0) throw new Error('Vui lòng thêm ít nhất 1 sản phẩm')

  const session_id = crypto.randomUUID()

  const { error } = await supabase.from('stock_movements').insert(
    items.map(i => ({
      branch_id,
      product_id: i.product_id,
      type,
      quantity: i.quantity,
      note: i.note || note || null,
      session_id,
    }))
  )

  if (error) throw new Error(error.message)

  revalidatePath('/exports')
  revalidatePath('/stock')
  revalidatePath('/dashboard')
  redirect('/exports')
}

export async function updateExportNote(sessionId: string, note: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('stock_movements')
    .update({ note: note || null })
    .eq('session_id', sessionId)
  if (error) throw new Error(error.message)
  revalidatePath('/exports')
  revalidatePath(`/exports/${sessionId}`)
}

export async function deleteExportSession(sessionId: string) {
  const supabase = createAdminClient()

  const { data: movements, error: fetchErr } = await supabase
    .from('stock_movements')
    .select('branch_id, product_id, quantity')
    .eq('session_id', sessionId)
    .in('type', EXPORT_TYPES)
  if (fetchErr) throw new Error(fetchErr.message)
  if (!movements || movements.length === 0) throw new Error('Không tìm thấy phiếu')

  // Reverse: exports subtract from stock, so reverting adds back
  for (const m of movements) {
    await supabase.rpc('adjust_stock', {
      p_branch_id: m.branch_id,
      p_product_id: m.product_id,
      p_delta: m.quantity,
    })
  }

  const { error } = await supabase.from('stock_movements').delete().eq('session_id', sessionId)
  if (error) throw new Error(error.message)

  revalidatePath('/exports')
  revalidatePath('/stock')
  revalidatePath('/dashboard')
  redirect('/exports')
}
