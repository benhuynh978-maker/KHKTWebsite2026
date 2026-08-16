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
   vòng tròn dưới cùng ở Dashboard — mở xuống sẽ bị cắt mất.

   Thêm 14/08/2026 — PORTAL ra document.body, tính vị trí bằng
   getBoundingClientRect() thay vì position:absolute cắm trong cây DOM tại
   chỗ. Lý do: `.modal-mon` (TheoDoi.jsx, bảng nổi gợi ý bổ sung) có
   `overflow-y: auto` — theo spec CSS, đặt overflow khác `visible` ở 1 trục
   thì trục kia cũng tự bị ép thành `auto` (không thể vừa auto vừa visible),
   nên bong bóng position:absolute cũ bị CẮT THẬT (mất chữ) khi trồi ra
   ngoài `.modal-mon`, không chỉ lệch chỗ. `.khoi` (`overflow: hidden`) ở
   Dashboard cũng có nguy cơ y hệt, chỉ chưa lộ vì nhãn VongTron ngắn/căn
   giữa. Portal thoát hẳn khỏi mọi tổ tiên có overflow bị cắt — cùng
   nguyên tắc "thoát khỏi vùng bị cắt" đã dùng cho GhiNhanPhuTro.jsx.
   Đánh đổi đã được người dùng đồng ý: bỏ hiệu ứng mờ dần khi mở/đóng (chỉ
   render khi cần, không toggle opacity/transform qua CSS nữa). Không theo
   dõi cuộn/resize khi đang mở — bong bóng chỉ mở trong chốc lát (rê/bấm),
   rủi ro lệch nhẹ nếu cuộn ngay lúc đó là chấp nhận được. */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const ROND_BONG = 230
const KHOANG_CACH_CANH = 8

/* Điện thoại KHÔNG có chuột thật, nhưng trình duyệt vẫn giả lập mouseenter
   khi chạm — nếu tính cả hover thì cú chạm đầu tiên vừa mở (do hover) vừa bị
   coi là "đang mở" nên đóng lại luôn. Máy có chuột thật thì `(hover: hover)`
   đúng, giữ nguyên hành vi rê-để-xem. */
const CO_CHUOT_THAT = typeof window !== 'undefined'
  && window.matchMedia('(hover: hover)').matches

export default function ThongTinGoiY({ noiDung, moLen = false }) {
  const [hover, datHover] = useState(false)
  const [focus, datFocus] = useState(false)
  const [daBam, datDaBam] = useState(false)
  const nutRef = useRef(null)
  const [viTri, datViTri] = useState(null)

  const mo = (CO_CHUOT_THAT && hover) || focus || daBam

  useLayoutEffect(() => {
    if (!mo || !nutRef.current) { datViTri(null); return }
    const r = nutRef.current.getBoundingClientRect()
    let left = r.left + r.width / 2 - ROND_BONG / 2
    left = Math.max(KHOANG_CACH_CANH, Math.min(left, window.innerWidth - ROND_BONG - KHOANG_CACH_CANH))
    if (moLen) {
      datViTri({ left, bottom: window.innerHeight - r.top + 8 })
    } else {
      datViTri({ left, top: r.bottom + 8 })
    }
  }, [mo, moLen])

  const dong = () => { datFocus(false); datDaBam(false) }

  useEffect(() => {
    if (!mo) return
    const nhanPhim = (e) => { if (e.key === 'Escape') dong() }
    document.addEventListener('keydown', nhanPhim)
    return () => document.removeEventListener('keydown', nhanPhim)
  }, [mo])

  /* Chỉ `daBam` mới là công tắc bật/tắt — điện thoại chạm lần hai là đóng. */
  const bam = () => { if (daBam) dong(); else datDaBam(true) }

  return (
    <span className="thong-tin-goi-y">
      <button
        ref={nutRef}
        type="button"
        className="thong-tin-goi-y__nut"
        onClick={bam}
        onMouseEnter={() => datHover(true)}
        /* Máy có chuột: rê ra là đóng hẳn, nếu không bong bóng dính lại sau
           khi vừa rê vừa bấm. Điện thoại thì mouseleave chỉ là sự kiện giả
           phát ngay sau cú chạm — nghe theo là đóng mất cái vừa mở. */
        onMouseLeave={() => {
          datHover(false)
          if (CO_CHUOT_THAT) { datDaBam(false); datFocus(false) }
        }}
        onFocus={() => datFocus(true)}
        onBlur={dong}
        aria-label="Xem giải thích"
        aria-expanded={mo}
      >
        i
      </button>
      {mo && viTri && createPortal(
        <span
          className="thong-tin-goi-y__bong thong-tin-goi-y__bong--noi"
          style={{ left: viTri.left, top: viTri.top, bottom: viTri.bottom }}
          role="tooltip"
        >
          {noiDung}
        </span>,
        document.body,
      )}
    </span>
  )
}
