/* =========================================================================
   GIAI ĐOẠN 1 — FORM
   Theo "Kế hoạch trang Lộ trình ăn uống" §3.
   -------------------------------------------------------------------------
   §3.1: Lấy sẵn từ Hồ sơ (KHÔNG hỏi lại) — tuổi, giới, mức vận động, dị
   ứng/kiêng, kcal & đạm mục tiêu. Chỉ hỏi: ngân sách tuần, mục đích, số
   bữa, ghi chú tự do.

   Pha 2 (07/08/2026) — số bữa quay về đúng 2 tổ hợp cố định của test/ (3
   hoặc 4 bữa/ngày, tỉ lệ buổi cố định theo từng tổ hợp — xem
   lib/thamSoLoTrinh.js), thay cho bản tick-tự-do-4-buổi trước đó (yêu cầu
   riêng cho DEMO 29/7, nay bỏ). Không còn cờ "bỏ qua sàn dinh dưỡng" — từ
   Pha 2, thuật toán LUÔN sinh được lộ trình (trừ dị ứng chặn cứng), cờ đó
   không còn cần thiết (xem lib/sinhLoTrinh.js).
   ========================================================================= */

import { useState } from 'react'
import CheckboxDongY from '../../components/CheckboxDongY.jsx'
import ThongDiepAnToan from '../../components/ThongDiepAnToan.jsx'
import MienTru from '../../components/MienTru.jsx'
import Khoi from '../../components/Khoi.jsx'
import { layHoSo, xacNhanDongY, tenNhomDiUng } from '../../data/api.js'
import { TEN_MUC_DICH } from '../../lib/sinhLoTrinh.js'
import { BUOI_THEO_SO_BUA, SAN_NGAN_SACH_TUAN } from '../../lib/thamSoLoTrinh.js'
import { tien, TEN_MUC_VAN_DONG } from '../../lib/dinhDang.js'

const SO_BUA_TUY_CHON = [
  { gia_tri: 3, nhan: 'Sáng · Trưa · Tối' },
  { gia_tri: 4, nhan: 'Sáng · Trưa · Chiều · Tối' },
]

export default function FormLoTrinh({ coLoTrinhDangChay, onHuy, onTao }) {
  const hoSo = layHoSo()

  const [nganSachTuan, datNganSachTuan] = useState(SAN_NGAN_SACH_TUAN[3])
  const [mucDich, datMucDich] = useState('du_chat_trong_ngan_sach')
  const [soBua, datSoBua] = useState(3)
  const [ghiChu, datGhiChu] = useState('')
  const [daTickDongY, datDaTickDongY] = useState(false)
  const [loiThieu, datLoiThieu] = useState('')

  // §3.6 — nếu đang có lộ trình chạy, nút bị khoá.
  if (coLoTrinhDangChay) {
    return (
      <Khoi tieuDe="Lộ trình ăn uống">
        <p className="chu-nhat">Bạn đang có lộ trình.</p>
        <button className="nut nut--chinh nut--rong" onClick={onHuy} type="button">
          Huỷ để tạo mới
        </button>
      </Khoi>
    )
  }

  const guiForm = () => {
    if (!nganSachTuan || nganSachTuan <= 0) {
      datLoiThieu('Nhập ngân sách tuần trước đã.')
      return
    }
    if (Number(nganSachTuan) < SAN_NGAN_SACH_TUAN[soBua]) {
      datLoiThieu(`Ngân sách tuần tối thiểu cho ${soBua} bữa/ngày là ${tien(SAN_NGAN_SACH_TUAN[soBua])} — mức này đảm bảo lộ trình có đủ món đạt dinh dưỡng cơ bản.`)
      return
    }
    if (!daTickDongY) {
      datLoiThieu('Cần tick đồng ý sử dụng app trước khi tạo lộ trình (R-34).')
      return
    }
    datLoiThieu('')
    xacNhanDongY()
    onTao({
      ngan_sach_tuan: Number(nganSachTuan),
      muc_dich: mucDich,
      cac_buoi_ap_dung: BUOI_THEO_SO_BUA[soBua],
      ghi_chu: ghiChu,
    })
  }

  return (
    <>
      <Khoi tieuDe="Tạo lộ trình 7 ngày" phu="Giai đoạn 1/4 — Form">
        {/* §3.1 — lấy sẵn từ Hồ sơ, KHÔNG hỏi lại. */}
        <div className="tom-tat-ho-so">
          <p className="chu-nho chu-nhat">Đã lấy từ Hồ sơ, không hỏi lại:</p>
          <p className="chu-nho">
            {hoSo.tuoi} tuổi · {hoSo.gioi === 'nam' ? 'Nam' : 'Nữ'} · vận động {TEN_MUC_VAN_DONG[hoSo.muc_van_dong] || hoSo.muc_van_dong}
            {hoSo.di_ung.length > 0 && <> · Dị ứng: {hoSo.di_ung.map(tenNhomDiUng).join(', ')}</>}
          </p>
          <p className="chu-nho chu-nhat">
            Mục tiêu ngày: {hoSo.kcal_muc_tieu} kcal · {hoSo.dam_muc_tieu}g đạm ·{' '}
            {hoSo.canxi_muc_tieu}mg canxi · {hoSo.sat_muc_tieu}mg sắt · {hoSo.kem_muc_tieu}mg kẽm
          </p>
        </div>

        <label className="truong-form">
          <span className="truong-form__nhan">Ngân sách tuần</span>
          <input
            type="number" min={0} step={10000}
            value={nganSachTuan}
            onChange={(e) => datNganSachTuan(e.target.value)}
          />
          <span className="chu-be chu-nhat">
            {tien(Number(nganSachTuan) || 0)} · Tối thiểu {tien(SAN_NGAN_SACH_TUAN[soBua])} cho {soBua} bữa/ngày
          </span>
        </label>

        <label className="truong-form">
          <span className="truong-form__nhan">Mục đích</span>
          <select value={mucDich} onChange={(e) => datMucDich(e.target.value)}>
            {Object.entries(TEN_MUC_DICH).map(([ma, nhan]) => (
              <option key={ma} value={ma}>{nhan}</option>
            ))}
          </select>
        </label>

        <div className="truong-form">
          <span className="truong-form__nhan">Số bữa/ngày</span>
          <div className="chon-buoi">
            {SO_BUA_TUY_CHON.map((s) => (
              <label key={s.gia_tri} className="chon-buoi__muc">
                <input
                  type="radio"
                  name="so-bua"
                  checked={soBua === s.gia_tri}
                  onChange={() => datSoBua(s.gia_tri)}
                />
                <span>{s.nhan}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="truong-form">
          <span className="truong-form__nhan">Có gì bạn muốn nói thêm không?</span>
          <textarea
            rows={2}
            placeholder="Ví dụ: tránh cay, muốn đổi món liên tục..."
            value={ghiChu}
            onChange={(e) => datGhiChu(e.target.value)}
          />
        </label>

        <CheckboxDongY daTick={daTickDongY} onDoi={datDaTickDongY} />

        {loiThieu && <p className="loi-form">{loiThieu}</p>}

        <button className="nut nut--chinh nut--rong" onClick={guiForm} type="button">
          Tạo lộ trình
        </button>
      </Khoi>

      <MienTru />
      <ThongDiepAnToan />
    </>
  )
}
