'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createImport(formData: FormData) {
  const supabase = createAdminClient()

  const branch_id = formData.get('branch_id') as string
  const note = formData.get('note') as string
  const items: { product_id: string; quantity: number; expiry_date: string; batch_code: string }[] =
    JSON.parse(formData.get('items') as string)

  if (!branch_id || items.length === 0) throw new Error('Thiếu thông tin nhập kho')

  const session_id = crypto.randomUUID()
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

export async function updateImportSession(
  sessionId: string,
  formData: FormData
) {
  const supabase = createAdminClient()

  const branch_id = formData.get('branch_id') as string
  const note = formData.get('note') as string
  const items: { product_id: string; quantity: number; expiry_date: string; batch_code: string }[] =
    JSON.parse(formData.get('items') as string)

  if (!branch_id || items.length === 0) throw new Error('Thiếu thông tin')

  // Reverse stock for all existing movements in this session
  const { data: old } = await supabase
    .from('stock_movements')
    .select('branch_id, product_id, quantity')
    .eq('session_id', sessionId)
    .eq('type', 'import')

  for (const m of old ?? []) {
    await supabase.rpc('adjust_stock', {
      p_branch_id: m.branch_id,
      p_product_id: m.product_id,
      p_delta: -m.quantity,
    })
  }

  // Delete old movements
  await supabase.from('stock_movements').delete().eq('session_id', sessionId)

  // Insert updated movements (keep same session_id)
  const { error } = await supabase.from('stock_movements').insert(
    items.map(i => ({
      branch_id,
      product_id: i.product_id,
      type: 'import' as const,
      quantity: i.quantity,
      expiry_date: i.expiry_date || null,
      batch_code: i.batch_code || null,
      note: note || null,
      session_id: sessionId,
    }))
  )
  if (error) throw new Error(error.message)

  revalidatePath('/imports')
  revalidatePath('/stock')
  redirect(`/imports/${sessionId}`)
}

export async function deleteImportSession(sessionId: string) {
  const supabase = createAdminClient()

  const { data: movements, error: fetchErr } = await supabase
    .from('stock_movements')
    .select('branch_id, product_id, quantity')
    .eq('session_id', sessionId)
    .eq('type', 'import')
  if (fetchErr) throw new Error(fetchErr.message)
  if (!movements || movements.length === 0) throw new Error('Không tìm thấy phiếu')

  // Reverse: import added to stock, so reverting subtracts
  for (const m of movements) {
    await supabase.rpc('adjust_stock', {
      p_branch_id: m.branch_id,
      p_product_id: m.product_id,
      p_delta: -m.quantity,
    })
  }

  const { error } = await supabase.from('stock_movements').delete().eq('session_id', sessionId)
  if (error) throw new Error(error.message)

  revalidatePath('/imports')
  revalidatePath('/stock')
  revalidatePath('/dashboard')
  redirect('/imports')
}
