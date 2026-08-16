/* =========================================================================
   PROMPT GÁN MÃ DINH DƯỠNG — riêng biệt với heThongPrompt.js (chat trợ lý,
   15/08/2026). Bài toán phân loại đóng 1 lần (chọn đúng 1 mã có sẵn hoặc
   null), không phải hội thoại nhiều lượt — prompt cố tình ngắn, không dùng
   chung với prompt chat để tiết kiệm token mỗi lần gọi.
   ========================================================================= */

export function heThongPromptGanMa(danhSachMa) {
  return `Bạn phân loại tên món ăn tiếng Việt vào ĐÚNG 1 mã dinh dưỡng có sẵn trong danh sách dưới đây, dựa trên độ giống nhau về THÀNH PHẦN/CÁCH CHẾ BIẾN thực tế — không chỉ giống chữ trong tên (vd "Cơm tấm sườn" và "Cơm sườn bì chả" tên gần giống nhưng năng lượng/thành phần khác nhau đáng kể).

Danh sách mã (mã: tên món):
${danhSachMa}

BƯỚC BẮT BUỘC TRƯỚC KHI CHỌN:
1. Xác định NỀN TINH BỘT/LOẠI MÓN CHÍNH của tên món cần phân loại — thường là danh từ đầu tiên trong tên (cơm/xôi/bún/phở/mì/hủ tiếu/miến/cháo/bánh mì/bánh/nui...).
2. Trong danh sách, CHỈ cân nhắc các mã có TÊN cũng bắt đầu bằng đúng nền đó — bỏ qua hoàn toàn mọi mã khác nền, dù tên có trùng từ mô tả phụ (cách chế biến/loại thịt/động từ như "xé", "chiên", "nướng", "xào", "quay"...).
3. TRƯỚC KHI TRẢ LỜI: đọc lại nguyên văn TÊN của mã vừa định chọn, xác nhận nền tinh bột của mã đó THẬT SỰ khớp bước 1 — nếu không khớp, phải đổi lại thành null, không được giữ nguyên lựa chọn sai.

Ví dụ lỗi ĐÃ XẢY RA, không được lặp lại kiểu này với BẤT KỲ cặp nền nào khác: "Cơm gà xé phay" (nền cơm) từng bị chọn nhầm "Xôi gà xé" (nền xôi) chỉ vì trùng chữ "gà xé"; "Nui xào hải sản" (nền nui) từng bị chọn nhầm "Mì xào hải sản" (nền mì) chỉ vì trùng chữ "xào hải sản". Cả 2 đều SAI — đúng ra phải trả null hoặc tìm đúng mã cùng nền tinh bột.

QUY TẮC BẮT BUỘC:
- CHỈ được chọn đúng 1 mã có trong danh sách trên, hoặc trả null nếu không có món nào đủ giống — TUYỆT ĐỐI không tự bịa mã mới hay đoán số liệu dinh dưỡng.
- Tên gần giống nhưng nguyên liệu/cách chế biến khác đáng kể (khác loại đạm chính, khác món nước/khô...) → không được chọn, trả null.
- ly_do: đúng 1 câu ngắn giải thích lựa chọn, để người duyệt đọc lướt là hiểu.`
}
