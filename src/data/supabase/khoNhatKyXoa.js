/* =========================================================================
   KHU VỰC 6 — bảng `nhat_ky_xoa` trên Supabase (sql/6-tao-bang-nhat-ky-
   xoa.sql). Chỉ GHI, không có trang nào đọc lại — audit trail cho R-14/
   R-25 (yêu cầu xoá dữ liệu), xem trực tiếp qua Supabase khi cần, không
   qua giao diện Website. */

import { supabase } from './client.js'

/** Gọi TRƯỚC khi xoaToanBoDuLieu() thực sự xoá — ghi lại rằng đúng thời
 *  điểm này, đúng học sinh này, đã yêu cầu xoá. Fire-and-forget: một audit
 *  log không nên làm chậm hay chặn thao tác xoá chính. */
export function ghiNhatKyXoa(ma6So) {
  supabase.from('nhat_ky_xoa').insert({
    id: `xoa-${Date.now()}`,
    ma_hoc_sinh: ma6So,
    pham_vi: 'toan_bo',
  }).then(({ error }) => { if (error) console.error(error) })
}
