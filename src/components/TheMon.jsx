/* =========================================================================
   THẺ MÓN — component dùng lại ở 3 nơi
     • Trang "Ăn gì hôm nay" (Khu A và Khu B)
     • Trang "Quán ăn gần đây" (dải kéo ngang trong mỗi khối quán)
     • Dashboard Khối 4 (bản rút gọn)
   -------------------------------------------------------------------------
   Trường hiển thị theo "Ăn gì hôm nay" §4.1:
     HIỆN     — ảnh món, tên món, tên quán, giá, khoảng cách, giờ hoạt động
     KHÔNG HIỆN — dinh dưỡng, dị ứng

   Vì sao thẻ không hiện dinh dưỡng: hai nội dung đó chỉ xuất hiện trong
   modal chi tiết (§5). Nhờ vậy thẻ ngoài KHÔNG cần dòng miễn trừ trách
   nhiệm R-31 (§5.3) — R-31 kích hoạt ở modal, không kích hoạt ở thẻ.
   Thêm số dinh dưỡng vào thẻ = phải thêm R-31 vào mọi lưới thẻ.

   Khoảng cách và giờ hoạt động là thuộc tính của QUÁN (§4.1) — mọi món
   cùng quán hiển thị giống nhau, thẻ chỉ đọc lại, không nhập riêng.
   ========================================================================= */

import { tien, khoangCach } from '../lib/dinhDang.js'

export default function TheMon({ mon, onChon }) {
  if (!mon) return null
  const { quan } = mon

  return (
    <button className="the-mon" onClick={() => onChon?.(mon)} type="button">
      <div className="the-mon__anh" aria-hidden="true">
        {mon.anh_url
          ? <img src={mon.anh_url} alt="" loading="lazy" />
          : <span className="the-mon__anh-trong">Ảnh món</span>}
      </div>

      <div className="the-mon__than">
        <p className="the-mon__ten">{mon.ten_mon}</p>
        <p className="the-mon__quan">{quan?.ten_quan}</p>

        <div className="the-mon__day">
          <span className="the-mon__gia">{tien(mon.gia)}</span>
          <span className="the-mon__cham">·</span>
          <span className="the-mon__phu">{khoangCach(quan?.khoang_cach_m)}</span>
        </div>

        <p className="the-mon__gio">{quan?.khoang_gio_hoat_dong}</p>
      </div>
    </button>
  )
}
