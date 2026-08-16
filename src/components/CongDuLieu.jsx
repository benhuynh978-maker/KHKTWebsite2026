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
   TRƯỚC khi trang nào có thể gọi tinhMucTieuDinhDuong().

   Từ 10/08/2026 (khu vực trường học): sau khi hồ sơ tải xong, nếu
   hoSo.truong_hoc CHƯA có giá trị (tài khoản mới HOẶC tài khoản cũ chưa
   từng chọn) → hiện ChonTruongHoc THAY VÌ tải tiếp, chặn tới khi chọn
   xong. mon/quan CHỈ đổ vào DANH_SACH_MON/DANH_SACH_QUAN sau bước này —
   đây là ĐIỂM LỌC KHU VỰC TRƯỜNG DUY NHẤT cho cả app (mọi trang phía sau
   đọc lại 2 mảng này qua api.js, không trang nào tự lọc riêng). Vì vậy thứ
   tự tải phải đổi: hồ sơ giờ tải TRƯỚC khi mon/quan được lọc+đổ vào mảng
   (trước đây mon/quan đổ vào ngay, không chờ hồ sơ).

   Từ 12/08/2026 (đề xuất quán/món từ học sinh): quán không có cờ duyệt
   riêng, chỉ vào DANH_SACH_QUAN nếu có ≥1 món đã qua lọc trang_thai_duyet
   ('da_duyet', lọc ngay ở khoVi4.js) — xem locVaNapMonQuan() bên dưới. */

import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { taiKhoVi4 } from '../data/supabase/khoVi4.js'
import { layUidPhienHienTai } from '../data/supabase/khoXacThuc.js'
import { taiHoacTaoHoSo } from '../data/supabase/khoHoSo.js'
import { taiKhuVuc2 } from '../data/supabase/khoLoTrinh.js'
import { taiGoiYGhiNhan } from '../data/supabase/khoGoiYGhiNhan.js'
import { taiBangMucTieuDinhDuong } from '../data/supabase/khoMucTieuDinhDuong.js'
import { taiThamKhaoPhuTro } from '../data/supabase/khoThamKhaoPhuTro.js'
import { taiSanPhamPhuTro } from '../data/supabase/khoSanPhamPhuTro.js'
import { taiGhiNhanPhuTro } from '../data/supabase/khoGhiNhanPhuTro.js'
import { DANH_SACH_MON } from '../data/mock/mon.js'
import { DANH_SACH_QUAN } from '../data/mock/quan.js'
import { HOC_SINH_HIEN_TAI } from '../data/mock/hocSinh.js'
import { TRANG_THAI } from '../data/mock/loTrinh.js'
import { LICH_SU_GOI_Y_GHI_NHAN } from '../data/mock/goiYGhiNhanLichSu.js'
import { DANH_SACH_THAM_KHAO_PHU_TRO } from '../data/mock/thucPhamThamKhao.js'
import { DANH_SACH_SAN_PHAM_PHU_TRO } from '../data/mock/sanPhamPhuTro.js'
import { LICH_SU_GHI_NHAN_PHU_TRO } from '../data/mock/ghiNhanPhuTroLichSu.js'
import { BANG_MUC_TIEU } from '../lib/traBangDinhDuong.js'
import Khoi from './Khoi.jsx'
import ChonTruongHoc from './ChonTruongHoc.jsx'

let daTai = false

