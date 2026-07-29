/* =========================================================================
   R-08 + R-09 — NHÃN TRẠNG THÁI BỮA ĂN
   -------------------------------------------------------------------------
   Bốn nhãn: Trong lộ trình · Ngoài lộ trình · Gợi ý nhanh · Tự chọn
   (đổi tên 29/7: "Trong khung" → "Trong lộ trình", "Ngoài kế hoạch" →
   "Ngoài lộ trình" — chỉ đổi CHỮ hiển thị, key nội bộ trong_khung/
   ngoai_ke_hoach giữ nguyên để không phải sửa logic lọc/so khớp ở nơi khác.)

   CẢ BỐN DÙNG CHUNG MỘT MÀU CHỮ TRUNG TÍNH.
   Component này cố ý KHÔNG nhận prop màu / biến thể / mức độ.

   Lý do (Lịch sử §7.1): rủi ro không nằm ở một dòng đơn lẻ mà ở cấp độ
   DANH SÁCH. Một dòng "Ngoài lộ trình" thì trung tính; nhưng nhìn cả một
   danh sách dài ngày này qua ngày khác, nếu có màu phân biệt thì nó vô tình
   biến thành một cuốn sổ ghi lỗi — dù từng nhãn riêng lẻ không hề có ý đó.

   R-08 nói thẳng: "ăn ngoài lộ trình" được đóng khung TRUNG TÍNH,
   chỉ để ghi nhận, KHÔNG màu đỏ, KHÔNG cảnh báo.
   ========================================================================= */

const NHAN = {
  trong_khung: 'Trong lộ trình',
  ngoai_ke_hoach: 'Ngoài lộ trình',
  goi_y_nhanh: 'Gợi ý nhanh',
  tu_chon: 'Tự chọn',
}

export default function NhanTrangThai({ loai }) {
  const chu = NHAN[loai]
  if (!chu) return null
  return <span className="nhan-trang-thai">{chu}</span>
}
