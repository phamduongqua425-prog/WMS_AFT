'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createExport(formData: FormData) {
  const supabase = createAdminClient()

  const branch_id = formData.get('branch_id') as string
  const type = formData.get('type') as string
  const note = formData.get('note') as string
  const items: { product_id: string; quantity: number; note: string }[] = JSON.parse(formData.get('items') as string)

  const validTypes = ['destroy', 'sample', 'gift', 'other']
  if (!branch_id) throw new Error('Vui lòng chọn điểm bán')
  if (!validTypes.includes(type)) throw new Error('Loại xuất không hợp lệ')
  if (items.length === 0) throw new Error('Vui lòng thêm ít nhất 1 sản phẩm')

  const { error } = await supabase.from('stock_movements').insert(
    items.map(i => ({
      branch_id,
      product_id: i.product_id,
      type,
      quantity: i.quantity,
      note: i.note || note || null,
    }))
  )

  if (error) throw new Error(error.message)

  revalidatePath('/exports')
  revalidatePath('/stock')
  revalidatePath('/dashboard')
  redirect('/exports')
}
