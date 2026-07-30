/* =========================================================================
   DẤU (i) GIẢI THÍCH — thêm 29/7 theo yêu cầu riêng.
   -------------------------------------------------------------------------
   Dùng ở tiêu đề Khối 1 Dashboard: các vòng tròn % (VongTron.jsx) không tự
   giải thích được ý nghĩa (đã đạt bao nhiêu % so với mốc NÀO), học sinh
   đọc vào không hiểu ngay. Bấm/rê chuột vào (i) hiện một bong bóng giải
   thích ngắn — không đổi gì ở bản thân VongTron (vẫn CHỈ nhận phanTram,
   xem giới hạn cố ý ở VongTron.jsx).

   Hoạt động cả 3 cách: rê chuột (hover), gõ Tab tới rồi (focus bàn phím),
   và bấm/chạm (click) — bấm lần nữa hoặc rời focus để đóng, vì hover một
   mình không dùng được trên điện thoại.

   `moLen` (tuỳ chọn) — bong bóng mở LÊN TRÊN thay vì xuống dưới. Dùng khi
   dấu (i) nằm gần đáy một khối có `overflow: hidden` (.khoi), ví dụ hàng
   vòng tròn dưới cùng ở Dashboard — mở xuống sẽ bị cắt mất. */

import { useState } from 'react'

export default function ThongTinGoiY({ noiDung, moLen = false }) {
  const [mo, datMo] = useState(false)

  return (
    <span className="thong-tin-goi-y">
      <button
        type="button"
        className="thong-tin-goi-y__nut"
        onClick={() => datMo((m) => !m)}
        onBlur={() => datMo(false)}
        aria-label="Xem giải thích"
        aria-expanded={mo}
      >
        i
      </button>
      <span
        className={`thong-tin-goi-y__bong${moLen ? ' thong-tin-goi-y__bong--len' : ''}${mo ? ' thong-tin-goi-y__bong--mo' : ''}`}
        role="tooltip"
      >
        {noiDung}
      </span>
    </span>
  )
}
