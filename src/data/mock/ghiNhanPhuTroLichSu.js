/* =========================================================================
   TRẠNG THÁI SỐNG — bảng `phu_tro_ghi_nhan` (lịch sử CÁ NHÂN, thực phẩm
   bổ sung đã ăn/uống). Cùng khuôn goiYGhiNhanLichSu.js (goi_y_ghi_nhan) —
   CongDuLieu.jsx nạp dữ liệu thật từ Supabase vào mảng này lúc mở app.

   ⚠ Khác goi_y_ghi_nhan: id CSDL TỰ SINH (bigint identity, sql/15) chứ
   KHÔNG phải id client tự đặt — vì vậy KHÔNG có hàm "thêm optimistic
   trước, gửi Supabase sau" ở đây. Chỉ đẩy vào mảng SAU KHI Supabase trả
   về dòng thật (có id thật) — xem supabase/khoGhiNhanPhuTro.js. */

export const LICH_SU_GHI_NHAN_PHU_TRO = []

/** Thêm một dòng ghi nhận MỚI (đã có id thật từ Supabase) — mutate mảng,
 *  chỉ dùng nội bộ src/data/api.js. */
export const themGhiNhanPhuTro = (dong) => {
  LICH_SU_GHI_NHAN_PHU_TRO.push(dong)
}

/** R-14/R-25 — rút đồng ý & xoá dữ liệu: xoá cục bộ mọi dòng của đúng
 *  ma_hoc_sinh này. */
export const xoaGhiNhanPhuTroCuaHocSinh = (maHocSinh) => {
  const conLai = LICH_SU_GHI_NHAN_PHU_TRO.filter((g) => g.ma_hoc_sinh !== maHocSinh)
  LICH_SU_GHI_NHAN_PHU_TRO.length = 0
  LICH_SU_GHI_NHAN_PHU_TRO.push(...conLai)
}

/** Lịch sử §5 — xoá cục bộ một dòng theo id. */
export const xoaMotDongGhiNhanPhuTro = (id) => {
  const i = LICH_SU_GHI_NHAN_PHU_TRO.findIndex((g) => g.id === id)
  if (i >= 0) LICH_SU_GHI_NHAN_PHU_TRO.splice(i, 1)
}
