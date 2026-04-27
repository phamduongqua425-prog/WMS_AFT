'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').insert({
    name: formData.get('name') as string,
    code: (formData.get('code') as string).toUpperCase(),
    category: formData.get('category') as string,
    unit: formData.get('unit') as string,
    min_stock: Number(formData.get('min_stock') ?? 0),
    shelf_life_days: formData.get('shelf_life_days') ? Number(formData.get('shelf_life_days')) : null,
    is_active: true,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/products')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').update({
    name: formData.get('name') as string,
    code: (formData.get('code') as string).toUpperCase(),
    category: formData.get('category') as string,
    unit: formData.get('unit') as string,
    min_stock: Number(formData.get('min_stock') ?? 0),
    shelf_life_days: formData.get('shelf_life_days') ? Number(formData.get('shelf_life_days')) : null,
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/products')
}

export async function toggleProductActive(id: string, current: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').update({ is_active: !current }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/products')
}
