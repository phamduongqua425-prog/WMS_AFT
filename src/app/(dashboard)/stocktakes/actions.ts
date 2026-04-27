'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createStocktake(formData: FormData) {
  const supabase = createAdminClient()

  const branch_id = formData.get('branch_id') as string
  const date = formData.get('date') as string
  const note = formData.get('note') as string
  const submit = formData.get('submit') === '1'
  const items: { product_id: string; actual_quantity: number; system_quantity: number }[] =
    JSON.parse(formData.get('items') as string)

  if (!branch_id) throw new Error('Vui lòng chọn điểm bán')
  if (!date) throw new Error('Vui lòng chọn ngày kiểm kê')
  if (items.length === 0) throw new Error('Không có sản phẩm nào để kiểm kê')

  const { data: stocktake, error: stErr } = await supabase
    .from('stocktakes')
    .insert({
      branch_id,
      date,
      note: note || null,
      status: submit ? 'submitted' : 'draft',
      submitted_at: submit ? new Date().toISOString() : null,
    })
    .select('id')
    .single()

  if (stErr) throw new Error(stErr.message)

  const { error: itemsErr } = await supabase
    .from('stocktake_items')
    .insert(items.map(i => ({
      stocktake_id: stocktake.id,
      product_id: i.product_id,
      actual_quantity: i.actual_quantity,
      system_quantity: i.system_quantity,
    })))

  if (itemsErr) throw new Error(itemsErr.message)

  revalidatePath('/stocktakes')
  redirect(`/stocktakes/${stocktake.id}`)
}

export async function deleteStocktake(id: string) {
  const supabase = createAdminClient()
  // stocktake_items cascade delete via FK
  const { error } = await supabase.from('stocktakes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/stocktakes')
  redirect('/stocktakes')
}