export default function CongDuLieu() {
  const [trangThai, datTrangThai] = useState(daTai ? 'xong' : 'dang_tai')
  const [loi, datLoi] = useState(null)
  const [lanThu, datLanThu] = useState(0)
  const tiepTucSauKhiChonTruongRef = useRef(null)

  useEffect(() => {
    if (daTai) return
    let huy = false
    datTrangThai('dang_tai')
    datLoi(null)

    /* Lọc mon/quan theo đúng truong_hoc của hồ sơ rồi đổ vào 2 mảng dùng
       chung — chạy sau khi CHẮC CHẮN có hoSo.truong_hoc (hoặc vừa tải
       xong Khu vực 1, hoặc vừa chọn xong ở ChonTruongHoc). */
    function locVaNapMonQuan(kqVi4) {
      const idQuanKhopTruong = new Set(
        kqVi4.quan.filter((q) => q.truong_hoc === HOC_SINH_HIEN_TAI.truong_hoc).map((q) => q.id)
      )
      DANH_SACH_MON.length = 0
      DANH_SACH_MON.push(...kqVi4.mon.filter((m) => idQuanKhopTruong.has(m.quan_id)))

      /* Thêm 12/08/2026 (đề xuất quán/món từ học sinh) — quán KHÔNG có cờ
         duyệt riêng (xem sql/10-...sql), nên chỉ hiện khi có ≥1 món ĐÃ
         QUA lọc trang_thai_duyet='da_duyet' ở khoVi4.js thuộc về nó. Quán
         học sinh vừa gửi (chưa món nào được duyệt) tự động vô hình theo —
         duyệt đúng 1 món ở Table Editor tự kéo quán hiện ra, không cần
         thao tác duyệt thứ 2 riêng cho quán. */
      const idQuanCoMonDaDuyet = new Set(DANH_SACH_MON.map((m) => m.quan_id))
      DANH_SACH_QUAN.length = 0
      DANH_SACH_QUAN.push(
        ...kqVi4.quan.filter((q) => idQuanKhopTruong.has(q.id) && idQuanCoMonDaDuyet.has(q.id))
      )
    }

    async function taiKhuVuc23VaHoanTat() {
      const [kqLoTrinh, kqGoiY, kqGhiNhanPhuTro] = await Promise.all([
        taiKhuVuc2(HOC_SINH_HIEN_TAI.ma_6_so),
        taiGoiYGhiNhan(HOC_SINH_HIEN_TAI.ma_6_so),
        taiGhiNhanPhuTro(HOC_SINH_HIEN_TAI.ma_6_so),
      ])
      if (huy) return
      if (!kqLoTrinh.ok) { datLoi(kqLoTrinh.loi); datTrangThai('loi'); return }
      if (!kqGoiY.ok) { datLoi(kqGoiY.loi); datTrangThai('loi'); return }
      if (!kqGhiNhanPhuTro.ok) { datLoi(kqGhiNhanPhuTro.loi); datTrangThai('loi'); return }

      TRANG_THAI.tat_ca_lo_trinh = kqLoTrinh.tatCaLoTrinh
      TRANG_THAI.tat_ca_khung = kqLoTrinh.tatCaKhung
      TRANG_THAI.ghi_nhan = kqLoTrinh.ghiNhan
      TRANG_THAI.lo_trinh = kqLoTrinh.tatCaLoTrinh.find((l) => l.trang_thai === 'dang_chay') ?? null

      LICH_SU_GOI_Y_GHI_NHAN.length = 0
      LICH_SU_GOI_Y_GHI_NHAN.push(...kqGoiY.rows)

      LICH_SU_GHI_NHAN_PHU_TRO.length = 0
      LICH_SU_GHI_NHAN_PHU_TRO.push(...kqGhiNhanPhuTro.rows)

      daTai = true
      datTrangThai('xong')
    }

    async function chay() {
      const [kqVi4, kqXacThuc, kqMucTieu, kqThamKhao, kqSanPham] = await Promise.all([
        taiKhoVi4(), layUidPhienHienTai(), taiBangMucTieuDinhDuong(), taiThamKhaoPhuTro(), taiSanPhamPhuTro(),
      ])
      if (huy) return
      if (!kqVi4.ok) { datLoi(kqVi4.loi); datTrangThai('loi'); return }
      if (!kqXacThuc.ok) { datLoi(kqXacThuc.loi); datTrangThai('loi'); return }
      if (!kqMucTieu.ok) { datLoi(kqMucTieu.loi); datTrangThai('loi'); return }

      Object.assign(BANG_MUC_TIEU, kqMucTieu.bang)

      // Phụ trợ là TUỲ CHỌN cho gợi ý bổ sung/Ghi nhận — lỗi tải KHÔNG
      // chặn luồng chính, chỉ coi như không có gì (giống test/du-lieu.js).
      DANH_SACH_THAM_KHAO_PHU_TRO.length = 0
      if (kqThamKhao.ok) DANH_SACH_THAM_KHAO_PHU_TRO.push(...kqThamKhao.danhSach)
      else console.error(kqThamKhao.loi)

      DANH_SACH_SAN_PHAM_PHU_TRO.length = 0
      if (kqSanPham.ok) DANH_SACH_SAN_PHAM_PHU_TRO.push(...kqSanPham.danhSach)
      else console.error(kqSanPham.loi)

      const kqHoSo = await taiHoacTaoHoSo(HOC_SINH_HIEN_TAI, kqXacThuc.uid)
      if (huy) return
      if (!kqHoSo.ok) { datLoi(kqHoSo.loi); datTrangThai('loi'); return }
      Object.assign(HOC_SINH_HIEN_TAI, kqHoSo.hoSo)

      if (!HOC_SINH_HIEN_TAI.truong_hoc) {
        tiepTucSauKhiChonTruongRef.current = () => {
          datTrangThai('dang_tai')
          locVaNapMonQuan(kqVi4)
          taiKhuVuc23VaHoanTat()
        }
        datTrangThai('can_chon_truong')
        return
      }

      locVaNapMonQuan(kqVi4)
      await taiKhuVuc23VaHoanTat()
    }

    chay()

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

  if (trangThai === 'can_chon_truong') {
    return (
      <ChonTruongHoc
        hoSo={HOC_SINH_HIEN_TAI}
        onXong={() => tiepTucSauKhiChonTruongRef.current?.()}
      />
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
