/* =========================================================================
   BỐ CỤC CHUNG — thanh đầu trang + thanh điều hướng dưới (mobile-first)
   -------------------------------------------------------------------------
   Sơ đồ trang có 7 trang (Kế hoạch dự án §6.1). "Tối đa 5 mục" ở thanh
   dưới KHÔNG phải yêu cầu từ tài liệu nào — chỉ là quy ước UI mobile
   thường gặp mà nhóm tự đặt ban đầu. Theo yêu cầu của bạn, "Quán ăn gần
   đây" là trang riêng nên không gộp, và Phân tích cũng được đưa vào thanh
   dưới luôn (không có trong tài liệu nào yêu cầu giấu nó) — thanh dưới
   hiện có 7 mục. Số cột lưới tương ứng đặt ở `.thanh-duoi` trong
   components.css (repeat(7, 1fr)) — sửa cả hai chỗ nếu đổi số mục.
   Riêng Cài đặt vẫn đi vào qua đường dẫn lối từ trang Hồ sơ (tần suất
   dùng thấp hơn, đúng tinh thần Dashboard §1.1 "DẪN LỐI sang các trang
   chức năng").

   Lưu ý riêng tư: thanh đầu trang hiển thị TÊN ẢO, không hiển thị mã 6 số.
   Mã 6 số vừa là định danh vừa là thứ dùng để đăng nhập, nên không đặt nó
   thường trực trên màn hình. Chỉ trang Cài đặt §3.2 mới hiện mã.
   ========================================================================= */

import { NavLink, Outlet } from 'react-router-dom'
import { layHoSo } from '../data/api.js'

const MUC = [
  { den: '/',                nhan: 'Trang chủ', icon: '⌂' },
  { den: '/lo-trinh',        nhan: 'Lộ trình',  icon: '▤' },
  { den: '/an-gi-hom-nay',   nhan: 'Ăn gì',     icon: '◍' },
  { den: '/quan-an-gan-day', nhan: 'Quán ăn',   icon: '⌖' },
  { den: '/lich-su',         nhan: 'Lịch sử',   icon: '↺' },
  { den: '/phan-tich',       nhan: 'Phân tích', icon: '▦' },
  { den: '/ho-so',           nhan: 'Hồ sơ',     icon: '☺' },
]

export default function BoCuc() {
  const hoSo = layHoSo()

  return (
    <div className="vo-trang">
      <header className="thanh-dau">
        <div className="thanh-dau__trong">
          <span className="thanh-dau__ten-app">Ăn đủ chất</span>
          <span className="thanh-dau__chao">Chào {hoSo.ten_ao}</span>
        </div>
      </header>

      <main className="than-trang">
        <Outlet />
      </main>

      <nav className="thanh-duoi" aria-label="Điều hướng chính">
        {MUC.map((m) => (
          <NavLink
            key={m.den}
            to={m.den}
            end={m.den === '/'}
            className={({ isActive }) =>
              `thanh-duoi__muc${isActive ? ' thanh-duoi__muc--dang-xem' : ''}`
            }
          >
            <span className="thanh-duoi__icon" aria-hidden="true">{m.icon}</span>
            <span className="thanh-duoi__nhan">{m.nhan}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
