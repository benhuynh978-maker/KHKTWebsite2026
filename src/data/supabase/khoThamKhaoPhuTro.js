/* =========================================================================
   THỰC PHẨM THAM KHẢO THẬT — tải bảng thuc_pham_tham_khao từ Supabase
   (sql/12-tao-bang-thuc-pham-phu-tro.sql, sql/13-nhap-du-lieu-...sql).
   Chuyển sang hình dạng field khớp mon (kcal/canxi_mg/sat_mg/kem_mg) để
   lib/goiYBoSung.js dùng chung công thức với món chính, và giữ NGUYÊN tên
   cột thanh_phan_di_ung để lib/diUng.js:monAnToanChoDiUng() dùng lại thẳng,
   không cần viết bộ lọc dị ứng riêng.

   Bảng này KHÔNG có cờ duyệt (đội dự án tự nhập qua Table Editor, không có
   cơ chế học sinh gửi — khác san_pham_phu_tro) nên không cần lọc
   trang_thai_duyet như mon_an. Chỉ dùng cho gợi ý bổ sung TỰ ĐỘNG — "Ghi
   nhận" thật (chọn sản phẩm có thương hiệu) chưa port sang Website, xem kế
   hoạch di dời 13/08/2026.

   Cùng bộ an toàn đã dùng ở khoVi4.js: count:'exact' để phát hiện bị cắt
   bớt, Promise.race với hạn chót mạng. Lỗi tải KHÔNG chặn app — nơi gọi
   (CongDuLieu.jsx) coi rỗng là "không có gợi ý bổ sung", vì tính năng này
   hoàn toàn tuỳ chọn, giống chính sách đã dùng ở test/du-lieu.js. */

import { supabase, GIOI_HAN_DONG, THOI_GIAN_CHO_TOI_DA_MS } from './client.js'

const TEN_BANG = 'thuc_pham_tham_khao'

function kiemTraDayDu(ketQua) {
  if (ketQua.error) {
    console.error(ketQua.error)
    return `Không tải được dữ liệu từ Supabase (bảng "${TEN_BANG}"): ${ketQua.error.message}`
  }
  if (typeof ketQua.count === 'number' && ketQua.data.length < ketQua.count) {
    return `Bảng "${TEN_BANG}" có ${ketQua.count} dòng nhưng chỉ tải về được ${ketQua.data.length} — dữ liệu bị cắt bớt. Cần nới GIOI_HAN_DONG (client.js) trước khi dùng tiếp.`
  }
  return null
}

/** Tải danh sách thực phẩm tham khảo. Trả { ok:true, danhSach } hoặc
 *  { ok:false, loi }. KHÔNG mutate gì — nơi gọi tự quyết định ghi vào đâu. */
export async function taiThamKhaoPhuTro() {
  let ketQua
  let idHetGio
  try {
    const hetGio = new Promise((_, tuChoi) => {
      idHetGio = setTimeout(
        () => tuChoi(new Error(`Không phản hồi sau ${THOI_GIAN_CHO_TOI_DA_MS / 1000}s`)),
        THOI_GIAN_CHO_TOI_DA_MS,
      )
    })
    ketQua = await Promise.race([
      supabase.from(TEN_BANG).select('*', { count: 'exact' }).limit(GIOI_HAN_DONG),
      hetGio,
    ])
    clearTimeout(idHetGio)
  } catch (err) {
    clearTimeout(idHetGio)
    console.error(err)
    return { ok: false, loi: `Không tải được dữ liệu — lỗi mạng hoặc mạng quá chậm. Kiểm tra kết nối rồi thử lại. Chi tiết: ${err.message}` }
  }

  const loi = kiemTraDayDu(ketQua)
  if (loi) return { ok: false, loi }

  const danhSach = ketQua.data.map((row) => ({
    id: row.ma_thuc_pham,
    ten: row.ten,
    khoi_luong: Number(row.khoi_luong) || 0,
    don_vi: row.don_vi,
    kcal: Number(row.nang_luong_kcal) || 0,
    canxi_mg: Number(row.canxi_mg) || 0,
    sat_mg: Number(row.sat_mg) || 0,
    kem_mg: Number(row.kem_mg) || 0,
    // KHÔNG ép về [] — null nghĩa CHƯA gắn nhãn, khác [] (đã kiểm, sạch).
    // Xem lib/diUng.js.
    thanh_phan_di_ung: row.thanh_phan_di_ung,
  }))

  return { ok: true, danhSach }
}
