-- Migration 002: thêm expiry_date vào transfer_order_items
-- Cho phép ghi nhận HSD khi điều chuyển hàng cận date

alter table transfer_order_items
  add column if not exists expiry_date date;
