/* =========================================================================
   KHU VỰC TRƯỜNG HỌC — bảng `danh_sach_truong` trên Supabase
   (sql/9-tao-bang-truong-hoc.sql). Danh sách CỐ ĐỊNH, không hardcode ở đây
   — sửa/thêm/bớt trường thì sửa thẳng dữ liệu Supabase, không cần đổi code.

   hoc_sinh.truong_hoc CHỈ ghi 1 LẦN (lúc chưa có giá trị) — không có hàm
   "sửa lại" ở đây, cố ý: UI (ChonTruongHoc.jsx/HoSo.jsx) không bao giờ hiện
   ô sửa sau khi đã chọn, đây là lớp bảo vệ ở tầng UI, khớp mô hình tin cậy
   hiện tại của cả dự án (giống mã 6 số — cũng chỉ khoá ở UI, không có
   trigger CSDL chặn cứng). */

import { supabase, THOI_GIAN_CHO_TOI_DA_MS, GIOI_HAN_DONG } from './client.js'
import { luuHoSo } from './khoHoSo.js'

function timeoutSauMs(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Hết thời gian chờ Supabase (danh sách trường).')), ms)
  })
}

/** Tải danh sách trường — trả { ok:true, danhSach } hoặc { ok:false, loi }.
 *  danhSach: [{ ma, ten_truong }], sắp theo ten_truong cho dropdown dễ dò. */
export async function taiDanhSachTruong() {
  try {
    const { data, error, count } = await Promise.race([
      supabase.from('danh_sach_truong').select('*', { count: 'exact' }).limit(GIOI_HAN_DONG),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (error) return { ok: false, loi: `Không tải được danh sách trường: ${error.message}` }
    if (count != null && count > data.length) {
      return { ok: false, loi: 'Danh sách trường bị cắt bớt (chạm trần số dòng) — báo cho quản trị viên.' }
    }
    const danhSach = [...data].sort((a, b) => a.ten_truong.localeCompare(b.ten_truong, 'vi'))
    return { ok: true, danhSach }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}

/** Ghi trường học lần đầu cho hồ sơ hiện tại — mutate hoSo TẠI CHỖ (cùng
 *  quy ước với các hàm ghi khác trong dự án) rồi gọi luuHoSo() có sẵn, đúng
 *  hình dạng cột (upsert nguyên dòng). Nơi gọi (ChonTruongHoc.jsx) chịu
 *  trách nhiệm không gọi lại hàm này nếu hoSo.truong_hoc đã có giá trị. */
export function chonTruongHocLanDau(hoSo, maTruong) {
  hoSo.truong_hoc = maTruong
  luuHoSo(hoSo)
}
