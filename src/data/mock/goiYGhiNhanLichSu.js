/* =========================================================================
   DỮ LIỆU GIẢ — Lịch sử bảng `goi_y_ghi_nhan` (Khu vực 3)
   -------------------------------------------------------------------------
   Nuôi hai thứ:
     (1) Khối "Đề xuất nổi bật" — "Ăn gì hôm nay" §2.1: "5 thẻ — món được
         chọn nhiều nhất trong 7 ngày qua. Đếm gộp TOÀN BỘ học sinh, ẩn danh,
         không cá nhân hoá theo người đang xem. Là COUNT trực tiếp trên
         goi_y_ghi_nhan." → cần dữ liệu của NHIỀU học sinh khác nhau, không
         chỉ học sinh đang đăng nhập.
     (2) Chống spam 2 tầng ("Ăn gì hôm nay" §6.3, dùng chung với
         "Quán ăn gần đây" §5) — cần lịch sử CỦA RIÊNG học sinh hiện tại
         để đếm số lần bấm "Đã ăn món này" gần đây.

   ⚠ DỮ LIỆU DEMO — các mã học sinh 1000xx dưới đây là học sinh KHÁC (không
     phải học sinh đang đăng nhập, mã 482913) để mô phỏng "đếm gộp toàn bộ
     học sinh". Danh sách của CHÍNH học sinh đang đăng nhập bắt đầu rỗng và
     được thêm vào khi tương tác thật trong lúc dùng thử giao diện (qua
     themGoiYGhiNhan) — mất khi tải lại trang, đúng bản chất của lớp mock.
   ========================================================================= */

const T = (soNgayTruoc, gio) => {
  const d = new Date()
  d.setDate(d.getDate() - soNgayTruoc)
  d.setHours(gio, 0, 0, 0)
  return d.toISOString()
}

/* Số lần chọn mỗi món trong 7 ngày qua (chủ ý phân bố không đều để khối
   "Đề xuất nổi bật" có thứ hạng rõ ràng khi xem thử):
     m01: 8 · m16: 6 · m09: 5 · m04: 4 · m14: 3 · m07: 2 · m03: 2 · m11: 1 */
