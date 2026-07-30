/* =========================================================================
   GIAI ĐOẠN 4 — THEO DÕI (TRANG CHÍNH)
   Theo "Kế hoạch trang Lộ trình ăn uống" §6.
   -------------------------------------------------------------------------
   §1.2 — Triết lý: người hướng dẫn, không phải cảnh sát. Không ép tuân
   thủ: không streak, không điểm trừ, không thông điệp phán xét.

   §6.2 — Luồng ghi nhận 1 bữa: chạm ô → hiện 3 món khớp khung → chọn 1 +
   xác nhận (gộp làm MỘT hành động, không có bước tick riêng, §6.6) HOẶC
   "Món khác" (hạng 4,5,6... vẫn trong khung, hết thì báo hết) HOẶC "Ăn
   ngoài kế hoạch" (tuỳ chọn gõ tên món, §6.4a) HOẶC không làm gì (để
   trống = "chưa ăn", không tạo dòng rỗng — Cơ sở dữ liệu §2.5).

   Chỉ ô của HÔM NAY hoặc NGÀY ĐÃ QUA mới ghi nhận được — §2.1: "Đến đúng
   bữa đó, hệ thống mới lấp khung bằng các món có thật", ngụ ý chưa tới
   ngày thì chưa có gì để lấp. Đây là suy luận của nhóm dựng giao diện,
   không phải câu chữ tường minh trong tài liệu — cần bạn xác nhận.
   ========================================================================= */

import { useState } from 'react'
import Khoi from '../../components/Khoi.jsx'
import TheMon from '../../components/TheMon.jsx'
import NhanTrangThai from '../../components/NhanTrangThai.jsx'
import { TEN_BUOI, TEN_NGUON, tien } from '../../lib/dinhDang.js'
import { TEN_MUC_DICH } from '../../lib/sinhLoTrinh.js'
import {
  layTatCaKhungTheoNgay, layTatCaGhiNhanLoTrinh, layThuTuNgayHomNay,
  layMonKhopKhung, ghiNhanBuaLoTrinh,
} from '../../data/api.js'

const TEN_THU = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

