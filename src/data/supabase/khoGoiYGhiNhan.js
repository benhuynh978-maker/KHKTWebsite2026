/* =========================================================================
   KHU VỰC 3 (nhật ký cá nhân) THẬT — bảng `goi_y_ghi_nhan` trên Supabase
   (sql/5-tao-bang-goi-y-ghi-nhan.sql). Thay thế mảng mock
   LICH_SU_GOI_Y_GHI_NHAN ở src/data/mock/goiYGhiNhanLichSu.js khi
   CongDuLieu.jsx gọi taiGoiYGhiNhan() lúc mở app — mutate mảng đó TẠI CHỖ
   (giống khoVi4.js/khoLoTrinh.js), nhờ vậy các hàm sync có sẵn trong
   api.js (kiemTraGioiHanTuChon, layGhiNhanGoiYHomNay, layLichSuHopNhat...)
   không cần sửa gì.

   ⚠ Khác `goi_y_chon_mon_an_danh` (đếm gộp ẩn danh toàn trường, không
   ma_hoc_sinh) — bảng này CÓ ma_hoc_sinh, chỉ tải/ghi đúng của học sinh
   đang dùng trình duyệt này. Xem ghi chú đầu sql/5-...sql. */

import { supabase, THOI_GIAN_CHO_TOI_DA_MS, GIOI_HAN_DONG } from './client.js'

function timeoutSauMs(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Hết thời gian chờ Supabase (gợi ý nhanh).')), ms)
  })
}

/** Toàn bộ goi_y_ghi_nhan của một học sinh — dùng cho chống-spam + Lịch sử
 *  + Phân tích. Trả về { ok:false, loi } nếu lỗi mạng, KHÔNG âm thầm coi
 *  lỗi là "chưa từng ghi nhận gì". */
export async function taiGoiYGhiNhan(ma6So) {
  try {
    const { data, error, count } = await Promise.race([
      supabase.from('goi_y_ghi_nhan').select('*', { count: 'exact' })
        .eq('ma_hoc_sinh', ma6So).limit(GIOI_HAN_DONG).order('thoi_gian_ghi_nhan', { ascending: true }),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (error) return { ok: false, loi: `Không tải được lịch sử gợi ý: ${error.message}` }
    if (count != null && count > data.length) {
      return { ok: false, loi: 'Dữ liệu gợi ý bị cắt bớt (chạm trần số dòng) — báo cho quản trị viên.' }
    }
    return { ok: true, rows: data }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}

/** Ghi nhận "Đã ăn món này" (nguồn tu_chon) hoặc gợi ý nhanh — fire-and-
 *  forget, gọi SAU khi đã themGoiYGhiNhan() cục bộ. */
export function luuGoiYGhiNhan(dong) {
  supabase.from('goi_y_ghi_nhan').insert(dong).then(({ error }) => {
    if (error) console.error(error)
  })
}

/** Lịch sử §5 — xoá 1 dòng theo id. */
export function xoaMotGoiYGhiNhan(id) {
  supabase.from('goi_y_ghi_nhan').delete().eq('id', id).then(({ error }) => {
    if (error) console.error(error)
  })
}

/** Cài đặt §3.3.2 — R-14/R-25, xoá TOÀN BỘ của đúng 1 học sinh. */
export function xoaToanBoGoiYCuaHocSinh(ma6So) {
  supabase.from('goi_y_ghi_nhan').delete().eq('ma_hoc_sinh', ma6So).then(({ error }) => {
    if (error) console.error(error)
  })
}
