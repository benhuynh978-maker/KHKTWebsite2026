/* =========================================================================
   CLIENT SUPABASE — dùng chung cho mọi truy vấn Khu vực 4/3.
   -------------------------------------------------------------------------
   Publishable key — an toàn để lộ ở client theo thiết kế Supabase (dữ liệu
   bảo vệ bằng RLS, không phải bằng giấu key). CÙNG dự án Supabase với
   `test/cau-hinh.js` — 3 bảng tham chiếu (mon_an, dinh_duong_mon_an,
   quan_an) đã đổi tên cột snake_case 05/08/2026, xem sql/1-dong-bo-*.sql.
   ========================================================================= */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hkwotpiaujevorjjgeoc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_-7nX2-zGndSOCJ4ocsVzLQ_ZIeXjHzA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/* Trần số dòng xin về mỗi bảng — cùng lý do với test/cau-hinh.js
   (GIOI_HAN_DONG): tầng REST tự cắt bớt ở một ngưỡng mặc định KHÔNG báo
   lỗi. Cao hơn dữ liệu thật rất nhiều (hiện ~101 dòng mon_an). */
export const GIOI_HAN_DONG = 5000

/* Hạn chót chờ mạng — cùng giá trị đã đo thật ở test/du-lieu.js. */
export const THOI_GIAN_CHO_TOI_DA_MS = 20000
