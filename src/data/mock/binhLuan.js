/* =========================================================================
   DỮ LIỆU GIẢ — Bình luận & đánh giá 5 sao theo món
   -------------------------------------------------------------------------
   ⚠ Tính năng riêng, thêm 29/7 theo yêu cầu trực tiếp — KHÔNG thuộc 6 khu
     vực lưu trữ đã có trong "Cơ sở dữ liệu lưu trữ" (tài liệu đó mới làm
     đầy đủ Khu vực 2 và 3; Khu vực 4 — Quán & Món — còn ở dạng tổng quan).
     Khi làm chi tiết Khu vực 4, cần bổ sung 2 bảng: binh_luan_mon và
     danh_gia_mon, dùng đúng field ở đây làm nháp.

   Bình luận hiển thị TÊN ẢO (ten_ao) của học sinh đang đăng — không phải
   tên thật hay mã 6 số — đúng nguyên tắc định danh giả (R-13, R-26) đã áp
   dụng xuyên suốt hệ thống.

   Toàn bộ state dưới đây sống trong bộ nhớ phiên, mất khi tải lại trang —
   giống mọi state demo khác trong lớp mock/ (xem loTrinh.js).
   ========================================================================= */

let dem = 0
const idMoi = (tienTo) => `${tienTo}-${Date.now()}-${dem++}`

export const DANH_SACH_BINH_LUAN = [
  { id: 'bl01', mon_id: 'm01', ten_hien_thi: 'Mèo Lười', noi_dung: 'Sườn nướng thơm, không bị khô. Ăn no tới chiều luôn.', thoi_gian: '2026-07-27T11:20:00' },
  { id: 'bl02', mon_id: 'm01', ten_hien_thi: 'Gấu Trúc 8A', noi_dung: 'Hơi mặn so với lần trước nhưng vẫn ngon.', thoi_gian: '2026-07-28T12:05:00' },
  { id: 'bl03', mon_id: 'm04', ten_hien_thi: 'Cú Đêm', noi_dung: 'Cay ghê, ai sợ cay nhớ dặn trước.', thoi_gian: '2026-07-26T17:40:00' },
  { id: 'bl04', mon_id: 'm09', ten_hien_thi: 'Sóc Nâu', noi_dung: 'Riêu cua nhiều gạch, thích món này nhất căng tin.', thoi_gian: '2026-07-25T11:00:00' },
  { id: 'bl05', mon_id: 'm09', ten_hien_thi: 'Mèo Lười', noi_dung: 'Đồng ý, quán Bà Tư làm bún riêu ngon nhất khu này.', thoi_gian: '2026-07-25T11:30:00' },
  { id: 'bl06', mon_id: 'm16', ten_hien_thi: 'Voi Con', noi_dung: 'Đậu hũ sốt cà chay mà đậm đà, không hề nhạt.', thoi_gian: '2026-07-24T13:15:00' },
]

/** Mới nhất trước — hội thoại đọc từ trên xuống thấy bình luận gần đây nhất. */
export const layBinhLuanTheoMon = (mon_id) =>
  DANH_SACH_BINH_LUAN
    .filter((b) => b.mon_id === mon_id)
    .sort((a, b) => new Date(b.thoi_gian) - new Date(a.thoi_gian))

export const themBinhLuan = (mon_id, ten_hien_thi, noi_dung) => {
  const dong = {
    id: idMoi('bl'),
    mon_id,
    ten_hien_thi: ten_hien_thi || 'Học sinh ẩn danh',
    noi_dung,
    thoi_gian: new Date().toISOString(),
  }
  DANH_SACH_BINH_LUAN.push(dong)
  return dong
}

/* --- Đánh giá 5 sao ------------------------------------------------------
   Lưu TỔNG SỐ SAO + SỐ LƯỢT để tính trung bình, không lưu mảng đầy đủ từng
   lượt — đủ dùng cho demo. Chỉ vài món có sẵn đánh giá mock, món còn lại
   trả về "chưa có đánh giá" để UI thấy đủ 2 trạng thái. */
export const TONG_HOP_DANH_GIA = {
  m01: { tong_sao: 187, so_luot: 42 },
  m04: { tong_sao: 121, so_luot: 27 },
  m09: { tong_sao: 98, so_luot: 21 },
  m16: { tong_sao: 65, so_luot: 15 },
}

// Sao học sinh đang xem đã tự gửi cho từng món, trong phiên này — dùng để
// SỬA lượt cũ khi bấm lại (không cộng thêm lượt, tránh phóng đại điểm).
const saoDaGuiCuaToi = new Map()

export const layDanhGiaTheoMon = (mon_id) => {
  const th = TONG_HOP_DANH_GIA[mon_id]
  return {
    trung_binh: th && th.so_luot > 0 ? th.tong_sao / th.so_luot : null,
    so_luot: th?.so_luot ?? 0,
    sao_cua_toi: saoDaGuiCuaToi.get(mon_id) ?? null,
  }
}

export const guiDanhGiaMon = (mon_id, so_sao) => {
  if (!TONG_HOP_DANH_GIA[mon_id]) TONG_HOP_DANH_GIA[mon_id] = { tong_sao: 0, so_luot: 0 }
  const th = TONG_HOP_DANH_GIA[mon_id]
  const saoTruoc = saoDaGuiCuaToi.get(mon_id)

  if (saoTruoc == null) {
    th.tong_sao += so_sao
    th.so_luot += 1
  } else {
    th.tong_sao += so_sao - saoTruoc
  }
  saoDaGuiCuaToi.set(mon_id, so_sao)
}
