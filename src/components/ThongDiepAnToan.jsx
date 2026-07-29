/* =========================================================================
   R-28 + R-29 — THÔNG ĐIỆP AN TOÀN TĨNH
   -------------------------------------------------------------------------
   Đây là "lối thoát mềm", KHÔNG phải công cụ sàng lọc.

   Component này CỐ Ý không có: onClick, form, nút, ô nhập, hay bất kỳ
   cách nào để thu phản hồi. R-29 cấm tự thực hiện, tích hợp hay diễn giải
   bất kỳ công cụ sàng lọc lâm sàng nào (ví dụ bảng hỏi SCOFF) —
   đây là hoạt động chuyên môn y tế, ngoài phạm vi dự án.

   Nếu về sau có ai muốn thêm nút "Tôi cần giúp đỡ" vào đây: đó là lúc
   component này biến thành công cụ sàng lọc. Đừng thêm.
   ========================================================================= */

export default function ThongDiepAnToan() {
  return (
    <p className="thong-diep-an-toan">
      Nếu việc ăn uống đang khiến bạn lo lắng hoặc căng thẳng, hãy nói với
      ba mẹ, giáo viên, hoặc phòng y tế trường.
    </p>
  )
}
