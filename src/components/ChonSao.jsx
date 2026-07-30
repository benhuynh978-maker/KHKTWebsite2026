/* =========================================================================
   CHỌN SAO — ô bấm-để-chọn, đặt trong khu vực "Viết đánh giá" của bảng
   bình luận (BangBinhLuan.jsx). Thêm 29/7.
   -------------------------------------------------------------------------
   Tách khỏi DanhGiaSao.jsx (chỉ đọc, hiện trung bình cạnh giá món) theo
   đúng cách các app đánh giá sao phổ biến vẫn làm: nơi hiện điểm trung
   bình và nơi tự chọn sao để gửi là HAI CHỖ KHÁC NHAU, chỗ tự chọn luôn đi
   kèm khung viết nhận xét (giống Shopee/Tiki/Google Play "Viết đánh giá").
   ========================================================================= */

import { useState } from 'react'

export default function ChonSao({ giaTri, onChon }) {
  const [dangRe, datDangRe] = useState(0)
  const hienThi = dangRe || giaTri || 0

  return (
    <div
      className="chon-sao"
      onMouseLeave={() => datDangRe(0)}
      role="radiogroup"
      aria-label="Chọn số sao đánh giá"
    >
      {[1, 2, 3, 4, 5].map((sao) => (
        <button
          key={sao}
          type="button"
          className={`chon-sao__nut${sao <= hienThi ? ' chon-sao__nut--dang-bat' : ''}`}
          onMouseEnter={() => datDangRe(sao)}
          onClick={() => onChon(sao)}
          role="radio"
          aria-checked={sao === giaTri}
          aria-label={`${sao} sao`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
