/* =========================================================================
   LỊCH SỬ GHI NHẬN PHỤ TRỢ THẬT — bảng `phu_tro_ghi_nhan` (sql/15 +
   sql/17-them-ma-hoc-sinh-...sql, BẮT BUỘC chạy sql/17 trước khi dùng file
   này — nếu chưa chạy, insert sẽ lỗi vì cột ma_hoc_sinh chưa tồn tại).

   ⚠ luuGhiNhanPhuTro() KHÔNG fire-and-forget như luuGoiYGhiNhan() (Khu vực
   3, goi_y_ghi_nhan) — id của goi_y_ghi_nhan do CLIENT tự sinh
   (`gy-${Date.now()}`) nên ghi cục bộ trước, gửi Supabase ngầm sau được;
   id của phu_tro_ghi_nhan do CSDL TỰ SINH (bigint identity), client không
   biết trước — PHẢI await insert rồi lấy dòng thật (.select().single())
   mới có id để hiện ở Lịch sử/cho phép xoá. Nơi gọi (api.js) phải hiện
   trạng thái "đang lưu" trong lúc chờ, không thể lạc quan như nút "Đã ăn
   món này" của món chính. */

import { supabase, THOI_GIAN_CHO_TOI_DA_MS, GIOI_HAN_DONG } from './client.js'

function timeoutSauMs(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Hết thời gian chờ Supabase (ghi nhận phụ trợ).')), ms)
  })
}

/** Toàn bộ phu_tro_ghi_nhan của một học sinh — dùng cho trang Lịch sử. */
export async function taiGhiNhanPhuTro(ma6So) {
  try {
    const { data, error, count } = await Promise.race([
      supabase.from('phu_tro_ghi_nhan').select('*', { count: 'exact' })
        .eq('ma_hoc_sinh', ma6So).limit(GIOI_HAN_DONG).order('thoi_gian_ghi_nhan', { ascending: true }),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (error) return { ok: false, loi: `Không tải được lịch sử ghi nhận phụ trợ: ${error.message}` }
    if (count != null && count > data.length) {
      return { ok: false, loi: 'Dữ liệu ghi nhận phụ trợ bị cắt bớt (chạm trần số dòng) — báo cho quản trị viên.' }
    }
    return { ok: true, rows: data }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}

/** Ghi "đã ăn/uống" 1 sản phẩm phụ trợ — PHẢI await, trả về dòng thật (có
 *  id CSDL) để nơi gọi tự đẩy vào mảng cục bộ sau khi thành công. */
export async function luuGhiNhanPhuTro(dong) {
  const { data, error } = await supabase.from('phu_tro_ghi_nhan').insert(dong).select().single()
  if (error) return { ok: false, loi: `Ghi nhận thất bại: ${error.message}` }
  return { ok: true, dong: data }
}

/** Lịch sử §5 — xoá 1 dòng theo id. */
export function xoaMotGhiNhanPhuTro(id) {
  supabase.from('phu_tro_ghi_nhan').delete().eq('id', id).then(({ error }) => {
    if (error) console.error(error)
  })
}

/** Cài đặt §3.3.2 — R-14/R-25, xoá TOÀN BỘ của đúng 1 học sinh. Trả
 *  { ok, loi } — xoaToanBoDuLieu() (api.js) await để biết chắc đã xoá
 *  thật hay chưa trước khi báo "đã xoá" cho học sinh (15/08/2026). */
export async function xoaToanBoGhiNhanPhuTroCuaHocSinh(ma6So) {
  const { error } = await supabase.from('phu_tro_ghi_nhan').delete().eq('ma_hoc_sinh', ma6So)
  if (error) return { ok: false, loi: `Không xoá được ghi nhận phụ trợ: ${error.message}` }
  return { ok: true }
}
