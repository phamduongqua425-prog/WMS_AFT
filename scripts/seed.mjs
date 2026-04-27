/**
 * Seed script: import branches + products vào Supabase
 * Chạy: node scripts/seed.mjs
 * Cần SUPABASE_SERVICE_ROLE_KEY trong .env.local
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Đọc .env.local thủ công
const envFile = readFileSync('.env.local', 'utf-8')
const env = Object.fromEntries(
  envFile.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim()))
)

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Thiếu SUPABASE_SERVICE_ROLE_KEY trong .env.local')
  console.error('Lấy key tại: Supabase Dashboard > Settings > API > service_role')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// =============================================
// DATA
// =============================================

const branches = [
  { code: '156-108HH',  name: 'Kho VP - 108 Hồng Hà',               type: 'warehouse', address: '108 Hồng Hà, phường Tân Sơn Hòa, TP.HCM',                                             phone: '0908 362 367', contact_name: 'Huỳnh Ái Vân',  is_active: true },
  { code: '156-112HH',  name: 'Kho Offline - 112 Hồng Hà',           type: 'warehouse', address: '112 Hồng Hà, phường Tân Sơn Hòa, TP.HCM',                                             phone: '0772 000 720', contact_name: 'Admin',         is_active: true },
  { code: '156-89PHT',  name: 'Booth - 89 Phạm Huy Thông',           type: 'store',     address: '89 Phạm Huy Thông, phường Gò Vấp, HCM',                                               phone: '0938 298 167', contact_name: 'Admin',         is_active: true },
  { code: '156-01PVT',  name: 'Booth - 01 Phan Văn Trường',          type: 'store',     address: 'Số 01 Phan Văn Trường, phường Cầu Ông Lãnh, TP. HCM',                                  phone: '0938 784 167', contact_name: 'Admin',         is_active: true },
  { code: '156-26NMH',  name: 'PUP - 26/2 Nguyễn Minh Hoàng',       type: 'store',     address: '26/2 Nguyễn Minh Hoàng, phường Bảy Hiền, TP.HCM',                                      phone: '0938 964 167', contact_name: 'Bác Diệp',      is_active: true },
  { code: '156-312DS8', name: 'PUP - 312 Đường số 8',                type: 'store',     address: '312 đường số 8, phường Thông Tây Hội, TP.HCM',                                          phone: '0975 822 144', contact_name: 'Thu Sương',     is_active: true },
  { code: '156-2AD79',  name: 'PUP - 2A Đường số 79',                type: 'store',     address: '2A Đường số 79, phường Tân Hưng, TP.HCM',                                              phone: '0938 747 585', contact_name: 'Chị Hương',     is_active: true },
  { code: '156-CLDON',  name: 'PUP - Celadon City Tân Phú',          type: 'store',     address: 'Diamond - Celadon City, Số 3 N1, P. Sơn Kỳ, Tân Phú',                                 phone: '0938 974 167', contact_name: 'Chị Linh',      is_active: true },
  { code: '156-206HVB', name: 'PUP - 206 Huỳnh Văn Bánh',            type: 'store',     address: '206 Huỳnh Văn Bánh, Phú Nhuận, TP. HCM',                                              phone: '0938 632 167', contact_name: 'Chị Dung',      is_active: true },
  { code: '156-357DBP', name: 'PUP - 357 Điện Biên Phủ',             type: 'store',     address: '357 Điện Biên Phủ, phường Gia Định, Tp. HCM',                                          phone: '0938 172 167', contact_name: 'Chị Cúc',       is_active: true },
  { code: '156-193UVK', name: 'PUP - 193/10 Ung Văn Khiêm',         type: 'store',     address: '193/10 Ung Văn Khiêm, phường Thạnh Mỹ Tây, TP.HCM',                                   phone: '0706 762 141', contact_name: 'Ngọc Đẹp',      is_active: false },
  { code: '156-QL13',   name: 'PUP - Quốc Lộ 13 cũ, Thủ Đức',       type: 'store',     address: '83/8 (QL13 cũ) Hiệp Bình, khu phố 6, Thủ Đức, TP.HCM',                                phone: '0987 381 629', contact_name: 'Lã Thị Tâm',    is_active: false },
  { code: '156-TITAN',  name: 'PUP - Sân pickleball TiTan',          type: 'store',     address: '35/21 Phan Văn Hớn, Tân Thới Nhất, Quận 12, TP.HCM',                                  phone: '0867 111 433', contact_name: 'Chị Linh',      is_active: false },
]

const products = [
  { code: 'VAC0001', name: 'Trà Oolong Lài Sữa Trân Châu 400ml',       category: 'HH',   unit: 'ly',   min_stock: 20, shelf_life_days: 7 },
  { code: 'VAC0002', name: 'Trà Oolong Lài Sữa Trân Châu 250ml',       category: 'HH',   unit: 'ly',   min_stock: 10, shelf_life_days: 7 },
  { code: 'VAC0003', name: 'Đậu Hủ Lạnh Hộp 150g',                      category: 'HH',   unit: 'hộp',  min_stock: 20, shelf_life_days: 5 },
  { code: 'VAC0004', name: 'Bánh Danish Đào 54g',                        category: 'HH',   unit: 'cái',  min_stock: 10, shelf_life_days: 5 },
  { code: 'VAC0005', name: 'Bánh Danish Dừa 54g',                        category: 'HH',   unit: 'cái',  min_stock: 10, shelf_life_days: 5 },
  { code: 'VAC0006', name: 'Bánh Mè Hàn Quốc 60g',                      category: 'HH',   unit: 'cái',  min_stock: 10, shelf_life_days: 7 },
  { code: 'VAC0007', name: 'Bánh Patechaud 60g',                         category: 'HH',   unit: 'cái',  min_stock: 10, shelf_life_days: 5 },
  { code: 'VAC0008', name: 'Bánh Croissant Trứng Chảy 40g',             category: 'HH',   unit: 'cái',  min_stock: 10, shelf_life_days: 5 },
  { code: 'VAC0009', name: 'Bánh Mì Baguette Mini 45g (10 cái/túi)',    category: 'HH',   unit: 'túi',  min_stock: 5,  shelf_life_days: 3 },
  { code: 'VAC0010', name: 'Bánh Su Kem Choux Cream 30g',                category: 'HH',   unit: 'cái',  min_stock: 10, shelf_life_days: 3 },
  { code: 'VAC0011', name: 'Bánh Su Kem Socola Choux Cream 30g',        category: 'HH',   unit: 'cái',  min_stock: 10, shelf_life_days: 3 },
  { code: 'VAC0012', name: 'Bánh Croissant Thường 40g',                  category: 'HH',   unit: 'cái',  min_stock: 10, shelf_life_days: 5 },
  { code: 'VAC0013', name: 'Bánh Mì Bơ Tỏi (10 cái/phần)',             category: 'HH',   unit: 'phần', min_stock: 5,  shelf_life_days: 3 },
  { code: 'VAC0019', name: 'Bánh Su Kem Trà Xanh Choux Cream 30g',     category: 'HH',   unit: 'cái',  min_stock: 10, shelf_life_days: 3 },
  { code: 'VAC0047', name: 'Trà Sữa Thái Xanh Panna Cotta 400ml',      category: 'HH',   unit: 'ly',   min_stock: 10, shelf_life_days: 5 },
  { code: 'VAC0048', name: 'Trà Sữa Thái Đỏ Panna Cotta 400ml',        category: 'HH',   unit: 'ly',   min_stock: 10, shelf_life_days: 5 },
  { code: 'CCDC012', name: 'Thùng Xốp T2 (500x375x340mm)',              category: 'CCDC', unit: 'cái',  min_stock: 2,  shelf_life_days: null },
  { code: 'CCDC013', name: 'Thùng Xốp T3 (600x445x370mm)',              category: 'CCDC', unit: 'cái',  min_stock: 2,  shelf_life_days: null },
  { code: 'CCDC019', name: 'Đá Gel 500gr',                               category: 'CCDC', unit: 'gói',  min_stock: 5,  shelf_life_days: null },
  { code: 'CCDC029', name: 'Thùng Đá 65L',                               category: 'CCDC', unit: 'cái',  min_stock: 1,  shelf_life_days: null },
  { code: 'CCDC058', name: 'Giấy Nhiệt Khổ 80x80mm',                    category: 'CCDC', unit: 'cuộn', min_stock: 2,  shelf_life_days: null },
]

async function seed() {
  console.log('🌱 Bắt đầu seed dữ liệu AFT WMS...\n')

  // Branches
  console.log('📍 Đang thêm điểm bán...')
  const { error: branchErr } = await supabase
    .from('branches')
    .upsert(branches, { onConflict: 'code' })
  if (branchErr) { console.error('❌ branches:', branchErr.message); process.exit(1) }
  console.log(`✅ ${branches.length} điểm bán/kho\n`)

  // Products
  console.log('📦 Đang thêm sản phẩm...')
  const { error: productErr } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'code' })
  if (productErr) { console.error('❌ products:', productErr.message); process.exit(1) }
  console.log(`✅ ${products.length} sản phẩm\n`)

  console.log('🎉 Seed hoàn tất!')
  console.log('👉 Mở http://localhost:3000 để xem kết quả')
}

seed().catch(console.error)
