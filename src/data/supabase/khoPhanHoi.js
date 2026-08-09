/* =========================================================================
   Bảng `phan_hoi_ho_tro` trên Supabase (sql/7-tao-bang-phan-hoi-ho-tro.sql)
   — nối nút "Gửi phản hồi" ở Cài đặt. Chỉ GHI, không có trang nào đọc lại
   trên Website (nhóm nghiên cứu xem trực tiếp qua Supabase khi cần). */

import { supabase } from './client.js'

/** Fire-and-forget — lỗi mạng ở đây không nên chặn màn "Đã gửi. Cảm ơn
 *  bạn!" hiện ngay trên giao diện (cùng quy ước với các ghi-nền khác:
 *  đây không phải hành động cần xác nhận thành công tức thời). */
export function guiPhanHoiHoTro(moTa, maSoTuyChon) {
  supabase.from('phan_hoi_ho_tro').insert({
    id: `ph-${Date.now()}`,
    mo_ta: moTa,
    ma_so_tuy_chon: maSoTuyChon?.trim() || null,
  }).then(({ error }) => { if (error) console.error(error) })
}
