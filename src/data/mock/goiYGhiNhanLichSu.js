/* =========================================================================
   TRẠNG THÁI SỐNG — bảng `goi_y_ghi_nhan` (Khu vực 3, nhật ký CÁ NHÂN)
   -------------------------------------------------------------------------
   Nuôi 2 việc, cả hai đều CHỈ của học sinh đang xem (khác
   `goi_y_chon_mon_an_danh` — đếm gộp ẩn danh toàn trường cho "Đề xuất nổi
   bật", đọc thẳng qua Supabase trong api.js, không đi qua file này):
     (1) Chống spam 2 tầng ("Ăn gì hôm nay" §6.3, dùng chung "Quán ăn gần
         đây" §5) — đếm số lần CHÍNH học sinh này bấm "Đã ăn món này".
     (2) Lịch sử cá nhân ở trang Lịch sử/Phân tích.

   Từ 07/08/2026: CongDuLieu.jsx nạp dữ liệu THẬT từ bảng goi_y_ghi_nhan
   trên Supabase vào mảng này lúc mở app (mutate tại chỗ, giống
   DANH_SACH_MON/TRANG_THAI) — mảng bắt đầu RỖNG ở đây, không còn seed dữ
   liệu giả nhiều-học-sinh như trước (từng cần để mô phỏng "đếm gộp toàn
   trường", nay việc đó đã chuyển hẳn sang goi_y_chon_mon_an_danh thật).
   ========================================================================= */

export const LICH_SU_GOI_Y_GHI_NHAN = []

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
