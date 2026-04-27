'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createProduct, updateProduct } from './actions'
import { Plus, Pencil } from 'lucide-react'

type Product = {
  id: string
  name: string
  code: string
  category: string
  unit: string
  min_stock: number
  shelf_life_days?: number | null
}

const CATEGORIES = [
  { value: 'HH', label: 'Hàng hóa' },
  { value: 'CCDC', label: 'Công cụ dụng cụ' },
  { value: 'COMBO', label: 'Combo' },
]

function ProductFormFields({ product }: { product?: Product }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 block mb-1">Tên sản phẩm *</label>
          <Input name="name" defaultValue={product?.name} required placeholder="VD: Trà sữa trân châu 500ml" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Mã code *</label>
          <Input name="code" defaultValue={product?.code} required placeholder="VD: TS001" className="uppercase" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Danh mục *</label>
          <select
            name="category"
            defaultValue={product?.category ?? 'HH'}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Đơn vị *</label>
          <Input name="unit" defaultValue={product?.unit} required placeholder="VD: ly, kg, gói" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Tồn tối thiểu</label>
          <Input name="min_stock" type="number" min="0" defaultValue={product?.min_stock ?? 0} />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 block mb-1">Hạn sử dụng (ngày, để trống nếu không có)</label>
          <Input name="shelf_life_days" type="number" min="1" defaultValue={product?.shelf_life_days ?? ''} placeholder="VD: 7" />
        </div>
      </div>
    </div>
  )
}

export function AddProductButton() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await createProduct(fd)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <ProductFormFields />
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

export function EditProductButton({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await updateProduct(product.id, fd)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-1 text-gray-300 hover:text-gray-600 transition-colors"
          title="Sửa"
        >
          <Pencil size={13} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa sản phẩm</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <ProductFormFields product={product} />
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
