'use client'

import { useRef, useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createBranch, updateBranch } from './actions'
import { Plus, Pencil } from 'lucide-react'

type Branch = {
  id: string
  name: string
  code: string
  type: string
  address?: string | null
  phone?: string | null
  contact_name?: string | null
}

function BranchFormFields({ branch }: { branch?: Branch }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 block mb-1">Tên điểm bán / kho *</label>
          <Input name="name" defaultValue={branch?.name} required placeholder="VD: Kho VP - Hà Nội" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Mã code *</label>
          <Input name="code" defaultValue={branch?.code} required placeholder="VD: HN01" className="uppercase" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Loại *</label>
          <select
            name="type"
            defaultValue={branch?.type ?? 'store'}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="store">Điểm bán</option>
            <option value="warehouse">Kho trung tâm</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 block mb-1">Địa chỉ</label>
          <Input name="address" defaultValue={branch?.address ?? ''} placeholder="Địa chỉ đầy đủ" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Số điện thoại</label>
          <Input name="phone" defaultValue={branch?.phone ?? ''} placeholder="0901..." />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Người phụ trách</label>
          <Input name="contact_name" defaultValue={branch?.contact_name ?? ''} placeholder="Tên người quản lý" />
        </div>
      </div>
    </div>
  )
}

export function AddBranchButton() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await createBranch(fd)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus size={16} /> Thêm mới
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm điểm bán / kho</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-1">
          <BranchFormFields />
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Hủy
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {pending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditBranchButton({ branch }: { branch: Branch }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await updateBranch(branch.id, fd)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Sửa"
        >
          <Pencil size={13} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa thông tin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <BranchFormFields branch={branch} />
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Hủy
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {pending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
