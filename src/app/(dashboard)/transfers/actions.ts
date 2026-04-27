'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTransfer(formData: FormData) {
  const supabase = createAdminClient()

  const from_branch_id = formData.get('from_branch_id') as string
  const to_branch_id = formData.get('to_branch_id') as string
  const note = formData.get('note') as string
  const items: { product_id: string; quantity: number }[] = JSON.parse(formData.get('items') as string)

  if (!from_branch_id || !to_branch_id || from_branch_id === to_branch_id) {
    throw new Error('Điểm xuất và điểm nhận phải khác nhau')
  }
  if (items.length === 0) throw new Error('Vui lòng thêm ít nhất 1 sản phẩm')

  // Tạo transfer order — trigger DB sẽ tự tạo mã DC
  const { data: order, error: orderErr } = await supabase
    .from('transfer_orders')
    .insert({ from_branch_id, to_branch_id, note: note || null, status: 'pending' })
    .select('id')
    .single()

  if (orderErr) throw new Error(orderErr.message)

  // Tạo các dòng sản phẩm
  const { error: itemsErr } = await supabase
    .from('transfer_order_items')
    .insert(items.map(i => ({ transfer_order_id: order.id, product_id: i.product_id, quantity: i.quantity })))

  if (itemsErr) throw new Error(itemsErr.message)

  revalidatePath('/transfers')
  redirect(`/transfers/${order.id}`)
}

export async function confirmTransferOut(orderId: string) {
  const supabase = createAdminClient()

  // Lấy thông tin phiếu + items
  const { data: order, error } = await supabase
    .from('transfer_orders')
    .select('*, items:transfer_order_items(product_id, quantity)')
    .eq('id', orderId)
    .eq('status', 'pending')
    .single()

  if (error || !order) throw new Error('Không tìm thấy phiếu hoặc trạng thái không hợp lệ')

  // Insert movements transfer_out (trigger tự trừ tồn điểm xuất)
  const movements = order.items.map((item: any) => ({
    branch_id: order.from_branch_id,
    product_id: item.product_id,
    type: 'transfer_out' as const,
    quantity: item.quantity,
    transfer_order_id: orderId,
  }))

  const { error: mvErr } = await supabase.from('stock_movements').insert(movements)
  if (mvErr) throw new Error(mvErr.message)

  // Cập nhật trạng thái
  await supabase
    .from('transfer_orders')
    .update({ status: 'confirmed_out', confirmed_out_at: new Date().toISOString() })
    .eq('id', orderId)

  revalidatePath(`/transfers/${orderId}`)
  revalidatePath('/transfers')
  revalidatePath('/stock')
}

export async function confirmTransferIn(orderId: string) {
  const supabase = createAdminClient()

  const { data: order, error } = await supabase
    .from('transfer_orders')
    .select('*, items:transfer_order_items(product_id, quantity)')
    .eq('id', orderId)
    .eq('status', 'confirmed_out')
    .single()

  if (error || !order) throw new Error('Không tìm thấy phiếu hoặc chưa xác nhận xuất')

  // Insert movements transfer_in (trigger tự cộng tồn điểm nhận)
  const movements = order.items.map((item: any) => ({
    branch_id: order.to_branch_id,
    product_id: item.product_id,
    type: 'transfer_in' as const,
    quantity: item.quantity,
    transfer_order_id: orderId,
  }))

  const { error: mvErr } = await supabase.from('stock_movements').insert(movements)
  if (mvErr) throw new Error(mvErr.message)

  await supabase
    .from('transfer_orders')
    .update({ status: 'done', confirmed_in_at: new Date().toISOString() })
    .eq('id', orderId)

  revalidatePath(`/transfers/${orderId}`)
  revalidatePath('/transfers')
  revalidatePath('/stock')
  revalidatePath('/dashboard')
}

export async function cancelTransfer(orderId: string) {
  const supabase = createAdminClient()

  await supabase
    .from('transfer_orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .in('status', ['pending'])

  revalidatePath(`/transfers/${orderId}`)
  revalidatePath('/transfers')
}
