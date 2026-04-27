export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type BranchType = 'warehouse' | 'store'
export type MovementType = 'import' | 'transfer_out' | 'transfer_in' | 'destroy' | 'sample' | 'gift' | 'sold' | 'other'
export type TransferStatus = 'pending' | 'confirmed_out' | 'confirmed_in' | 'done' | 'cancelled'
export type UserRole = 'admin' | 'warehouse_manager' | 'store_staff'
export type ProductCategory = 'HH' | 'CCDC' | 'COMBO'
export type StocktakeStatus = 'draft' | 'submitted'

export interface Branch {
  id: string
  code: string
  name: string
  type: BranchType
  address: string | null
  phone: string | null
  contact_name: string | null
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  code: string
  name: string
  category: ProductCategory
  unit: string
  min_stock: number
  shelf_life_days: number | null
  is_active: boolean
  created_at: string
}

export interface Stock {
  branch_id: string
  product_id: string
  quantity: number
  updated_at: string
  branch?: Branch
  product?: Product
}

export interface StockMovement {
  id: string
  branch_id: string
  product_id: string
  type: MovementType
  quantity: number
  transfer_order_id: string | null
  batch_code: string | null
  expiry_date: string | null
  note: string | null
  created_by: string | null
  created_at: string
  branch?: Branch
  product?: Product
}

export interface TransferOrder {
  id: string
  code: string | null
  from_branch_id: string
  to_branch_id: string
  status: TransferStatus
  note: string | null
  requested_by: string | null
  requested_at: string
  confirmed_out_at: string | null
  confirmed_in_at: string | null
  from_branch?: Branch
  to_branch?: Branch
  items?: TransferOrderItem[]
}

export interface TransferOrderItem {
  id: string
  transfer_order_id: string
  product_id: string
  quantity: number
  product?: Product
}

export interface Stocktake {
  id: string
  branch_id: string
  date: string
  status: StocktakeStatus
  note: string | null
  submitted_by: string | null
  submitted_at: string | null
  created_at: string
  branch?: Branch
  items?: StocktakeItem[]
}

export interface StocktakeItem {
  id: string
  stocktake_id: string
  product_id: string
  actual_quantity: number
  system_quantity: number
  product?: Product
}

export interface UserProfile {
  id: string
  full_name: string | null
  role: UserRole
  branch_id: string | null
  branch?: Branch
}

export type Database = {
  public: {
    Tables: {
      branches: { Row: Branch; Insert: Omit<Branch, 'id' | 'created_at'>; Update: Partial<Branch> }
      products: { Row: Product; Insert: Omit<Product, 'id' | 'created_at'>; Update: Partial<Product> }
      stock: { Row: Stock; Insert: Omit<Stock, 'updated_at'>; Update: Partial<Stock> }
      stock_movements: { Row: StockMovement; Insert: Omit<StockMovement, 'id' | 'created_at'>; Update: Partial<StockMovement> }
      transfer_orders: { Row: TransferOrder; Insert: Omit<TransferOrder, 'id' | 'code' | 'requested_at'>; Update: Partial<TransferOrder> }
      transfer_order_items: { Row: TransferOrderItem; Insert: Omit<TransferOrderItem, 'id'>; Update: Partial<TransferOrderItem> }
      stocktakes: { Row: Stocktake; Insert: Omit<Stocktake, 'id' | 'created_at'>; Update: Partial<Stocktake> }
      stocktake_items: { Row: StocktakeItem; Insert: Omit<StocktakeItem, 'id'>; Update: Partial<StocktakeItem> }
      user_profiles: { Row: UserProfile; Insert: Omit<UserProfile, 'branch'>; Update: Partial<UserProfile> }
    }
  }
}
