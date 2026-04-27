-- WMS AFT - Schema Migration 001
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- BRANCHES (điểm bán + kho)
-- =============================================
create table if not exists branches (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  type text not null check (type in ('warehouse', 'store')),
  address text,
  phone text,
  contact_name text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- PRODUCTS (hàng hóa)
-- =============================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  category text not null default 'HH' check (category in ('HH', 'CCDC', 'COMBO')),
  unit text not null default 'cái',
  min_stock integer default 0,
  shelf_life_days integer,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- STOCK (tồn kho hiện tại - luôn cập nhật)
-- =============================================
create table if not exists stock (
  branch_id uuid references branches(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity integer not null default 0,
  updated_at timestamptz default now(),
  primary key (branch_id, product_id)
);

-- =============================================
-- STOCK MOVEMENTS (toàn bộ lịch sử - chỉ thêm, không xóa)
-- =============================================
create table if not exists stock_movements (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id) not null,
  product_id uuid references products(id) not null,
  type text not null check (type in (
    'import',        -- nhập mua từ NCC
    'transfer_out',  -- chuyển đi điểm khác
    'transfer_in',   -- nhận từ điểm khác
    'destroy',       -- xuất hủy (hết HSD, hỏng)
    'sample',        -- xuất mẫu
    'gift',          -- biếu tặng
    'sold',          -- xuất bán
    'other'          -- khác
  )),
  quantity integer not null check (quantity > 0),
  transfer_order_id uuid,
  batch_code text,
  expiry_date date,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- =============================================
-- TRANSFER ORDERS (phiếu điều chuyển)
-- =============================================
create table if not exists transfer_orders (
  id uuid primary key default uuid_generate_v4(),
  code text unique,
  from_branch_id uuid references branches(id) not null,
  to_branch_id uuid references branches(id) not null,
  status text not null default 'pending' check (status in (
    'pending',        -- đã tạo, chờ xuất
    'confirmed_out',  -- điểm xuất xác nhận đã giao
    'confirmed_in',   -- điểm nhận xác nhận đã nhận
    'done',           -- hoàn thành
    'cancelled'       -- hủy
  )),
  note text,
  requested_by uuid references auth.users(id),
  requested_at timestamptz default now(),
  confirmed_out_at timestamptz,
  confirmed_in_at timestamptz
);

create table if not exists transfer_order_items (
  id uuid primary key default uuid_generate_v4(),
  transfer_order_id uuid references transfer_orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity integer not null check (quantity > 0)
);

-- =============================================
-- STOCKTAKES (kiểm kê)
-- =============================================
create table if not exists stocktakes (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id) not null,
  date date not null,
  status text default 'draft' check (status in ('draft', 'submitted')),
  note text,
  submitted_by uuid references auth.users(id),
  submitted_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists stocktake_items (
  id uuid primary key default uuid_generate_v4(),
  stocktake_id uuid references stocktakes(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  actual_quantity integer not null default 0,
  system_quantity integer not null default 0
);

-- =============================================
-- USER PROFILES (phân quyền)
-- =============================================
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'store_staff' check (role in ('admin', 'warehouse_manager', 'store_staff')),
  branch_id uuid references branches(id)
);

-- =============================================
-- FUNCTION: cập nhật tồn kho tự động khi có movement
-- =============================================
create or replace function update_stock_on_movement()
returns trigger as $$
declare
  delta integer;
begin
  -- Các loại làm tăng tồn
  if NEW.type in ('import', 'transfer_in') then
    delta := NEW.quantity;
  else
    delta := -NEW.quantity;
  end if;

  insert into stock (branch_id, product_id, quantity, updated_at)
  values (NEW.branch_id, NEW.product_id, delta, now())
  on conflict (branch_id, product_id)
  do update set
    quantity = stock.quantity + delta,
    updated_at = now();

  return NEW;
end;
$$ language plpgsql;

create trigger trg_update_stock
  after insert on stock_movements
  for each row execute function update_stock_on_movement();

-- =============================================
-- FUNCTION: tạo mã phiếu điều chuyển tự động
-- =============================================
create or replace function generate_transfer_code()
returns trigger as $$
begin
  NEW.code := 'DC' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('transfer_order_seq')::text, 4, '0');
  return NEW;
end;
$$ language plpgsql;

create sequence if not exists transfer_order_seq start 1;

create trigger trg_transfer_code
  before insert on transfer_orders
  for each row execute function generate_transfer_code();

-- =============================================
-- REALTIME: bật realtime cho các bảng quan trọng
-- =============================================
alter publication supabase_realtime add table stock;
alter publication supabase_realtime add table transfer_orders;
alter publication supabase_realtime add table stock_movements;

-- =============================================
-- RLS: Row Level Security
-- =============================================
alter table branches enable row level security;
alter table products enable row level security;
alter table stock enable row level security;
alter table stock_movements enable row level security;
alter table transfer_orders enable row level security;
alter table transfer_order_items enable row level security;
alter table stocktakes enable row level security;
alter table stocktake_items enable row level security;
alter table user_profiles enable row level security;

-- Admin đọc/ghi tất cả
create policy "admin_all" on branches for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
);
create policy "admin_all" on products for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
);
create policy "admin_all" on stock for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
);
create policy "admin_all" on stock_movements for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
);
create policy "admin_all" on transfer_orders for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
);
create policy "admin_all" on transfer_order_items for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
);
create policy "admin_all" on stocktakes for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
);
create policy "admin_all" on stocktake_items for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
);
create policy "admin_all" on user_profiles for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
);

-- Warehouse manager đọc/ghi tất cả (giống admin về tồn kho)
create policy "wm_all" on branches for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'warehouse_manager')
);
create policy "wm_all" on products for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'warehouse_manager')
);
create policy "wm_all" on stock for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'warehouse_manager')
);
create policy "wm_all" on stock_movements for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'warehouse_manager')
);
create policy "wm_all" on transfer_orders for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'warehouse_manager')
);
create policy "wm_all" on transfer_order_items for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'warehouse_manager')
);
create policy "wm_all" on stocktakes for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'warehouse_manager')
);
create policy "wm_all" on stocktake_items for all using (
  exists (select 1 from user_profiles where id = auth.uid() and role = 'warehouse_manager')
);

-- Store staff chỉ đọc branches, products; ghi stocktake và movement của điểm mình
create policy "staff_read_branches" on branches for select using (auth.uid() is not null);
create policy "staff_read_products" on products for select using (auth.uid() is not null);
create policy "staff_read_stock" on stock for select using (auth.uid() is not null);
create policy "staff_own_stocktake" on stocktakes for all using (
  exists (select 1 from user_profiles where id = auth.uid() and branch_id = stocktakes.branch_id)
);
create policy "staff_own_movements" on stock_movements for insert with check (
  exists (select 1 from user_profiles where id = auth.uid() and branch_id = stock_movements.branch_id)
);
create policy "staff_read_movements" on stock_movements for select using (auth.uid() is not null);
create policy "staff_transfer_orders" on transfer_orders for all using (
  exists (
    select 1 from user_profiles
    where id = auth.uid()
    and (branch_id = transfer_orders.from_branch_id or branch_id = transfer_orders.to_branch_id)
  )
);
create policy "staff_read_transfer_items" on transfer_order_items for select using (auth.uid() is not null);
create policy "staff_own_profile" on user_profiles for select using (id = auth.uid());
