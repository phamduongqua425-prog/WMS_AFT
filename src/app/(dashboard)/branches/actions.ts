'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBranch(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('branches').insert({
    name: formData.get('name') as string,
    code: (formData.get('code') as string).toUpperCase(),
    type: formData.get('type') as string,
    address: formData.get('address') || null,
    phone: formData.get('phone') || null,
    contact_name: formData.get('contact_name') || null,
    is_active: true,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/branches')
}

export async function updateBranch(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('branches').update({
    name: formData.get('name') as string,
    code: (formData.get('code') as string).toUpperCase(),
    type: formData.get('type') as string,
    address: formData.get('address') || null,
    phone: formData.get('phone') || null,
    contact_name: formData.get('contact_name') || null,
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/branches')
}

export async function toggleBranchActive(id: string, current: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('branches').update({ is_active: !current }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/branches')
}