export const LICH_SU_GOI_Y_GHI_NHAN = [
  { id: 'gy-h01', ma_hoc_sinh: '100001', mon_id: 'm01', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(0, 11) },
  { id: 'gy-h02', ma_hoc_sinh: '100002', mon_id: 'm01', nguon: 'goi_y_nhanh', thoi_gian_ghi_nhan: T(0, 18) },
  { id: 'gy-h03', ma_hoc_sinh: '100003', mon_id: 'm01', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(1, 12) },
  { id: 'gy-h04', ma_hoc_sinh: '100004', mon_id: 'm01', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(1, 19) },
  { id: 'gy-h05', ma_hoc_sinh: '100005', mon_id: 'm01', nguon: 'goi_y_nhanh', thoi_gian_ghi_nhan: T(2, 12) },
  { id: 'gy-h06', ma_hoc_sinh: '100006', mon_id: 'm01', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(3, 11) },
  { id: 'gy-h07', ma_hoc_sinh: '100007', mon_id: 'm01', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(4, 12) },
  { id: 'gy-h08', ma_hoc_sinh: '100008', mon_id: 'm01', nguon: 'goi_y_nhanh', thoi_gian_ghi_nhan: T(5, 13) },

  { id: 'gy-h09', ma_hoc_sinh: '100002', mon_id: 'm16', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(0, 12) },
  { id: 'gy-h10', ma_hoc_sinh: '100003', mon_id: 'm16', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(1, 13) },
  { id: 'gy-h11', ma_hoc_sinh: '100009', mon_id: 'm16', nguon: 'goi_y_nhanh', thoi_gian_ghi_nhan: T(2, 12) },
  { id: 'gy-h12', ma_hoc_sinh: '100010', mon_id: 'm16', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(3, 12) },
  { id: 'gy-h13', ma_hoc_sinh: '100011', mon_id: 'm16', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(4, 19) },
  { id: 'gy-h14', ma_hoc_sinh: '100012', mon_id: 'm16', nguon: 'goi_y_nhanh', thoi_gian_ghi_nhan: T(6, 12) },

  { id: 'gy-h15', ma_hoc_sinh: '100001', mon_id: 'm09', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(0, 19) },
  { id: 'gy-h16', ma_hoc_sinh: '100004', mon_id: 'm09', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(1, 20) },
  { id: 'gy-h17', ma_hoc_sinh: '100013', mon_id: 'm09', nguon: 'goi_y_nhanh', thoi_gian_ghi_nhan: T(3, 19) },
  { id: 'gy-h18', ma_hoc_sinh: '100014', mon_id: 'm09', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(4, 20) },
  { id: 'gy-h19', ma_hoc_sinh: '100015', mon_id: 'm09', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(5, 19) },

  { id: 'gy-h20', ma_hoc_sinh: '100005', mon_id: 'm04', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(0, 12) },
  { id: 'gy-h21', ma_hoc_sinh: '100006', mon_id: 'm04', nguon: 'goi_y_nhanh', thoi_gian_ghi_nhan: T(2, 12) },
  { id: 'gy-h22', ma_hoc_sinh: '100007', mon_id: 'm04', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(4, 13) },
  { id: 'gy-h23', ma_hoc_sinh: '100008', mon_id: 'm04', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(6, 12) },

  { id: 'gy-h24', ma_hoc_sinh: '100009', mon_id: 'm14', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(1, 7) },
  { id: 'gy-h25', ma_hoc_sinh: '100010', mon_id: 'm14', nguon: 'goi_y_nhanh', thoi_gian_ghi_nhan: T(3, 19) },
  { id: 'gy-h26', ma_hoc_sinh: '100011', mon_id: 'm14', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(5, 7) },

  { id: 'gy-h27', ma_hoc_sinh: '100012', mon_id: 'm07', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(2, 6) },
  { id: 'gy-h28', ma_hoc_sinh: '100013', mon_id: 'm07', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(5, 15) },

  { id: 'gy-h29', ma_hoc_sinh: '100014', mon_id: 'm03', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(2, 13) },
  { id: 'gy-h30', ma_hoc_sinh: '100015', mon_id: 'm03', nguon: 'goi_y_nhanh', thoi_gian_ghi_nhan: T(6, 13) },

  { id: 'gy-h31', ma_hoc_sinh: '100001', mon_id: 'm11', nguon: 'tu_chon',      thoi_gian_ghi_nhan: T(3, 7) },
]

/** Thêm một dòng ghi nhận mới (mutate mảng — chỉ dùng nội bộ src/data/api.js). */
export const themGoiYGhiNhan = (dong) => {
  LICH_SU_GOI_Y_GHI_NHAN.push(dong)
}

/** R-14/R-25 — rút đồng ý & xoá dữ liệu: xoá THẬT mọi dòng của đúng
 *  ma_hoc_sinh này, giữ nguyên dữ liệu của các học sinh khác (phục vụ
 *  khối "Đề xuất nổi bật" đếm gộp toàn trường, không phải dữ liệu cá
 *  nhân của người bị xoá). */
export const xoaGhiNhanCuaHocSinh = (maHocSinh) => {
  const conLai = LICH_SU_GOI_Y_GHI_NHAN.filter((g) => g.ma_hoc_sinh !== maHocSinh)
  LICH_SU_GOI_Y_GHI_NHAN.length = 0
  LICH_SU_GOI_Y_GHI_NHAN.push(...conLai)
}

/** Lịch sử §5 — xoá THẬT một dòng theo id (khác xoaGhiNhanCuaHocSinh, vốn
 *  xoá TOÀN BỘ theo mã học sinh — dùng cho Cài đặt §3.3.2). */
export const xoaMotDongGoiY = (id) => {
  const i = LICH_SU_GOI_Y_GHI_NHAN.findIndex((g) => g.id === id)
  if (i >= 0) LICH_SU_GOI_Y_GHI_NHAN.splice(i, 1)
}
