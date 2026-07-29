/* =========================================================================
   TRẠNG THÁI RỖNG — dòng chào thân thiện khi chưa có dữ liệu.
   "Ăn gì hôm nay" §2.1 và Lịch sử §2.3 đều chốt: không để trống trơn.

   Lời văn phải trung tính, không giục, không trách. R-07 cấm thông điệp
   phán xét; một trạng thái rỗng kiểu "Bạn chưa ghi nhận bữa nào!" đọc lên
   đã là một lời nhắc nhở mang tính ép tuân thủ.
   ========================================================================= */

export default function TrangThaiRong({ children }) {
  return <p className="trang-thai-rong">{children}</p>
}
