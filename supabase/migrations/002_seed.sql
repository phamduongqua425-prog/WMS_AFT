-- WMS AFT - Seed Data Migration 002
-- Dữ liệu từ file Excel thực tế của AFT

-- =============================================
-- BRANCHES (từ DS DIEM BAN + Danh sách điểm bán)
-- =============================================
insert into branches (code, name, type, address, phone, contact_name, is_active) values
  ('156-108HH',  'Kho VP - 108 Hồng Hà',               'warehouse', '108 Hồng Hà, phường Tân Sơn Hòa, TP.HCM',                                             '0908 362 367',                        'Huỳnh Ái Vân',  true),
  ('156-112HH',  'Kho Offline - 112 Hồng Hà',           'warehouse', '112 Hồng Hà, phường Tân Sơn Hòa, TP.HCM',                                             '0772 000 720',                        'Admin',         true),
  ('156-89PHT',  'Booth - 89 Phạm Huy Thông',           'store',     '89 Phạm Huy Thông, phường Gò Vấp, HCM',                                               '0938 298 167',                        'Admin',         true),
  ('156-01PVT',  'Booth - 01 Phan Văn Trường',          'store',     'Số 01 Phan Văn Trường, phường Cầu Ông Lãnh, TP. HCM',                                  '0938 784 167',                        'Admin',         true),
  ('156-26NMH',  'PUP - 26/2 Nguyễn Minh Hoàng',       'store',     '26/2 Nguyễn Minh Hoàng, phường Bảy Hiền, TP.HCM',                                      '0938 964 167',                        'Bác Diệp',      true),
  ('156-312DS8', 'PUP - 312 Đường số 8',                'store',     '312 đường số 8, phường Thông Tây Hội, TP.HCM',                                          '0975 822 144',                        'Thu Sương',     true),
  ('156-2AD79',  'PUP - 2A Đường số 79',                'store',     '2A Đường số 79, phường Tân Hưng, TP.HCM',                                              '0938 747 585',                        'Chị Hương',     true),
  ('156-CLDON',  'PUP - Celadon City Tân Phú',          'store',     'Tầng Trệt, Khối đế P1, khu A5, Diamond - Celadon City, Số 3 N1, P. Sơn Kỳ, Tân Phú', '0938 974 167',                        'Chị Linh',      true),
  ('156-206HVB', 'PUP - 206 Huỳnh Văn Bánh',            'store',     '206 Huỳnh Văn Bánh, Phú Nhuận, TP. HCM',                                              '0938 632 167',                        'Chị Dung',      true),
  ('156-357DBP', 'PUP - 357 Điện Biên Phủ',             'store',     '357 Điện Biên Phủ, phường Gia Định, Tp. HCM',                                          '0938 172 167',                        'Chị Cúc',       true),
  ('156-193UVK', 'PUP - 193/10 Ung Văn Khiêm',         'store',     '193/10 Ung Văn Khiêm, phường Thạnh Mỹ Tây, TP.HCM',                                   '0706 762 141',                        'Ngọc Đẹp',      false),
  ('156-QL13',   'PUP - Quốc Lộ 13 cũ, Thủ Đức',       'store',     '83/8 (QL13 cũ) Hiệp Bình, khu phố 6, Thủ Đức, TP.HCM',                                '0987 381 629',                        'Lã Thị Tâm',    false),
  ('156-TITAN',  'PUP - Sân pickleball TiTan',          'store',     '35/21 Phan Văn Hớn, Tân Thới Nhất, Quận 12, TP.HCM',                                  '0867 111 433',                        'Chị Linh',      false)
on conflict (code) do nothing;

-- =============================================
-- PRODUCTS (từ Danh_sach_hang_hoa_dich_vu + mã VAC từ báo cáo NXT)
-- =============================================

-- Hàng hóa chính (thành phẩm đang theo dõi tồn kho thực tế)
insert into products (code, name, category, unit, min_stock, shelf_life_days) values
  ('VAC0001', 'Trà Oolong Lài Sữa Trân Châu 400ml',        'HH', 'ly',  20, 7),
  ('VAC0002', 'Trà Oolong Lài Sữa Trân Châu 250ml',        'HH', 'ly',  10, 7),
  ('VAC0003', 'Đậu Hủ Lạnh Hộp 150g',                      'HH', 'hộp', 20, 5),
  ('VAC0004', 'Bánh Danish Đào 54g',                        'HH', 'cái', 10, 5),
  ('VAC0005', 'Bánh Danish Dừa 54g',                        'HH', 'cái', 10, 5),
  ('VAC0006', 'Bánh Mè Hàn Quốc 60g',                      'HH', 'cái', 10, 7),
  ('VAC0007', 'Bánh Patechaud 60g',                         'HH', 'cái', 10, 5),
  ('VAC0008', 'Bánh Croissant Trứng Chảy 40g',             'HH', 'cái', 10, 5),
  ('VAC0009', 'Bánh Mì Baguette Mini 45g (10 cái/túi)',    'HH', 'túi',  5, 3),
  ('VAC0010', 'Bánh Su Kem Choux Cream 30g',                'HH', 'cái', 10, 3),
  ('VAC0011', 'Bánh Su Kem Socola Choux Cream 30g',        'HH', 'cái', 10, 3),
  ('VAC0012', 'Bánh Croissant Thường 40g',                  'HH', 'cái', 10, 5),
  ('VAC0013', 'Bánh Mì Bơ Tỏi (10 cái/phần)',             'HH', 'phần', 5, 3),
  ('VAC0019', 'Bánh Su Kem Trà Xanh Choux Cream 30g',     'HH', 'cái', 10, 3),
  ('VAC0047', 'Trà Sữa Thái Xanh Panna Cotta 400ml',      'HH', 'ly',  10, 5),
  ('VAC0048', 'Trà Sữa Thái Đỏ Panna Cotta 400ml',        'HH', 'ly',  10, 5)
on conflict (code) do nothing;

-- Công cụ dụng cụ
insert into products (code, name, category, unit, min_stock) values
  ('CCDC012', 'Thùng Xốp T2 (500x375x340mm)',              'CCDC', 'cái', 2),
  ('CCDC013', 'Thùng Xốp T3 (600x445x370mm)',              'CCDC', 'cái', 2),
  ('CCDC019', 'Đá Gel 500gr',                               'CCDC', 'gói', 5),
  ('CCDC029', 'Thùng Đá 65L',                               'CCDC', 'cái', 1),
  ('CCDC058', 'Giấy Nhiệt Khổ 80x80mm',                    'CCDC', 'cuộn', 2)
on conflict (code) do nothing;
