/* =========================================================================
   TRANG ĐĂNG NHẬP
   -------------------------------------------------------------------------
   Yêu cầu riêng — KHÔNG có trong tài liệu thiết kế chính thức nào. Từ
   08/08/2026 xác thực THẬT qua Supabase Auth (xem khoXacThuc.js).
   ========================================================================= */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dangNhapThat } from '../data/supabase/khoXacThuc.js'

export default function DangNhap() {
  const navigate = useNavigate()

  const [tenTaiKhoan, datTenTaiKhoan] = useState('')
  const [matKhau, datMatKhau] = useState('')
  const [loi, datLoi] = useState('')
  const [dangGui, datDangGui] = useState(false)

  const guiDangNhap = async (e) => {
    e.preventDefault()
    if (!tenTaiKhoan.trim() || !matKhau) {
      datLoi('Nhập đủ tên tài khoản và mật khẩu.')
      return
    }
    datLoi('')
    datDangGui(true)
    const kq = await dangNhapThat(tenTaiKhoan, matKhau)
    if (!kq.ok) { datDangGui(false); datLoi(kq.loi); return }
    navigate('/')
  }

  return (
    <div className="trang-xac-thuc">
      <div className="trang-xac-thuc__the khoi">
        <div className="khoi__than">
          <p className="trang-xac-thuc__logo">Ăn đủ chất</p>
          <h1 className="trang-xac-thuc__tieu-de">Đăng nhập</h1>
          <p className="chu-nho chu-nhat">Chưa có đường khôi phục nếu quên mật khẩu.</p>

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

            <button className="nut nut--chinh nut--rong" type="submit" disabled={dangGui}>
              {dangGui ? 'Đang đăng nhập…' : 'Đăng nhập'}
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
