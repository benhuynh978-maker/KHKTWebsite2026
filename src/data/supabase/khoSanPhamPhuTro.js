/* =========================================================================
   SẢN PHẨM PHỤ TRỢ THẬT — tải bảng san_pham_phu_tro từ Supabase (sql/12).
   Dùng CHO luồng "Ghi nhận" thật (tìm kiếm/chọn sản phẩm đã ăn/uống) —
   KHÁC khoThamKhaoPhuTro.js (chỉ dùng cho gợi ý bổ sung tự động).

   ⚠ BẮT BUỘC lọc .eq('da_duyet', true) — bảng này CÓ cơ chế học sinh tự
   gửi (trạng thái mặc định 'cho_duyet'/da_duyet=false, xem sql/12), khác
   thuc_pham_tham_khao (đội dự án tự nhập, không có cờ duyệt). Đã ghi rõ
   yêu cầu này trong chính comment của sql/12 khi viết bảng — đừng bỏ sót
   như đã từng cảnh báo ở đó.

   Cùng bộ an toàn khoVi4.js: count:'exact' phát hiện cắt bớt, Promise.race
   hạn chót mạng. Lỗi tải KHÔNG chặn app — tính năng "Ghi nhận" tuỳ chọn,
   coi rỗng là "chưa có sản phẩm nào để chọn". */

import { supabase, GIOI_HAN_DONG, THOI_GIAN_CHO_TOI_DA_MS } from './client.js'

const TEN_BANG = 'san_pham_phu_tro'

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

/** Tải danh sách sản phẩm phụ trợ ĐÃ DUYỆT. Trả { ok:true, danhSach } hoặc
 *  { ok:false, loi }. KHÔNG mutate gì — nơi gọi tự quyết định ghi vào đâu. */
export async function taiSanPhamPhuTro() {
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
      supabase.from(TEN_BANG).select('*', { count: 'exact' }).eq('da_duyet', true).limit(GIOI_HAN_DONG),
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
    id: row.ma_san_pham,
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
