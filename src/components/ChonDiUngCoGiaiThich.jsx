/* =========================================================================
   TICK 14 NHÓM DỊ ỨNG CHUẨN — dùng trong FormDeXuatMon.jsx (12/08/2026).
   -------------------------------------------------------------------------
   CHỈ dùng ở form đề xuất món — KHÔNG đụng ô chọn dị ứng ở Hồ sơ.jsx (giữ
   nguyên, khác bố cục — lưới nhiều cột, không có phần giải thích).

   Dùng ĐÚNG 14 mã trong data/mock/danhSachDiUng.js — bắt buộc, để khớp
   được với lib/diUng.js:monAnToanChoDiUng() vốn so khớp thẳng theo mã.
   Nếu tự đặt danh sách nguyên liệu khác thì mất khả năng so khớp, vô dụng
   cho mục đích an toàn.

   Mỗi mục có nút "i" (không icon hình ảnh — dùng chữ "i" trong khung tròn,
   bấm/chạm mở rộng xem giải thích dễ hiểu, đúng nội dung người dùng cung
   cấp) — dùng thẻ <details> gốc HTML, không cần state riêng để đóng/mở
   từng dòng.

   Không tick gì = mảng rỗng ở đây, nhưng NƠI GỌI (FormDeXuatMon.jsx) phải
   tự đổi mảng rỗng đó thành NULL trước khi gửi lên Supabase — "chưa tick"
   nghĩa là "chưa kiểm", KHÁC "đã kiểm, chắc chắn không có gì" (mảng rỗng
   thật). Xem ghi chú ở khoDeXuatMonQuan.js. */

import { NHOM_DI_UNG } from '../data/mock/danhSachDiUng.js'

export default function ChonDiUngCoGiaiThich({ dsChon, onDoi }) {
  const doi = (ma) => {
    onDoi(dsChon.includes(ma) ? dsChon.filter((d) => d !== ma) : [...dsChon, ma])
  }

  return (
    <div className="chon-di-ung-gt">
      {NHOM_DI_UNG.map((n) => (
        <div key={n.ma} className="chon-di-ung-gt__dong">
          <label className="chon-di-ung-gt__nhan">
            <input
              type="checkbox"
              checked={dsChon.includes(n.ma)}
              onChange={() => doi(n.ma)}
            />
            <span>{n.ten}</span>
          </label>
          <details className="chon-di-ung-gt__chi-tiet">
            <summary aria-label={`Xem giải thích: ${n.ten}`}>i</summary>
            <p className="chu-be chu-nhat">{n.giai_thich}</p>
          </details>
        </div>
      ))}
    </div>
  )
}
