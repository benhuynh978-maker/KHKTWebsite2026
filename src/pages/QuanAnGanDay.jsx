/* =========================================================================
   TRANG "QUÁN ĂN GẦN ĐÂY" — duyệt theo quán trước, món của quán sau
   Theo "Kế hoạch trang Quán ăn gần đây" — cặp đôi với "Ăn gì hôm nay":
   cùng đọc Khu vực 4, cùng ghi Khu vực 3 (goi_y_ghi_nhan, nguon=tu_chon),
   cùng dùng chung ngưỡng chống spam. Khác biệt DUY NHẤT: tổ chức theo
   QUÁN trước (mỗi khối = 1 quán), không trộn món nhiều quán.
   -------------------------------------------------------------------------
   §2.1 — Thứ tự các khối quán: NGẪU NHIÊN.
   §2.2 — Thứ tự món trong dải kéo ngang mỗi quán: NGẪU NHIÊN.
   §4.1 — Tìm kiếm CHỈ theo tên quán (khác "Ăn gì hôm nay": tìm cả món).
   §8   — Điểm chưa chốt: trang này KHÔNG có bộ lọc giá (khác "Ăn gì hôm
          nay"), và KHÔNG có mục "Đề xuất nổi bật" — cả hai đang là
          "chưa xác nhận cố ý hay cần bổ sung" trong tài liệu, nên giữ
          đúng như vậy ở đây, không tự thêm.
   ⚠ Thêm 29/7 — số điện thoại quán (yêu cầu riêng, ngoài §4.1): hiện
          ngay trên dòng thông tin quán (q.so_dien_thoai), không cần mở
          modal mới liên hệ được.
   ========================================================================= */

import { useMemo, useState } from 'react'
import Khoi from '../components/Khoi.jsx'
import TheMon from '../components/TheMon.jsx'
import ModalMon from '../components/ModalMon.jsx'
import LocDiUng from '../components/LocDiUng.jsx'
import TrangThaiRong from '../components/TrangThaiRong.jsx'
import { layTatCaQuanKemMon, layHoSo } from '../data/api.js'
import { xaoTron } from '../lib/xepThuTu.js'
import { khoangCach, boDauChu, TEN_NGUON } from '../lib/dinhDang.js'

export default function QuanAnGanDay() {
  const hoSo = layHoSo()
  const [monDangXem, datMonDangXem] = useState(null)

  const [tuKhoa, datTuKhoa] = useState('')
  const [locDiUng, datLocDiUng] = useState({ cheDo: 'theo_ho_so', dsChon: hoSo.di_ung, khongLoc: false })
  const [locLoaiHinh, datLocLoaiHinh] = useState('tat_ca')
  const [locBuoi, datLocBuoi] = useState('tat_ca')
  const [khoangCachToiDa, datKhoangCachToiDa] = useState(2000)

  /* Xáo trộn CHỈ MỘT LẦN khi vào trang (§2.1, §2.2) — không xáo lại mỗi
     lần gõ tìm kiếm/đổi bộ lọc, tránh thẻ nhảy lung tung khi đang lọc. */
  const thuTuCoDinh = useMemo(() => {
    const tatCa = layTatCaQuanKemMon()
    return xaoTron(tatCa).map((q) => ({ ...q, mon: xaoTron(q.mon) }))
  }, [])

  const dsHienThi = useMemo(() => {
    const tk = boDauChu(tuKhoa.trim())
    const dsDiUngCanLoc = locDiUng.cheDo === 'theo_ho_so'
      ? hoSo.di_ung
      : (locDiUng.khongLoc ? [] : locDiUng.dsChon)

    return thuTuCoDinh
      .filter((q) => {
        if (tk && !boDauChu(q.ten_quan).includes(tk)) return false
        if (locLoaiHinh !== 'tat_ca' && q.loai_hinh !== locLoaiHinh) return false
        if (q.khoang_cach_m > khoangCachToiDa) return false
        return true
      })
      .map((q) => ({
        ...q,
        mon: q.mon.filter((m) => {
          if (dsDiUngCanLoc.length > 0 && m.thanh_phan_di_ung.some((d) => dsDiUngCanLoc.includes(d))) {
            return false
          }
          if (locBuoi !== 'tat_ca' && !m.buoi.includes(locBuoi)) return false
          return true
        }),
      }))
      // Quán còn tên nhưng hết món khớp lọc → không hiện khối rỗng.
      .filter((q) => q.mon.length > 0)
  }, [thuTuCoDinh, tuKhoa, locDiUng, locLoaiHinh, locBuoi, khoangCachToiDa, hoSo])

  return (
    <>
      <Khoi tieuDe="Quán ăn gần đây">
        <input
          className="o-tim-kiem"
          type="search"
          placeholder="Tìm theo tên quán..."
          value={tuKhoa}
          onChange={(e) => datTuKhoa(e.target.value)}
        />

        <div className="thanh-loc">
          <div className="thanh-loc__hang">
            <label className="thanh-loc__muc">
              <span className="chu-nho chu-nhat">Loại hình</span>
              <select value={locLoaiHinh} onChange={(e) => datLocLoaiHinh(e.target.value)}>
                <option value="tat_ca">Tất cả</option>
                <option value="cang_tin">Căng tin</option>
                <option value="quan_ngoai">Quán ngoài</option>
              </select>
            </label>

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
      </Khoi>

      {dsHienThi.length === 0 ? (
        <TrangThaiRong>Không có quán nào khớp bộ lọc hiện tại.</TrangThaiRong>
      ) : (
        dsHienThi.map((q) => (
          <Khoi
            key={q.id}
            tieuDe={q.ten_quan}
            phu={`${TEN_NGUON[q.loai_hinh]} · ${khoangCach(q.khoang_cach_m)}`}
          >
            <p className="chu-nho chu-nhat khoi-quan__thong-tin">
              {q.dia_chi} · {q.khoang_gio_hoat_dong} · {q.ngay_ban_va_nghi}
              {q.so_dien_thoai && <> · 📞 {q.so_dien_thoai}</>}
            </p>
            <div className="dai-ngang">
              {q.mon.map((m) => (
                <TheMon key={m.id} mon={{ ...m, quan: q }} onChon={datMonDangXem} />
              ))}
            </div>
          </Khoi>
        ))
      )}

      {monDangXem && (
        <ModalMon mon={monDangXem} onDong={() => datMonDangXem(null)} />
      )}
    </>
  )
}
