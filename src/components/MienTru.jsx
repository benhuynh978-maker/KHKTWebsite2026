/* =========================================================================
   R-31 + R-31-a — DÒNG MIỄN TRỪ TRÁCH NHIỆM
   -------------------------------------------------------------------------
   Bắt buộc xuất hiện ở MỌI trang hoặc thành phần (kể cả modal/popup)
   hiển thị số dinh dưỡng thật của món hoặc của cá nhân.

   Nội dung dòng chữ là CỐ ĐỊNH, theo đúng mẫu miễn trừ trách nhiệm của
   VNSNutrition (Văn phòng Bộ Y tế) — không sửa lời, không rút gọn,
   không đổi thành icon.

   ⚠ Lịch sử §7.3 phân biệt rõ: dòng này bảo vệ cho sai lệch của DỮ LIỆU
     NGUỒN (Bảng thành phần thực phẩm / định lượng nhà trường).
     Nó KHÔNG phải tấm khiên cho lỗi TÍNH TOÁN của hệ thống — trách nhiệm
     tính đúng nằm ở R-19 và việc kiểm thử.
   ========================================================================= */

const NOI_DUNG =
  'Thông tin chỉ mang tính tham khảo, không thay thế tư vấn của bác sỹ hoặc chuyên gia dinh dưỡng.'

export default function MienTru({ gonGang = false }) {
  return (
    <p className={`mien-tru${gonGang ? ' mien-tru--gon' : ''}`}>{NOI_DUNG}</p>
  )
}
