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
import BangThuNghiemLoTrinh from './loTrinh/BangThuNghiemLoTrinh.jsx'
import { layLoTrinhDangChay, huyLoTrinh, chayHauKiemVaApDung, layHoSo } from '../data/api.js'
import { xayKhungMoiBuoi } from '../lib/sinhLoTrinh.js'

// DEMO — dữ liệu giả lập CHỈ cho Bảng thử nghiệm bên dưới, không liên
// quan tới form thật học sinh đang gõ.
const FORM_THU_NGHIEM = {
  ngan_sach_tuan: 500000,
  muc_dich: 'du_chat_trong_ngan_sach',
  cac_buoi_ap_dung: ['trua', 'toi'],
  ghi_chu: '',
  boQuaSanViChat: true,
  rang_buoc_ghi_chu: {},
}

export default function LoTrinh() {
  const [phienBan, datPhienBan] = useState(0)
  const lamMoi = () => datPhienBan((p) => p + 1)

  const loTrinhHienTai = layLoTrinhDangChay()

  const [giaiDoan, datGiaiDoan] = useState(() => (loTrinhHienTai ? 'theo_doi' : 'form'))
  const [form, datForm] = useState(null)
  const [ketQuaTienKiem, datKetQuaTienKiem] = useState(null)
  const [dangHauKiem, datDangHauKiem] = useState(false)
  const [loiHauKiem, datLoiHauKiem] = useState(null)

  // DEMO 29/7 — Bảng thử nghiệm: case đang xem (null = luồng bình thường).
  const [caseDangXem, datCaseDangXem] = useState(null)

  const handleHuyLoTrinhDangChay = () => {
    huyLoTrinh(null)
    lamMoi()
    datCaseDangXem(null)
    datGiaiDoan('form')
  }

  const xemCaseThuNghiem = (c) => {
    datCaseDangXem(c)
    if (c.epKhoaForm) {
      datGiaiDoan('form')
      return
    }
    if (c.apDungGiaiDoanXem) {
      const { khungMoiBuoi } = xayKhungMoiBuoi(layHoSo(), FORM_THU_NGHIEM)
      datForm(FORM_THU_NGHIEM)
      datKetQuaTienKiem({ khaThi: true, khungMoiBuoi, tongChiDuKien: Math.round(FORM_THU_NGHIEM.ngan_sach_tuan * 0.85) })
      datLoiHauKiem('Backend kiểm lại lần cuối phát hiện giá một món vừa đổi khác lúc xem trước (demo) — từ chối lưu.')
      datGiaiDoan('xem')
      return
    }
    datForm(FORM_THU_NGHIEM)
    datGiaiDoan('cho')
  }

  const veLuongBinhThuong = () => {
    datCaseDangXem(null)
    datLoiHauKiem(null)
    datGiaiDoan(loTrinhHienTai ? 'theo_doi' : 'form')
  }

  const handleTao = (formData) => {
    datCaseDangXem(null) // form THẬT gửi — bỏ mọi case demo đang ép, nếu có
    datForm(formData)
    datLoiHauKiem(null)
    datGiaiDoan('cho')
  }

  const handleKhaThi = (ketQua, formData) => {
    datCaseDangXem(null)
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

  const thoatCaseDemo = () => { datCaseDangXem(null); datLoiHauKiem(null); datGiaiDoan('form') }

  return (
    <>
      <BangThuNghiemLoTrinh
        onXemCase={xemCaseThuNghiem}
        onVeBinhThuong={veLuongBinhThuong}
        dangEp={!!caseDangXem}
      />

      {giaiDoan === 'form' && (
        <FormLoTrinh
          coLoTrinhDangChay={caseDangXem?.epKhoaForm || !!loTrinhHienTai}
          onHuy={handleHuyLoTrinhDangChay}
          onTao={handleTao}
        />
      )}

      {giaiDoan === 'cho' && (
        <ManCho
          form={form}
          onKhaThi={handleKhaThi}
          onQuayLai={thoatCaseDemo}
          onHuy={thoatCaseDemo}
          ketQuaEp={caseDangXem?.ketQua}
        />
      )}

      {giaiDoan === 'xem' && (
        <XemLoTrinh
          form={form}
          ketQuaTienKiem={ketQuaTienKiem}
          onApDung={handleApDung}
          onHuyLamLai={thoatCaseDemo}
          dangHauKiem={dangHauKiem}
          loiHauKiem={loiHauKiem}
          onDungXoa={thoatCaseDemo}
        />
      )}

      {giaiDoan === 'theo_doi' && loTrinhHienTai && (
        <TheoDoi loTrinh={loTrinhHienTai} onHuy={handleHuyLoTrinhDangChay} />
      )}
    </>
  )
}
