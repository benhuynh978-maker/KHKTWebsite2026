/* =========================================================================
   CỔNG TẢI DỮ LIỆU — chặn render mọi trang cho tới khi Supabase trả về
   (hoặc báo lỗi rõ ràng + nút Thử lại). Cùng triết lý test/dieu-phoi.js:
   "Đang tải..." → lỗi hiện nút Thử lại, KHÔNG âm thầm chạy tiếp trên dữ
   liệu rỗng/thiếu (gợi ý trên dữ liệu thiếu còn tệ hơn báo lỗi).

   Tải MỘT LẦN cho cả phiên (module-level cờ `daTai`) — không tải lại mỗi
   lần đổi trang. Ghi thẳng vào DANH_SACH_MON/DANH_SACH_QUAN/HOC_SINH_HIEN_TAI/
   TRANG_THAI (cùng object mà api.js đã import) — nhờ vậy các hàm sync sẵn
   có trong api.js không cần sửa gì, không cần trở thành async.

   Từ 06/08/2026: thêm Khu vực 1 (hồ sơ) + Khu vực 2 (lộ trình) — trước đó
   chỉ tải Khu vực 4 (món/quán). Danh tính học sinh xác định qua mã 6 số
   lưu trong localStorage (xem khoHoSo.js) — KHÔNG phải xác thực thật.

   Từ 07/08/2026: thêm Khu vực 3 cá nhân (goi_y_ghi_nhan) — trước đó chỉ có
   goi_y_chon_mon_an_danh (đếm gộp ẩn danh, không thuộc cổng này vì không
   cần tải trước theo học sinh).

   Từ 07/08/2026 (đợt RLS): hồ sơ tra cứu/tạo theo auth.uid() thật thay vì
   mã 6 số tự xưng trong localStorage, xem khoXacThuc.js + sql/8-them-auth-
   va-rls.sql. Từ 08/08/2026: đổi Anonymous Auth → tên tài khoản/mật khẩu
   thật — ConGate (App.jsx) đã đảm bảo có phiên trước khi tới đây, nên chỉ
   cần ĐỌC phiên (layUidPhienHienTai), không tự tạo phiên ẩn danh nữa.

   Từ 07/08/2026 (đợt Dinh_Duong_Muc_Tieu): thêm tải bảng mục tiêu dinh
   dưỡng (kcal/canxi/sắt/kẽm) từ Supabase, song song với taiKhoVi4() vì
   không phụ thuộc đăng nhập — ghi vào BANG_MUC_TIEU (traBangDinhDuong.js)
   TRƯỚC khi trang nào có thể gọi tinhMucTieuDinhDuong(). */

import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { taiKhoVi4 } from '../data/supabase/khoVi4.js'
import { layUidPhienHienTai } from '../data/supabase/khoXacThuc.js'
import { taiHoacTaoHoSo } from '../data/supabase/khoHoSo.js'
import { taiKhuVuc2 } from '../data/supabase/khoLoTrinh.js'
import { taiGoiYGhiNhan } from '../data/supabase/khoGoiYGhiNhan.js'
import { taiBangMucTieuDinhDuong } from '../data/supabase/khoMucTieuDinhDuong.js'
import { DANH_SACH_MON } from '../data/mock/mon.js'
import { DANH_SACH_QUAN } from '../data/mock/quan.js'
import { HOC_SINH_HIEN_TAI } from '../data/mock/hocSinh.js'
import { TRANG_THAI } from '../data/mock/loTrinh.js'
import { LICH_SU_GOI_Y_GHI_NHAN } from '../data/mock/goiYGhiNhanLichSu.js'
import { BANG_MUC_TIEU } from '../lib/traBangDinhDuong.js'
import Khoi from './Khoi.jsx'

let daTai = false

export default function CongDuLieu() {
  const [trangThai, datTrangThai] = useState(daTai ? 'xong' : 'dang_tai')
  const [loi, datLoi] = useState(null)
  const [lanThu, datLanThu] = useState(0)

  useEffect(() => {
    if (daTai) return
    let huy = false
    datTrangThai('dang_tai')
    datLoi(null)

    Promise.all([taiKhoVi4(), layUidPhienHienTai(), taiBangMucTieuDinhDuong()]).then(([kqVi4, kqXacThuc, kqMucTieu]) => {
      if (huy) return
      if (!kqVi4.ok) { datLoi(kqVi4.loi); datTrangThai('loi'); return }
      if (!kqXacThuc.ok) { datLoi(kqXacThuc.loi); datTrangThai('loi'); return }
      if (!kqMucTieu.ok) { datLoi(kqMucTieu.loi); datTrangThai('loi'); return }

      DANH_SACH_MON.length = 0
      DANH_SACH_MON.push(...kqVi4.mon)
      DANH_SACH_QUAN.length = 0
      DANH_SACH_QUAN.push(...kqVi4.quan)
      Object.assign(BANG_MUC_TIEU, kqMucTieu.bang)

      taiHoacTaoHoSo(HOC_SINH_HIEN_TAI, kqXacThuc.uid).then((kqHoSo) => {
        if (huy) return
        if (!kqHoSo.ok) { datLoi(kqHoSo.loi); datTrangThai('loi'); return }
        Object.assign(HOC_SINH_HIEN_TAI, kqHoSo.hoSo)

        Promise.all([
          taiKhuVuc2(HOC_SINH_HIEN_TAI.ma_6_so),
          taiGoiYGhiNhan(HOC_SINH_HIEN_TAI.ma_6_so),
        ]).then(([kqLoTrinh, kqGoiY]) => {
          if (huy) return
          if (!kqLoTrinh.ok) { datLoi(kqLoTrinh.loi); datTrangThai('loi'); return }
          if (!kqGoiY.ok) { datLoi(kqGoiY.loi); datTrangThai('loi'); return }

          TRANG_THAI.tat_ca_lo_trinh = kqLoTrinh.tatCaLoTrinh
          TRANG_THAI.tat_ca_khung = kqLoTrinh.tatCaKhung
          TRANG_THAI.ghi_nhan = kqLoTrinh.ghiNhan
          TRANG_THAI.lo_trinh = kqLoTrinh.tatCaLoTrinh.find((l) => l.trang_thai === 'dang_chay') ?? null

          LICH_SU_GOI_Y_GHI_NHAN.length = 0
          LICH_SU_GOI_Y_GHI_NHAN.push(...kqGoiY.rows)

          daTai = true
          datTrangThai('xong')
        })
      })
    })

    return () => { huy = true }
  }, [lanThu])

  if (trangThai === 'dang_tai') {
    return (
      <main className="than-trang">
        <Khoi tieuDe="Đang tải dữ liệu…">
          <p className="chu-nhat">Kết nối tới cơ sở dữ liệu món ăn, hồ sơ và lộ trình — thường chỉ vài giây.</p>
        </Khoi>
      </main>
    )
  }

  if (trangThai === 'loi') {
    return (
      <main className="than-trang">
        <Khoi tieuDe="Không tải được dữ liệu">
          <p className="loi-form">{loi}</p>
          <button className="nut nut--chinh" type="button" onClick={() => datLanThu((n) => n + 1)}>
            Thử lại
          </button>
        </Khoi>
      </main>
    )
  }

  return <Outlet />
}
