/* =========================================================================
   TRANG ĐĂNG NHẬP (DEMO)
   -------------------------------------------------------------------------
   Yêu cầu riêng — KHÔNG có trong tài liệu thiết kế chính thức nào. Xem ghi
   chú đầy đủ ở lib/demoAuth.js: đây là cổng demo, không xác thực thật.
   Gõ gì cũng qua được (chỉ cần không bỏ trống) rồi vào thẳng giao diện chính.
   ========================================================================= */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { datDaQuaDangNhapDemo } from '../lib/demoAuth.js'

export default function DangNhap() {
  const navigate = useNavigate()

  const [tenTaiKhoan, datTenTaiKhoan] = useState('')
  const [matKhau, datMatKhau] = useState('')
  const [loi, datLoi] = useState('')

  const guiDangNhap = (e) => {
    e.preventDefault()
    if (!tenTaiKhoan.trim() || !matKhau) {
      datLoi('Nhập đủ tên tài khoản và mật khẩu.')
      return
    }
    datLoi('')
    // DEMO — không kiểm tra đúng/sai với tài khoản nào, chỉ đánh dấu đã
    // "qua cổng" rồi vào thẳng app.
    datDaQuaDangNhapDemo()
    navigate('/')
  }

  return (
    <div className="trang-xac-thuc">
      <div className="trang-xac-thuc__the khoi">
        <div className="khoi__than">
          <p className="trang-xac-thuc__logo">Ăn đủ chất</p>
          <h1 className="trang-xac-thuc__tieu-de">Đăng nhập</h1>
          <p className="chu-nho chu-nhat">Bản demo — thông tin không được lưu lại.</p>

          <form className="trang-xac-thuc__form" onSubmit={guiDangNhap}>
            <label className="truong-form">
              <span className="truong-form__nhan">Tên tài khoản</span>
              <input
                type="text" autoComplete="username"
                value={tenTaiKhoan}
                onChange={(e) => datTenTaiKhoan(e.target.value)}
              />
            </label>

            <label className="truong-form">
              <span className="truong-form__nhan">Mật khẩu</span>
              <input
                type="password" autoComplete="current-password"
                value={matKhau}
                onChange={(e) => datMatKhau(e.target.value)}
              />
            </label>

            {loi && <p className="loi-form">{loi}</p>}

            <button className="nut nut--chinh nut--rong" type="submit">
              Đăng nhập
            </button>
          </form>

          <p className="chu-nho trang-xac-thuc__chuyen">
            Chưa có tài khoản? <Link className="lien-ket" to="/dang-ky">Đăng ký</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
