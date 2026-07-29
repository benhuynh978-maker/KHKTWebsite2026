/* =========================================================================
   TRANG LỊCH SỬ
   Theo "Kế hoạch trang Lịch sử" — chỉ xem + xoá, không sở hữu dữ liệu riêng.
   -------------------------------------------------------------------------
   §7 — NGUYÊN TẮC AN TOÀN TÂM LÝ (quan trọng nhất của trang này):
   Rủi ro xuất hiện ở cấp độ DANH SÁCH, không phải từng dòng (§7.1). Hai
   quyết định chặn rủi ro (§7.2):
     • KHÔNG tô màu phân biệt theo nhãn — NhanTrangThai đã tự ép việc này.
     • KHÔNG hiển thị tổng số đếm theo nhãn ở đầu trang (kiểu
       "23 Trong lộ trình · 5 Ngoài lộ trình") — nhìn thoáng qua rất tiện,
       nhưng đó chính xác là một bảng điểm, đi ngược R-09.

   Đổi tên 29/7: nhãn "Trong khung" → "Trong lộ trình", "Ngoài kế hoạch" →
   "Ngoài lộ trình" (chỉ đổi chữ hiển thị — xem NhanTrangThai.jsx).
   ========================================================================= */

import { useMemo, useState } from 'react'
import Khoi from '../components/Khoi.jsx'
import MienTru from '../components/MienTru.jsx'
import NhanTrangThai from '../components/NhanTrangThai.jsx'
import TrangThaiRong from '../components/TrangThaiRong.jsx'
import { layLichSuHopNhat, xoaDongLichSu } from '../data/api.js'
import { tien, boDauChu, TEN_BUOI } from '../lib/dinhDang.js'

