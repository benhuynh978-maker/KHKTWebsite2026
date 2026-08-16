/* =========================================================================
   SẢN PHẨM PHỤ TRỢ THẬT (có thương hiệu, học sinh tự gửi) — mảng MUTABLE,
   cùng khuôn DANH_SACH_MON (mock/mon.js). CongDuLieu.jsx đổ dữ liệu thật từ
   Supabase (bảng san_pham_phu_tro, ĐÃ lọc da_duyet=true) vào đây lúc mở app.

   Khác `thucPhamThamKhao.js` (thực phẩm chung, không thương hiệu — CHỈ
   dùng cho gợi ý bổ sung tự động): mảng này CHỈ dùng cho tìm kiếm/chọn ở
   luồng "Ghi nhận" thật (đã ăn/uống thứ gì) — đúng quyết định tách 2 nguồn
   đã chốt (xem sql/12-tao-bang-thuc-pham-phu-tro.sql). */

export const DANH_SACH_SAN_PHAM_PHU_TRO = []
