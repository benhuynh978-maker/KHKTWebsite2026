/* =========================================================================
   R-34 — ĐỒNG Ý SỬ DỤNG APP
   -------------------------------------------------------------------------
   Xuất hiện MỖI LẦN học sinh: (a) tạo hoặc sửa Hồ sơ cá nhân, (b) tạo lộ
   trình mới. KHÔNG tick → chặn thao tác đó (component chỉ hiển thị; việc
   CHẶN submit là trách nhiệm của trang gọi nó — xem FormLoTrinh.jsx).

   Mô tả ngắn theo R-15 (thông báo rõ, ngôn ngữ phù hợp lứa tuổi): thu gì,
   không thu gì, ai xem, lưu tới khi nào.

   KHÔNG cần phụ huynh xác nhận qua cơ chế này — quyết định có cân nhắc ở
   Bộ quy tắc §3.9 (học sinh 16–17 tuổi không còn là "trẻ em" theo Luật Trẻ
   em 2016; NĐ 13/2023 Điều 20 không bắt buộc theo câu chữ). KHÔNG thay thế
   phiếu nghiên cứu KHKT chính thức (R-23) — phiếu đó vẫn cần phê duyệt của
   GV hướng dẫn và có phụ huynh, độc lập với checkbox này (R-34).

   ⚠ Nội dung mô tả bên dưới là bản MINH HOẠ — nhóm cần tự viết lại cho
     đúng phạm vi dữ liệu thật một khi backend/Supabase được nối, và đối
     chiếu với phiếu nghiên cứu KHKT chính thức để không mâu thuẫn nhau.
   ========================================================================= */

export default function CheckboxDongY({ daTick, onDoi }) {
  return (
    <label className="checkbox-dong-y">
      <input
        type="checkbox"
        checked={daTick}
        onChange={(e) => onDoi(e.target.checked)}
      />
      <span className="checkbox-dong-y__noi-dung">
        <strong>Tôi đồng ý.</strong> App thu: tuổi, giới tính, mức vận động,
        dị ứng/kiêng, ngân sách, mục đích ăn uống, và lịch sử ghi nhận bữa
        ăn. KHÔNG thu: cân nặng, chiều cao, số điện thoại, địa chỉ nhà.
        Nhóm nghiên cứu và giáo viên hướng dẫn xem được dữ liệu này trong
        giai đoạn thử nghiệm. Lưu tới khi bạn yêu cầu xoá (mục Cài đặt).
      </span>
    </label>
  )
}