function nhanNgay(iso) {
  const d = new Date(iso)
  const homNay = new Date(); homNay.setHours(0, 0, 0, 0)
  const homQua = new Date(homNay); homQua.setDate(homQua.getDate() - 1)
  const ngayDong = new Date(d); ngayDong.setHours(0, 0, 0, 0)

  if (ngayDong.getTime() === homNay.getTime()) return 'Hôm nay'
  if (ngayDong.getTime() === homQua.getTime()) return 'Hôm qua'
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function gio(iso) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function LichSu() {
  const [phienBan, datPhienBan] = useState(0)
  const [tuKhoa, datTuKhoa] = useState('')
  const [locKhoangThoiGian, datLocKhoangThoiGian] = useState('tat_ca')
  const [locNhan, datLocNhan] = useState('tat_ca')
  const [giaToiThieu, datGiaToiThieu] = useState('')
  const [giaToiDa, datGiaToiDa] = useState('')
  const [dongDangXoa, datDongDangXoa] = useState(null)

  const toanBo = useMemo(() => layLichSuHopNhat(), [phienBan])

  const daLoc = useMemo(() => {
    const tk = boDauChu(tuKhoa.trim())
    const bayNgayTruoc = Date.now() - 7 * 24 * 60 * 60 * 1000
    const baMuoiNgayTruoc = Date.now() - 30 * 24 * 60 * 60 * 1000
    const dauHomNay = new Date(); dauHomNay.setHours(0, 0, 0, 0)

    return toanBo.filter((d) => {
      // §3.1 — dòng không có tên món không khớp từ khoá nào (đúng bản
      // chất, không phải lỗi).
      if (tk && !(d.ten_mon && boDauChu(d.ten_mon).includes(tk))) return false

      if (locKhoangThoiGian === 'hom_nay' && new Date(d.thoi_gian_ghi_nhan) < dauHomNay) return false
      if (locKhoangThoiGian === '7_ngay' && new Date(d.thoi_gian_ghi_nhan).getTime() < bayNgayTruoc) return false
      if (locKhoangThoiGian === '30_ngay' && new Date(d.thoi_gian_ghi_nhan).getTime() < baMuoiNgayTruoc) return false

      if (locNhan !== 'tat_ca' && d.nhan !== locNhan) return false

      // Dòng không có giá (ngoài lộ trình, không gõ tên) không khớp bộ
      // lọc giá nào — cùng nguyên tắc với tìm kiếm (§3.2).
      if (giaToiThieu && (d.gia == null || d.gia < Number(giaToiThieu))) return false
      if (giaToiDa && (d.gia == null || d.gia > Number(giaToiDa))) return false

      return true
    })
  }, [toanBo, tuKhoa, locKhoangThoiGian, locNhan, giaToiThieu, giaToiDa])

  const theoNgay = useMemo(() => {
    const nhom = new Map()
    for (const d of daLoc) {
      const nhan = nhanNgay(d.thoi_gian_ghi_nhan)
      if (!nhom.has(nhan)) nhom.set(nhan, [])
      nhom.get(nhan).push(d)
    }
    return [...nhom.entries()]
  }, [daLoc])

  const bamXoa = (dong) => {
    xoaDongLichSu(dong)
    datDongDangXoa(null)
    datPhienBan((p) => p + 1)
  }

  return (
    <>
      <Khoi tieuDe="Lịch sử ăn uống">
        <input
          className="o-tim-kiem"
          type="search"
          placeholder="Tìm theo tên món..."
          value={tuKhoa}
          onChange={(e) => datTuKhoa(e.target.value)}
        />

        <div className="thanh-loc">
          <div className="thanh-loc__hang">
            <label className="thanh-loc__muc">
              <span className="chu-nho chu-nhat">Khoảng thời gian</span>
              <select value={locKhoangThoiGian} onChange={(e) => datLocKhoangThoiGian(e.target.value)}>
                <option value="tat_ca">Tất cả</option>
                <option value="hom_nay">Hôm nay</option>
                <option value="7_ngay">7 ngày</option>
                <option value="30_ngay">30 ngày</option>
              </select>
            </label>

            <label className="thanh-loc__muc">
              <span className="chu-nho chu-nhat">Nhãn trạng thái</span>
              <select value={locNhan} onChange={(e) => datLocNhan(e.target.value)}>
                <option value="tat_ca">Tất cả</option>
                <option value="trong_khung">Trong lộ trình</option>
                <option value="ngoai_ke_hoach">Ngoài lộ trình</option>
                <option value="goi_y_nhanh">Gợi ý nhanh</option>
                <option value="tu_chon">Tự chọn</option>
              </select>
            </label>

            <label className="thanh-loc__muc">
              <span className="chu-nho chu-nhat">Khoảng giá</span>
              <div className="hang-khoang-gia">
                <input
                  type="number" placeholder="Từ" min={0}
                  value={giaToiThieu} onChange={(e) => datGiaToiThieu(e.target.value)}
                />
                <span>–</span>
                <input
                  type="number" placeholder="Đến" min={0}
                  value={giaToiDa} onChange={(e) => datGiaToiDa(e.target.value)}
                />
              </div>
            </label>
          </div>
        </div>
      </Khoi>

      {daLoc.length === 0 ? (
        <Khoi>
          <TrangThaiRong>
            {toanBo.length === 0
              ? 'Chưa có lịch sử nào — hãy thử Gợi ý nhanh hoặc tạo lộ trình.'
              : 'Không có mục nào khớp bộ lọc hiện tại.'}
          </TrangThaiRong>
        </Khoi>
      ) : (
        theoNgay.map(([nhanNgayHienThi, dongTrongNgay]) => (
          <Khoi key={nhanNgayHienThi} tieuDe={nhanNgayHienThi}>
            <ul className="ds-lich-su">
              {dongTrongNgay.map((d) => (
                <li className="dong-lich-su" key={`${d.xoaNguon}-${d.id}`}>
                  <span className="dong-lich-su__gio chu-nho chu-nhat">{gio(d.thoi_gian_ghi_nhan)}</span>

                  <div className="day">
                    <p className="dong-lich-su__ten">
                      {d.ten_mon ?? <span className="chu-nhat">(không ghi tên món)</span>}
                    </p>
                    <p className="chu-nho chu-nhat">
                      {d.ten_quan ?? '—'}
                      {d.buoi && (
                        <>
                          {' · '}{TEN_BUOI[d.buoi]}{d.buoiSuyDoan ? ' (ước tính)' : ''}
                        </>
                      )}
                    </p>
                    {/* §4.1 — số dinh dưỡng CÓ hiển thị ở đây (khác Dashboard,
                        nơi số cộng dồn bị giấu). Đây là con số của MỘT bữa đã
                        ăn xong, đã chốt — rủi ro thấp hơn một tổng đang "chạy". */}
                    {d.kcal != null && (
                      <p className="chu-nho chu-nhat">
                        {d.kcal} kcal · {d.dam}g đạm
                        {d.canxi != null && <> · {d.canxi}mg canxi</>}
                        {d.sat != null && <> · {d.sat}mg sắt</>}
                      </p>
                    )}
                  </div>

                  <span className="dong-lich-su__gia chu-nho">{d.gia != null ? tien(d.gia) : '—'}</span>

                  <NhanTrangThai loai={d.nhan} />

                  {dongDangXoa === `${d.xoaNguon}-${d.id}` ? (
                    <div className="xac-nhan-xoa-dong">
                      <button className="nut nut--nguy-hiem" onClick={() => bamXoa(d)} type="button">Xoá</button>
                      <button className="nut" onClick={() => datDongDangXoa(null)} type="button">Huỷ</button>
                    </div>
                  ) : (
                    <button
                      className="dong-lich-su__nut-xoa"
                      onClick={() => datDongDangXoa(`${d.xoaNguon}-${d.id}`)}
                      type="button"
                      aria-label="Xoá dòng này"
                    >
                      Xoá
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Khoi>
        ))
      )}

      {toanBo.some((d) => d.kcal != null) && <MienTru />}
    </>
  )
}
