/* =========================================================================
   TRANG LỘ TRÌNH ĂN UỐNG — bộ điều khiển 4 giai đoạn
   Theo "Kế hoạch trang Lộ trình ăn uống" §2: "Học sinh KHÔNG được nhảy
   cóc. [1] Form → [2] Màn chờ → [3] Xem lộ trình → [4] Theo dõi."
   -------------------------------------------------------------------------
   File này CHỈ điều phối chuyển giai đoạn — toàn bộ nội dung từng giai
   đoạn nằm trong src/pages/loTrinh/*.jsx (4 file, mỗi file 1 khái niệm,
   dễ tìm/dễ sửa hơn một file dài gộp cả bốn).

   Nếu ĐÃ có lộ trình đang chạy khi vào trang: bỏ qua Form, vào thẳng
   Giai đoạn 4 (Theo dõi) — đây là "trang chính" của một lộ trình đang có
   (§6.1). Suy luận này không phải câu chữ tường minh của tài liệu, dựa
   trên §3.6 ("nếu đang có lộ trình chạy → nút bị khoá") — cần bạn xác
   nhận đúng ý.
   ========================================================================= */

import { useState } from 'react'
import FormLoTrinh from './loTrinh/FormLoTrinh.jsx'
import ManCho from './loTrinh/ManCho.jsx'
import XemLoTrinh from './loTrinh/XemLoTrinh.jsx'
import TheoDoi from './loTrinh/TheoDoi.jsx'
import { layLoTrinhDangChay, huyLoTrinh, chayHauKiemVaApDung } from '../data/api.js'

export default function LoTrinh() {
  const [phienBan, datPhienBan] = useState(0)
  const lamMoi = () => datPhienBan((p) => p + 1)

  const loTrinhHienTai = layLoTrinhDangChay()

  const [giaiDoan, datGiaiDoan] = useState(() => (loTrinhHienTai ? 'theo_doi' : 'form'))
  const [form, datForm] = useState(null)
  const [ketQuaTienKiem, datKetQuaTienKiem] = useState(null)
  const [dangHauKiem, datDangHauKiem] = useState(false)
  const [loiHauKiem, datLoiHauKiem] = useState(null)

  const handleHuyLoTrinhDangChay = () => {
    huyLoTrinh(null)
    lamMoi()
    datGiaiDoan('form')
  }

  const handleTao = (formData) => {
    datForm(formData)
    datLoiHauKiem(null)
    datGiaiDoan('cho')
  }

  const handleKhaThi = (ketQua, formData) => {
    datKetQuaTienKiem(ketQua)
    datForm(formData)
    datGiaiDoan('xem')
  }

  const handleApDung = () => {
    datDangHauKiem(true)
    setTimeout(() => {
      const kq = chayHauKiemVaApDung(form, ketQuaTienKiem.khungMoiBuoi)
      datDangHauKiem(false)
      if (kq.khaThi) {
        lamMoi()
        datGiaiDoan('theo_doi')
      } else {
        datLoiHauKiem(kq.lyDo)
      }
    }, 400)
  }

  return (
    <>
      {giaiDoan === 'form' && (
        <FormLoTrinh
          coLoTrinhDangChay={!!loTrinhHienTai}
          onHuy={handleHuyLoTrinhDangChay}
          onTao={handleTao}
        />
      )}

      {giaiDoan === 'cho' && (
        <ManCho
          form={form}
          onKhaThi={handleKhaThi}
          onQuayLai={() => datGiaiDoan('form')}
          onHuy={() => datGiaiDoan('form')}
        />
      )}

      {giaiDoan === 'xem' && (
        <XemLoTrinh
          form={form}
          ketQuaTienKiem={ketQuaTienKiem}
          onApDung={handleApDung}
          onHuyLamLai={() => { datLoiHauKiem(null); datGiaiDoan('form') }}
          dangHauKiem={dangHauKiem}
          loiHauKiem={loiHauKiem}
          onDungXoa={() => { datLoiHauKiem(null); datGiaiDoan('form') }}
        />
      )}

      {giaiDoan === 'theo_doi' && loTrinhHienTai && (
        <TheoDoi loTrinh={loTrinhHienTai} onHuy={handleHuyLoTrinhDangChay} />
      )}
    </>
  )
}
