
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  PackageOpen,
  ArrowLeftRight,
  ClipboardList,
  Store,
  Package,
  TrendingDown,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/stock', label: 'Tồn kho', icon: Package },
  { href: '/imports', label: 'Nhập kho', icon: PackageOpen },
  { href: '/transfers', label: 'Điều chuyển', icon: ArrowLeftRight },
  { href: '/exports', label: 'Xuất khác', icon: TrendingDown },
  { href: '/stocktakes', label: 'Kiểm kê', icon: ClipboardList },
  { href: '/branches', label: 'Điểm bán', icon: Store },
  { href: '/products', label: 'Sản phẩm', icon: Package },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="flex flex-col w-60 min-h-screen bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">AFT WMS</p>
          <p className="text-xs text-gray-400">Quản lý kho</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              path.startsWith(href)
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
