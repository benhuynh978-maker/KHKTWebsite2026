/* =========================================================================
   BẢNG THỬ NGHIỆM — CÔNG CỤ DỰNG GIAO DIỆN, KHÔNG PHẢI TÍNH NĂNG
   -------------------------------------------------------------------------
   Cho phép đổi nhanh giữa các kịch bản dữ liệu để soi đủ mọi tình huống
   hiển thị của Dashboard Khối 1 (§3.1) mà không phải sửa dữ liệu tay.

   ⚠ GỠ THÀNH PHẦN NÀY TRƯỚC KHI ĐƯA CHO HỌC SINH DÙNG THẬT.
     Nó không nằm trong bất kỳ tài liệu thiết kế nào.
   ========================================================================= */

import { useState } from 'react'
import { danhSachKichBan, datKichBan, layKichBan } from '../data/api.js'

export default function BangThuNghiem({ onDoi }) {
  const [dangChon, datDangChon] = useState(layKichBan())
  const [mo, datMo] = useState(false)

  const doi = (ma) => {
    datKichBan(ma)
    datDangChon(ma)
    onDoi?.()
  }

  return (
    <aside className="bang-thu">
      <button className="bang-thu__nut" onClick={() => datMo(!mo)} type="button">
        🛠 Bảng thử nghiệm — chỉ dùng khi dựng giao diện {mo ? '▾' : '▸'}
      </button>

      {mo && (
        <div className="bang-thu__than">
          <p className="bang-thu__ghi-chu">
            Đổi kịch bản dữ liệu để xem đủ các tình huống. Thành phần này sẽ
            được gỡ trước khi đưa vào dùng thật.
          </p>
          {danhSachKichBan().map((kb) => (
            <label key={kb.ma} className="bang-thu__dong">
              <input
                type="radio"
                name="kich-ban"
                checked={dangChon === kb.ma}
                onChange={() => doi(kb.ma)}
              />
              <span>{kb.nhan}</span>
            </label>
          ))}
        </div>
      )}
    </aside>
  )
}
