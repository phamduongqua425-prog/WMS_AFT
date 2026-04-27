'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createImport(formData: FormData) {
  const supabase = createAdminClient()

  const branch_id = formData.get('branch_id') as string
  const note = formData.get('note') as string

  // Parse line items từ JSON string
  const itemsRaw = formData.get('items') as string
  const items: { product_id: string; quantity: number; expiry_date: string; batch_code: string }[] =
    JSON.parse(itemsRaw)

  if (!branch_id || items.length === 0) {
    throw new Error('Thiếu thông tin nhập kho')
  }

  const session_id = crypto.randomUUID()

  // Insert từng movement — trigger DB sẽ tự cập nhật bảng stock
  const movements = items.map(item => ({
    branch_id,
    product_id: item.product_id,
    type: 'import' as const,
    quantity: item.quantity,
    expiry_date: item.expiry_date || null,
    batch_code: item.batch_code || null,
    note: note || null,
    session_id,
  }))

  const { error } = await supabase.from('stock_movements').insert(movements)
  if (error) throw new Error(error.message)

  revalidatePath('/imports')
  revalidatePath('/stock')
  revalidatePath('/dashboard')
  redirect('/imports')
}
