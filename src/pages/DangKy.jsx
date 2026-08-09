/* =========================================================================
   TRANG ĐĂNG KÝ TÀI KHOẢN
   -------------------------------------------------------------------------
   Yêu cầu riêng — KHÔNG có trong tài liệu thiết kế chính thức nào. Giao
   diện đăng ký kiểu thông thường (tên tài khoản + mật khẩu), nhưng từ
   08/08/2026 tạo tài khoản THẬT qua Supabase Auth (xem khoXacThuc.js —
   tên tài khoản được quy đổi ngầm thành email giả, người dùng không cần
   biết việc này). Không có đường khôi phục khi quên mật khẩu — quyết định
   đã chốt cùng người dùng, xem ghi chú đầu khoXacThuc.js.
   ========================================================================= */

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dangKyThat } from '../data/supabase/khoXacThuc.js'
import { datTenAoBanDau } from '../data/api.js'
import { DANH_SACH_TEN_GIA_GOI_Y } from '../data/mock/tenGiaGoiY.js'
import { xaoTron } from '../lib/xepThuTu.js'

export default function DangKy() {
  const navigate = useNavigate()

  const [tenGia, datTenGia] = useState('')
  const [tenTaiKhoan, datTenTaiKhoan] = useState('')
  const [matKhau, datMatKhau] = useState('')
  const [matKhauLai, datMatKhauLai] = useState('')
  const [loi, datLoi] = useState('')
  const [dangGui, datDangGui] = useState(false)

  // Xáo trộn một lần khi vào trang — đủ để mỗi lượt đăng ký có gợi ý khác
  // nhau đôi chút, không cần chọn ngẫu nhiên lại mỗi lần gõ.
  const goiYTen = useMemo(() => xaoTron(DANH_SACH_TEN_GIA_GOI_Y).slice(0, 6), [])

  const guiDangKy = async (e) => {
    e.preventDefault()
    if (!tenTaiKhoan.trim()) { datLoi('Nhập tên tài khoản trước đã.'); return }
    if (!matKhau) { datLoi('Nhập mật khẩu mới.'); return }
    if (matKhau !== matKhauLai) { datLoi('Mật khẩu nhập lại không khớp.'); return }
    datLoi('')
    datDangGui(true)
    const kq = await dangKyThat(tenTaiKhoan, matKhau)
    if (!kq.ok) { datDangGui(false); datLoi(kq.loi); return }
    if (tenGia.trim()) datTenAoBanDau(tenGia.trim())
    navigate('/')
  }

  return (
    <div className="trang-xac-thuc">
      <div className="trang-xac-thuc__the khoi">
        <div className="khoi__than">
          <p className="trang-xac-thuc__logo">Ăn đủ chất</p>
          <h1 className="trang-xac-thuc__tieu-de">Đăng ký tài khoản</h1>
          <p className="chu-nho chu-nhat">Không có đường khôi phục nếu quên mật khẩu — ghi nhớ kỹ.</p>

          <form className="trang-xac-thuc__form" onSubmit={guiDangKy}>
            <div className="truong-form">
              <span className="truong-form__nhan">Tên (giả)</span>
              <div className="ten-gia-hang">
                <input
                  type="text"
                  className="ten-gia-hang__o"
                  placeholder="VD: Cáo Lười"
                  value={tenGia}
                  onChange={(e) => datTenGia(e.target.value)}
                />
                <div className="goi-y-ten">
                  {goiYTen.map((ten) => (
                    <button
                      key={ten}
                      type="button"
                      className="goi-y-ten__nut"
                      onClick={() => datTenGia(ten)}
                    >
                      {ten}
                    </button>
                  ))}
                </div>
              </div>
              <span className="chu-be chu-nhat">
                Bấm vào một gợi ý để điền nhanh, hoặc tự gõ tên riêng của bạn.
              </span>
            </div>

            <label className="truong-form">
              <span className="truong-form__nhan">Tên tài khoản</span>
              <input
                type="text" autoComplete="username"
                value={tenTaiKhoan}
                onChange={(e) => datTenTaiKhoan(e.target.value)}
              />
            </label>

            <label className="truong-form">
              <span className="truong-form__nhan">Mật khẩu mới</span>
              <input
                type="password" autoComplete="new-password"
                value={matKhau}
                onChange={(e) => datMatKhau(e.target.value)}
              />
            </label>

            <label className="truong-form">
              <span className="truong-form__nhan">Nhập lại mật khẩu</span>
              <input
                type="password" autoComplete="new-password"
                value={matKhauLai}
                onChange={(e) => datMatKhauLai(e.target.value)}
              />
            </label>

            {loi && <p className="loi-form">{loi}</p>}

            <button className="nut nut--chinh nut--rong" type="submit" disabled={dangGui}>
              {dangGui ? 'Đang đăng ký…' : 'Hoàn tất đăng ký'}
            </button>
          </form>

          <p className="chu-nho trang-xac-thuc__chuyen">
            Đã có tài khoản? <Link className="lien-ket" to="/dang-nhap">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
