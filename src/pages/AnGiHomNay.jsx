/* =========================================================================
   TRANG "ĂN GÌ HÔM NAY" — duyệt món quanh trường, ghi nhận qua Khu vực 3
   Theo "Kế hoạch trang Ăn gì hôm nay" — không AI, không phụ thuộc lộ trình.
   -------------------------------------------------------------------------
   §1.2 — Nguyên tắc cốt lõi:
     • Không AI. Toàn bộ là duyệt + lọc + hiển thị dữ liệu có sẵn.
     • Không sở hữu dữ liệu riêng. Đọc Khu vực 4, ghi vào Khu vực 3
       (goi_y_ghi_nhan, nguon = tu_chon) khi xác nhận ăn.
     • Một hành động ghi duy nhất — xác nhận "Đã ăn món này" TRONG modal.

   §2 — Hai khu vực TÁCH BIỆT HOÀN TOÀN: Khu A (Đề xuất nổi bật, luôn 5 thẻ,
   dải cuộn ngang, không tự xuống hàng) và Khu B (Duyệt toàn bộ, lưới thẻ
   tự co giãn — CSS grid auto-fit).
   ========================================================================= */

import { useEffect, useMemo, useState } from 'react'
import Khoi from '../components/Khoi.jsx'
import TheMon from '../components/TheMon.jsx'
import ModalMon from '../components/ModalMon.jsx'
import LocDiUng from '../components/LocDiUng.jsx'
import TrangThaiRong from '../components/TrangThaiRong.jsx'
import { layDeXuatNoiBat, layTatCaMonKemQuan, layHoSo } from '../data/api.js'
import { xepRoundRobinTheoQuan } from '../lib/xepThuTu.js'
import { boDauChu } from '../lib/dinhDang.js'
import { monAnToanChoDiUng } from '../lib/diUng.js'

export default function AnGiHomNay() {
  const hoSo = layHoSo()

  // Tăng lên sau khi ghi nhận thành công để khối "Đề xuất nổi bật" tính lại
  // (COUNT trên goi_y_ghi_nhan vừa có thêm 1 dòng — §2.1).
  const [phienBan, datPhienBan] = useState(0)
  const [monDangXem, datMonDangXem] = useState(null)

  const [tuKhoa, datTuKhoa] = useState('')
  const [locDiUng, datLocDiUng] = useState({ cheDo: 'theo_ho_so', dsChon: hoSo.di_ung, khongLoc: false })
  const [locBuoi, datLocBuoi] = useState('tat_ca')
  const [giaToiDa, datGiaToiDa] = useState(50000)
  const [khoangCachToiDa, datKhoangCachToiDa] = useState(2000)

  // Đề xuất nổi bật đọc bảng Supabase ẩn danh thật (ASYNC từ 05/08/2026) —
  // xem ghi chú ở api.js layDeXuatNoiBat.
  const [deXuatNoiBat, datDeXuatNoiBat] = useState([])
  useEffect(() => {
    let huy = false
    layDeXuatNoiBat(5).then((kq) => { if (!huy) datDeXuatNoiBat(kq) })
    return () => { huy = true }
  }, [phienBan])

  /* §3.1 — Khu vực 4 tải một lần, lọc trên dữ liệu đã có trong bộ nhớ.
     §3.2 — sau khi lọc, xếp lại theo round-robin để không dồn cục 1 quán. */
  const monKhopLoc = useMemo(() => {
    const tk = boDauChu(tuKhoa.trim())

    const dsDiUngCanLoc = locDiUng.cheDo === 'theo_ho_so'
      ? hoSo.di_ung
      : (locDiUng.khongLoc ? [] : locDiUng.dsChon)

    const daLoc = layTatCaMonKemQuan().filter((m) => {
      if (tk && !boDauChu(m.ten_mon).includes(tk) && !boDauChu(m.quan.ten_quan).includes(tk)) {
        return false
      }
      if (!monAnToanChoDiUng(m, dsDiUngCanLoc)) return false
      if (locBuoi !== 'tat_ca' && !m.buoi.includes(locBuoi)) return false
      if (m.gia > giaToiDa) return false
      if (m.quan.khoang_cach_m > khoangCachToiDa) return false
      return true
    })

    return xepRoundRobinTheoQuan(daLoc)
  }, [tuKhoa, locDiUng, locBuoi, giaToiDa, khoangCachToiDa, hoSo])

  return (
    <>
      {/* ---- KHU A — ĐỀ XUẤT NỔI BẬT (§2.1) --------------------------- */}
      <Khoi tieuDe="Đề xuất nổi bật" phu="Được chọn nhiều nhất 7 ngày qua">
        {deXuatNoiBat.length === 0 ? (
          <TrangThaiRong>Chưa có dữ liệu 7 ngày qua.</TrangThaiRong>
        ) : (
          <div className="dai-ngang">
            {deXuatNoiBat.map((m) => (
              <TheMon key={m.id} mon={m} onChon={datMonDangXem} />
            ))}
          </div>
        )}
      </Khoi>

      {/* ---- KHU B — DUYỆT TOÀN BỘ (§2.2) ------------------------------ */}
      <Khoi tieuDe="Duyệt toàn bộ">
        <input
          className="o-tim-kiem"
          type="search"
          placeholder="Tìm theo tên món hoặc tên quán..."
          value={tuKhoa}
          onChange={(e) => datTuKhoa(e.target.value)}
        />

        <div className="thanh-loc">
          <div className="thanh-loc__hang">
            <label className="thanh-loc__muc">
              <span className="chu-nho chu-nhat">Buổi bán</span>
              <select value={locBuoi} onChange={(e) => datLocBuoi(e.target.value)}>
                <option value="tat_ca">Tất cả</option>
                <option value="sang">Sáng</option>
                <option value="trua">Trưa</option>
                <option value="chieu">Chiều</option>
                <option value="toi">Tối</option>
              </select>
            </label>

            <label className="thanh-loc__muc">
              <span className="chu-nho chu-nhat">
                Giá tối đa: {giaToiDa >= 50000 ? 'Không giới hạn' : `${giaToiDa.toLocaleString('vi-VN')}đ`}
              </span>
              <input
                type="range" min={10000} max={50000} step={1000}
                value={giaToiDa} onChange={(e) => datGiaToiDa(Number(e.target.value))}
              />
            </label>

            <label className="thanh-loc__muc">
              <span className="chu-nho chu-nhat">
                Khoảng cách tối đa: {khoangCachToiDa >= 2000 ? 'Không giới hạn' : `${khoangCachToiDa}m`}
              </span>
              <input
                type="range" min={100} max={2000} step={100}
                value={khoangCachToiDa} onChange={(e) => datKhoangCachToiDa(Number(e.target.value))}
              />
            </label>
          </div>

          <LocDiUng giaTri={locDiUng} onDoi={datLocDiUng} />
        </div>

        {monKhopLoc.length === 0 ? (
          <TrangThaiRong>Không có món nào khớp bộ lọc hiện tại.</TrangThaiRong>
        ) : (
          <div className="luoi-mon">
            {monKhopLoc.map((m) => (
              <TheMon key={m.id} mon={m} onChon={datMonDangXem} />
            ))}
          </div>
        )}
      </Khoi>

      {monDangXem && (
        <ModalMon
          mon={monDangXem}
          onDong={() => datMonDangXem(null)}
          onDaGhiNhan={() => datPhienBan((p) => p + 1)}
        />
      )}
    </>
  )
}
