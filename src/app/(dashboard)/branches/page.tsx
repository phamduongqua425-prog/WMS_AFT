import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Store, Warehouse, Phone, User } from 'lucide-react'

export default async function BranchesPage() {
  const supabase = await createClient()
  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .order('type', { ascending: false })
    .order('name')

  const warehouses = branches?.filter(b => b.type === 'warehouse') ?? []
  const stores = branches?.filter(b => b.type === 'store') ?? []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Điểm bán & Kho</h1>
          <p className="text-sm text-gray-500 mt-0.5">{branches?.length ?? 0} địa điểm</p>
        </div>
      </div>

      {/* Kho */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Warehouse size={14} /> Kho trung tâm
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {warehouses.map(b => (
            <BranchCard key={b.id} branch={b} />
          ))}
        </div>
      </section>

      {/* Điểm bán */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Store size={14} /> Điểm bán ({stores.filter(s => s.is_active).length} hoạt động)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {stores.map(b => (
            <BranchCard key={b.id} branch={b} />
          ))}
        </div>
      </section>
    </div>
  )
}

function BranchCard({ branch }: { branch: any }) {
  return (
    <div className={`bg-white rounded-xl border p-4 space-y-3 ${!branch.is_active ? 'opacity-50 border-gray-100' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{branch.name}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{branch.code}</p>
        </div>
        <Badge variant={branch.is_active ? 'default' : 'secondary'} className="shrink-0 text-xs">
          {branch.is_active ? 'Hoạt động' : 'Ngưng'}
        </Badge>
      </div>

      {branch.address && (
        <p className="text-sm text-gray-500 line-clamp-2">{branch.address}</p>
      )}

      <div className="flex flex-wrap gap-3 pt-1 text-xs text-gray-400">
        {branch.contact_name && (
          <span className="flex items-center gap-1">
            <User size={12} /> {branch.contact_name}
          </span>
        )}
        {branch.phone && (
          <span className="flex items-center gap-1">
            <Phone size={12} /> {branch.phone}
          </span>
        )}
      </div>
    </div>
  )
}