function ngayDuongLich(ngayBatDau, thuTuNgay) {
  const d = new Date(ngayBatDau)
  d.setDate(d.getDate() + (thuTuNgay - 1))
  return `${TEN_THU[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function TheoDoi({ loTrinh, onHuy }) {
  const [phienBan, datPhienBan] = useState(0)
  const lamMoi = () => datPhienBan((p) => p + 1)

  // Ô đang mở — chỉ 1 ô mở tại một thời điểm.
  const [oDangMo, datODangMo] = useState(null) // { khungId, ngay, buoi } | null
  const [tatCaKhop, datTatCaKhop] = useState([])
  const [offsetXem, datOffsetXem] = useState(0)
  const [soLanBamMonKhac, datSoLanBamMonKhac] = useState(0)
  const [dangChonMonId, datDangChonMonId] = useState(null)
  const [cheDoNgoaiKeHoach, datCheDoNgoaiKeHoach] = useState(false)
  const [tenMonTuGo, datTenMonTuGo] = useState('')

  const khungTheoNgay = layTatCaKhungTheoNgay()
  const ghiNhan = layTatCaGhiNhanLoTrinh()
  const thuTuHomNay = layThuTuNgayHomNay()

  const timGhiNhan = (khungId) => ghiNhan.find((g) => g.lo_trinh_khung_id === khungId)

  const dongO = () => {
    datODangMo(null)
    datDangChonMonId(null)
    datCheDoNgoaiKeHoach(false)
    datTenMonTuGo('')
  }

  const moO = (khung, ngay) => {
    datODangMo({ khungId: khung.id, ngay, buoi: khung.buoi })
    datTatCaKhop(layMonKhopKhung(khung, 999))
    datOffsetXem(0)
    datSoLanBamMonKhac(0)
    datDangChonMonId(null)
    datCheDoNgoaiKeHoach(false)
    datTenMonTuGo('')
  }

  const bamMonKhac = () => {
    datOffsetXem((o) => o + 3)
    datSoLanBamMonKhac((n) => n + 1)
    datDangChonMonId(null)
  }

  const xacNhanTrongKhung = () => {
    const mon = tatCaKhop.find((m) => m.id === dangChonMonId)
    if (!mon) return
    ghiNhanBuaLoTrinh({
      id: `gn-${Date.now()}`,
      lo_trinh_khung_id: oDangMo.khungId,
      trang_thai: 'da_an_trong_khung',
      mon_id: mon.id,
      mon_tu_ghi: null,
      gia_tai_thoi_diem: mon.gia,
      kcal_tai_thoi_diem: mon.kcal,
      dam_tai_thoi_diem: mon.dam_g,
      glucid_tai_thoi_diem: mon.glucid_g,
      lipid_tai_thoi_diem: mon.lipid_g,
      canxi_tai_thoi_diem: mon.canxi_mg,
      sat_tai_thoi_diem: mon.sat_mg,
      so_lan_bam_mon_khac: soLanBamMonKhac,
      thoi_gian_ghi_nhan: new Date().toISOString(),
    })
    dongO()
    lamMoi()
  }

  const xacNhanNgoaiKeHoach = () => {
    ghiNhanBuaLoTrinh({
      id: `gn-${Date.now()}`,
      lo_trinh_khung_id: oDangMo.khungId,
      trang_thai: 'da_an_ngoai_khung',
      mon_id: null,
      mon_tu_ghi: tenMonTuGo.trim() || null,
      gia_tai_thoi_diem: null,
      kcal_tai_thoi_diem: null,
      dam_tai_thoi_diem: null,
      glucid_tai_thoi_diem: null,
      lipid_tai_thoi_diem: null,
      canxi_tai_thoi_diem: null,
      sat_tai_thoi_diem: null,
      so_lan_bam_mon_khac: soLanBamMonKhac,
      thoi_gian_ghi_nhan: new Date().toISOString(),
    })
    dongO()
    lamMoi()
  }

  const bamHuy = () => {
    if (window.confirm('Huỷ lộ trình đang chạy? Lịch sử đã ghi nhận vẫn được giữ lại.')) {
      onHuy()
    }
  }

  // §6.6 — Tỉ lệ hoàn thành = % trang_thai=da_an_trong_khung, trên TOÀN
  // BỘ khung của tuần (không chỉ hôm nay). Số liệu tự-báo-cáo (§6.6).
  const tongSoKhung = khungTheoNgay.reduce((t, n) => t + n.cac_khung.length, 0)
  const soDungKhung = ghiNhan.filter((g) => g.trang_thai === 'da_an_trong_khung').length

  const uiCandidate = oDangMo ? tatCaKhop.slice(offsetXem, offsetXem + 3) : []

  return (
    <>
      <Khoi
        tieuDe="Lộ trình của bạn"
        phu={`Giai đoạn 4/4 — Theo dõi · ${TEN_MUC_DICH[loTrinh.muc_dich] ?? loTrinh.muc_dich}`}
        hanhDong={<button className="lien-ket" onClick={bamHuy} type="button">Huỷ lộ trình</button>}
      >
        <p className="chu-nho chu-nhat ti-le-hoan-thanh">
          Tuần này: {soDungKhung}/{tongSoKhung} bữa đúng khung. Ngân sách tuần: {tien(loTrinh.ngan_sach_tuan)}.
        </p>
      </Khoi>

      {khungTheoNgay.map(({ thu_tu_ngay, cac_khung }) => {
        const laTuongLai = thu_tu_ngay > thuTuHomNay
        const laHomNay = thu_tu_ngay === thuTuHomNay

        return (
          <Khoi
            key={thu_tu_ngay}
            tieuDe={`Ngày ${thu_tu_ngay} — ${ngayDuongLich(loTrinh.ngay_bat_dau, thu_tu_ngay)}${laHomNay ? ' · Hôm nay' : ''}`}
          >
            <div className="danh-sach-bua">
              {cac_khung.map((khung) => {
                const gn = timGhiNhan(khung.id)
                const dangMoONay = oDangMo?.khungId === khung.id

                return (
                  <div className="o-bua" key={khung.id}>
                    <button
                      className={`o-bua__hang${laTuongLai ? ' o-bua__hang--khoa' : ''}`}
                      type="button"
                      disabled={laTuongLai}
                      onClick={() => (dangMoONay ? dongO() : moO(khung, thu_tu_ngay))}
                    >
                      <span className="o-bua__buoi">{TEN_BUOI[khung.buoi]} ({TEN_NGUON[khung.nguon]})</span>

                      {laTuongLai && <span className="chu-be chu-nhat">Chưa tới</span>}

                      {!laTuongLai && !gn && <span className="chu-be chu-nhat">Chạm để ghi nhận</span>}

                      {gn?.trang_thai === 'da_an_trong_khung' && (
                        <span className="o-bua__ket-qua">
                          <NhanTrangThai loai="trong_khung" />
                        </span>
                      )}
                      {gn?.trang_thai === 'da_an_ngoai_khung' && (
                        <span className="o-bua__ket-qua">
                          <NhanTrangThai loai="ngoai_ke_hoach" />
                        </span>
                      )}
                    </button>

                    {dangMoONay && (
                      <div className="bang-chon-mon">
                        {!cheDoNgoaiKeHoach && (
                          <>
                            {uiCandidate.length > 0 ? (
                              <div className="dai-ngang">
                                {uiCandidate.map((m) => (
                                  <div
                                    key={m.id}
                                    className={`the-mon-chon${dangChonMonId === m.id ? ' the-mon-chon--dang-chon' : ''}`}
                                    onClick={() => datDangChonMonId(m.id)}
                                  >
                                    <TheMon mon={m} />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="chu-nhat chu-nho">Hết món khớp khung cho bữa này.</p>
                            )}

                            <div className="hang-nut-chon-mon">
                              {dangChonMonId && (
                                <button className="nut nut--chinh" onClick={xacNhanTrongKhung} type="button">
                                  Xác nhận
                                </button>
                              )}
                              {uiCandidate.length > 0 && (
                                <button className="nut" onClick={bamMonKhac} type="button">
                                  Món khác
                                </button>
                              )}
                              <button className="nut" onClick={() => datCheDoNgoaiKeHoach(true)} type="button">
                                Ăn ngoài lộ trình
                              </button>
                            </div>
                          </>
                        )}

                        {cheDoNgoaiKeHoach && (
                          <div className="ngoai-ke-hoach-form">
                            <input
                              type="text"
                              placeholder="Bạn ăn gì? (không bắt buộc)"
                              value={tenMonTuGo}
                              onChange={(e) => datTenMonTuGo(e.target.value)}
                            />
                            <div className="hang-nut-chon-mon">
                              <button className="nut nut--chinh" onClick={xacNhanNgoaiKeHoach} type="button">
                                Xác nhận
                              </button>
                              <button className="nut" onClick={() => datCheDoNgoaiKeHoach(false)} type="button">
                                Quay lại
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Khoi>
        )
      })}
    </>
  )
}
