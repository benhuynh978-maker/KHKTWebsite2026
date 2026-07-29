/* =========================================================================
   TRANG HỒ SƠ
   Theo "Kế hoạch trang Hồ sơ & Cài đặt" §2.
   -------------------------------------------------------------------------
   §1: Không AI, thuần biểu mẫu. Mục tiêu dinh dưỡng KHÔNG thể chỉnh sửa —
   tính tự động qua bảng tra, không có ô nhập tay, kể cả cho chính học
   sinh. KHÔNG thu thập: cân nặng, chiều cao (R-12), SĐT, địa chỉ nhà
   (R-26), bệnh lý cụ thể/chẩn đoán.

   R-34: checkbox đồng ý xuất hiện MỖI LẦN sửa Hồ sơ — không tick không
   lưu được.
   ========================================================================= */

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Khoi from '../components/Khoi.jsx'
import MienTru from '../components/MienTru.jsx'
import CheckboxDongY from '../components/CheckboxDongY.jsx'
import { layHoSo, capNhatHoSo, layNhomDiUng } from '../data/api.js'
import { tinhMucTieuDinhDuong } from '../lib/traBangDinhDuong.js'

export default function HoSo() {
  const hoSo = layHoSo()

  const [tenAo, datTenAo] = useState(hoSo.ten_ao)
  const [tuoi, datTuoi] = useState(hoSo.tuoi)
  const [gioi, datGioi] = useState(hoSo.gioi)
  const [mucVanDong, datMucVanDong] = useState(hoSo.muc_van_dong)
  const [diUng, datDiUng] = useState(hoSo.di_ung)
  const [daTickDongY, datDaTickDongY] = useState(false)
  const [daLuu, datDaLuu] = useState(false)
  const [loi, datLoi] = useState('')

  // §2.2 — "chỉ xem, đã chốt": xem trước mục tiêu SẼ ra sao với thông tin
  // đang nhập, nhưng không ai gõ thẳng vào 4 số này được — luôn tính lại
  // từ tuổi/giới/mức vận động qua bảng tra.
  const mucTieuXemTruoc = useMemo(
    () => tinhMucTieuDinhDuong({ tuoi: Number(tuoi) || 0, gioi, muc_van_dong: mucVanDong }),
    [tuoi, gioi, mucVanDong]
  )

  const doiDiUng = (ma) => {
    datDiUng(diUng.includes(ma) ? diUng.filter((d) => d !== ma) : [...diUng, ma])
    datDaLuu(false)
  }

  const luu = () => {
    if (!tuoi || tuoi <= 0) { datLoi('Nhập tuổi trước đã.'); return }
    if (!daTickDongY) { datLoi('Cần tick đồng ý sử dụng app trước khi lưu (R-34).'); return }
    datLoi('')
    capNhatHoSo({ ten_ao: tenAo, tuoi: Number(tuoi), gioi, muc_van_dong: mucVanDong, di_ung: diUng })
    datDaTickDongY(false)
    datDaLuu(true)
  }

  return (
    <>
      <Khoi
        tieuDe="Hồ sơ"
        hanhDong={<Link className="lien-ket" to="/cai-dat">Cài đặt</Link>}
      >
        <label className="truong-form">
          <span className="truong-form__nhan">Tên (ảo)</span>
          <input
            type="text" value={tenAo}
            onChange={(e) => { datTenAo(e.target.value); datDaLuu(false) }}
          />
          <span className="chu-be chu-nhat">
            Khuyến khích dùng biệt danh — không phải tên thật. Không tham gia bất kỳ phép tính nào (§2.1.0).
          </span>
        </label>

        <label className="truong-form">
          <span className="truong-form__nhan">Tuổi</span>
          <input
            type="number" min={10} max={20} value={tuoi}
            onChange={(e) => { datTuoi(e.target.value); datDaLuu(false) }}
          />
        </label>

        <label className="truong-form">
          <span className="truong-form__nhan">Giới tính</span>
          <select value={gioi} onChange={(e) => { datGioi(e.target.value); datDaLuu(false) }}>
            <option value="nam">Nam</option>
            <option value="nu">Nữ</option>
          </select>
        </label>

        <label className="truong-form">
          <span className="truong-form__nhan">Mức vận động</span>
          <select value={mucVanDong} onChange={(e) => { datMucVanDong(e.target.value); datDaLuu(false) }}>
            <option value="thap">Thấp</option>
            <option value="vua">Vừa</option>
            <option value="cao">Cao</option>
          </select>
        </label>

        <div className="truong-form">
          <span className="truong-form__nhan">Dị ứng / kiêng</span>
          <p className="chu-be chu-nhat">
            Chỉ chọn từ danh sách cố định 14 nhóm chuẩn EU — để bộ lọc "An toàn dị ứng"
            ở các trang duyệt món so khớp được (§2.1.1).
          </p>
          <div className="chon-di-ung">
            {layNhomDiUng().map((n) => (
              <label key={n.ma} className="chon-di-ung__muc">
                <input
                  type="checkbox"
                  checked={diUng.includes(n.ma)}
                  onChange={() => doiDiUng(n.ma)}
                />
                <span>{n.ten}</span>
              </label>
            ))}
          </div>
          <p className="chu-be chu-nhat">
            Dị ứng ngoài 14 nhóm này (hiếm)? Báo qua <Link className="lien-ket" to="/cai-dat">Liên hệ hỗ trợ</Link>.
          </p>
        </div>

        {/* §2.2 — Ô KHOÁ, chỉ hiển thị, không sửa được. */}
        <div className="muc-tieu-khoa">
          <p className="muc-tieu-khoa__tieu-de">Mục tiêu dinh dưỡng (tự động, không thể chỉnh)</p>
          <p className="muc-tieu-khoa__so">
            {mucTieuXemTruoc.kcal_muc_tieu} kcal · {mucTieuXemTruoc.dam_muc_tieu}g đạm ·{' '}
            {mucTieuXemTruoc.canxi_muc_tieu}mg canxi · {mucTieuXemTruoc.sat_muc_tieu}mg sắt / ngày
          </p>
          <p className="chu-be chu-nhat">
            Tự động tính từ tuổi/giới/mức vận động, không thể chỉnh. Không có mục tiêu giảm/tăng cân (R-05).
          </p>
        </div>

        <MienTru />

        <CheckboxDongY daTick={daTickDongY} onDoi={datDaTickDongY} />

        {loi && <p className="loi-form">{loi}</p>}
        {daLuu && <p className="da-luu-thanh-cong">Đã lưu.</p>}

        <button className="nut nut--chinh nut--rong" onClick={luu} type="button">
          Lưu thay đổi
        </button>
      </Khoi>
    </>
  )
}
