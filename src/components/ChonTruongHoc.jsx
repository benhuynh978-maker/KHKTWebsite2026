/* =========================================================================
   MÀN CHỌN TRƯỜNG HỌC — BẮT BUỘC, ĐÚNG 1 LẦN (10/08/2026, yêu cầu riêng).
   -------------------------------------------------------------------------
   Chèn vào CongDuLieu.jsx: hiện màn này thay vì tải tiếp nếu
   hoSo.truong_hoc chưa có giá trị — áp dụng CẢ tài khoản mới lẫn tài khoản
   cũ (tạo trước khi có tính năng này), cùng một cơ chế, không tách 2 luồng.
   Chọn xong KHÔNG có cách sửa lại — không có ô sửa ở đây lẫn HoSo.jsx.

   "Không thấy trường của tôi" gửi báo cáo qua Google Apps Script (KHÔNG
   qua Supabase, xem khoBaoCaoTruong.js) — gửi xong vẫn ở màn này, CHƯA có
   trường thật để chọn nên chưa cho vào app, đúng thiết kế đã chốt (chấp
   nhận "ngõ cụt" tạm thời, chờ nhóm bổ sung trường thủ công). */

import { useEffect, useState } from 'react'
import Khoi from './Khoi.jsx'
import { taiDanhSachTruong, chonTruongHocLanDau } from '../data/supabase/khoTruong.js'
import { guiBaoCaoThieuTruong } from '../data/khoBaoCaoTruong.js'

export default function ChonTruongHoc({ hoSo, onXong }) {
  const [trangThai, datTrangThai] = useState('dang_tai') // dang_tai | loi | xong
  const [danhSach, datDanhSach] = useState([])
  const [loi, datLoi] = useState(null)

  const [maChon, datMaChon] = useState('')
  const [dangGui, datDangGui] = useState(false)
  const [loiChon, datLoiChon] = useState('')

  const [hienBaoCao, datHienBaoCao] = useState(false)
  const [tenTruongGo, datTenTruongGo] = useState('')
  const [maSoTuyChon, datMaSoTuyChon] = useState('')
  const [dangGuiBaoCao, datDangGuiBaoCao] = useState(false)
  const [daGuiBaoCao, datDaGuiBaoCao] = useState(false)
  const [loiBaoCao, datLoiBaoCao] = useState('')

  useEffect(() => {
    let huy = false
    taiDanhSachTruong().then((kq) => {
      if (huy) return
      if (!kq.ok) { datLoi(kq.loi); datTrangThai('loi'); return }
      datDanhSach(kq.danhSach)
      datTrangThai('xong')
    })
    return () => { huy = true }
  }, [])

  const xacNhanChon = () => {
    if (!maChon) { datLoiChon('Chọn trường của bạn trước đã.'); return }
    datLoiChon('')
    datDangGui(true)
    chonTruongHocLanDau(hoSo, maChon)
    onXong()
  }

  const guiBaoCao = async () => {
    if (!tenTruongGo.trim()) { datLoiBaoCao('Gõ tên trường của bạn trước đã.'); return }
    datLoiBaoCao('')
    datDangGuiBaoCao(true)
    const kq = await guiBaoCaoThieuTruong(tenTruongGo, maSoTuyChon)
    datDangGuiBaoCao(false)
    if (!kq.ok) { datLoiBaoCao(kq.loi); return }
    datDaGuiBaoCao(true)
  }

  if (trangThai === 'dang_tai') {
    return (
      <main className="than-trang">
        <Khoi tieuDe="Đang tải danh sách trường…">
          <p className="chu-nhat">Chỉ vài giây.</p>
        </Khoi>
      </main>
    )
  }

  if (trangThai === 'loi') {
    return (
      <main className="than-trang">
        <Khoi tieuDe="Không tải được danh sách trường">
          <p className="loi-form">{loi}</p>
        </Khoi>
      </main>
    )
  }

  return (
    <main className="than-trang">
      <Khoi
        tieuDe="Chọn trường học của bạn"
        phu="Chỉ chọn được MỘT LẦN — không thể đổi lại sau khi xác nhận. Dùng để chỉ gợi ý quán ăn xung quanh đúng khu vực trường bạn."
      >
        <label className="truong-form">
          <span className="truong-form__nhan">Trường học</span>
          <select value={maChon} onChange={(e) => datMaChon(e.target.value)}>
            <option value="">— Chọn trường —</option>
            {danhSach.map((t) => (
              <option key={t.ma} value={t.ma}>{t.ten_truong}</option>
            ))}
          </select>
        </label>

        {loiChon && <p className="loi-form">{loiChon}</p>}

        <button className="nut nut--chinh nut--rong" onClick={xacNhanChon} type="button" disabled={dangGui}>
          {dangGui ? 'Đang lưu…' : 'Xác nhận trường học'}
        </button>

        {!hienBaoCao && !daGuiBaoCao && (
          <button className="nut nut--rong" onClick={() => datHienBaoCao(true)} type="button">
            Không thấy trường của tôi
          </button>
        )}

        {hienBaoCao && !daGuiBaoCao && (
          <div className="form-phan-hoi">
            <label className="truong-form">
              <span className="truong-form__nhan">Tên trường của bạn</span>
              <input
                type="text"
                placeholder="VD: THPT ABC"
                value={tenTruongGo}
                onChange={(e) => datTenTruongGo(e.target.value)}
              />
            </label>
            <input
              type="text"
              placeholder="Mã 6 số (tuỳ chọn, nếu bạn đã có)"
              value={maSoTuyChon}
              onChange={(e) => datMaSoTuyChon(e.target.value)}
            />
            {loiBaoCao && <p className="loi-form">{loiBaoCao}</p>}
            <button className="nut nut--rong" onClick={guiBaoCao} type="button" disabled={dangGuiBaoCao}>
              {dangGuiBaoCao ? 'Đang gửi…' : 'Gửi báo cáo'}
            </button>
          </div>
        )}

        {daGuiBaoCao && (
          <p className="da-luu-thanh-cong">
            Đã gửi. Nhóm sẽ bổ sung trường của bạn sớm — quay lại chọn sau khi được thêm vào danh sách.
          </p>
        )}
      </Khoi>
    </main>
  )
}
