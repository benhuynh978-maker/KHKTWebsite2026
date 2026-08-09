/* =========================================================================
   BẢNG TRA MỤC TIÊU DINH DƯỠNG THẬT — bảng `Dinh_Duong_Muc_Tieu` trên
   Supabase (sql/tao-bang-dinh-duong-muc-tieu.sql), 18 dòng kcal/canxi/sắt/
   kẽm theo giới + điều kiện, nhóm tuổi 15-19. Thay các hằng số tĩnh trong
   `lib/traBangDinhDuong.js` — bảng đó VẪN giữ giá trị hiện tại làm mặc
   định/dự phòng, file này chỉ TẢI rồi nơi gọi (CongDuLieu.jsx) tự ghi đè.

   ⚠ KHÔNG có đạm/glucid/lipid trong bảng này (RDA gốc chỉ có 4 chỉ số) —
   `traBangDinhDuong.js` vẫn tự tính riêng, không đụng ở đây. */

import { supabase, THOI_GIAN_CHO_TOI_DA_MS, GIOI_HAN_DONG } from './client.js'

const TEN_BANG = 'Dinh_Duong_Muc_Tieu'

function timeoutSauMs(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Hết thời gian chờ Supabase (mục tiêu dinh dưỡng).')), ms)
  })
}

// DB dùng dieu_kien snake_case ('trung_binh') cho sắt; hồ sơ học sinh
// (hap_thu_sat) và code hiện có dùng camelCase ('trungBinh') — chỉ sắt
// lệch quy ước, kcal/kẽm đã trùng sẵn ('thap'/'vua'/'cao', 'kem'/'vua'/'tot').
const DOI_DIEU_KIEN_SAT = { trung_binh: 'trungBinh', cao: 'cao' }

/** Tải bảng Dinh_Duong_Muc_Tieu — trả { ok:true, bang } hoặc
 *  { ok:false, loi }. `bang` có hình dạng { kcal, canxi, sat, kem }, mỗi
 *  chỉ số là { nam:{...}, nu:{...} } — khớp hình dạng BANG_MUC_TIEU ở
 *  traBangDinhDuong.js. KHÔNG mutate gì — nơi gọi tự quyết định ghi đè. */
export async function taiBangMucTieuDinhDuong() {
  try {
    const { data, error, count } = await Promise.race([
      supabase.from(TEN_BANG).select('*', { count: 'exact' }).limit(GIOI_HAN_DONG),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (error) return { ok: false, loi: `Không tải được bảng mục tiêu dinh dưỡng: ${error.message}` }
    if (count != null && count > data.length) {
      return { ok: false, loi: 'Bảng mục tiêu dinh dưỡng bị cắt bớt (chạm trần số dòng) — báo cho quản trị viên.' }
    }

    const bang = { kcal: { nam: {}, nu: {} }, canxi: { nam: {}, nu: {} }, sat: { nam: {}, nu: {} }, kem: { nam: {}, nu: {} } }
    for (const dong of data) {
      const dieuKien = dong.chi_so === 'sat' ? (DOI_DIEU_KIEN_SAT[dong.dieu_kien] ?? dong.dieu_kien) : dong.dieu_kien
      bang[dong.chi_so][dong.gioi][dieuKien] = Number(dong.gia_tri)
    }
    return { ok: true, bang }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}
