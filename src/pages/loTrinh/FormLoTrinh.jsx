/* =========================================================================
   GIAI ĐOẠN 1 — FORM
   Theo "Kế hoạch trang Lộ trình ăn uống" §3.
   -------------------------------------------------------------------------
   §3.1: Lấy sẵn từ Hồ sơ (KHÔNG hỏi lại) — tuổi, giới, mức vận động, dị
   ứng/kiêng, kcal & đạm mục tiêu. Chỉ hỏi: ngân sách tuần, mục đích, buổi
   muốn hệ thống lo, ghi chú tự do.

   ⚠ MVP lộ trình CHỈ quản lý trưa + tối (nêu nhiều nơi: Kế hoạch dự án
     §5.3, Dashboard §3.2) — nhưng chính §3.1 tài liệu này LẠI liệt kê
     "sáng/chiều/tối tuỳ chọn" như thể cả 4 buổi đều chọn được. Đây là một
     điểm chưa khớp giữa 2 tài liệu (đã nêu ở buổi rà soát trước).

   Đổi 29/7 (yêu cầu riêng cho DEMO, cố ý đi khác MVP): mở khoá cả 4 buổi,
   không khoá sáng/chiều nữa — xem thêm ghi chú "DEMO" ở lib/sinhLoTrinh.js
   vì chọn đủ 4 buổi sẽ vét cạn rất nhanh 18 món demo hiện có (đặc biệt
   buổi chiều chỉ có 2 món khớp), nên tầng tiền kiểm tồn kho cũng được nới
   khi bật cờ demo bên dưới.
   ========================================================================= */

import { useState } from 'react'
import CheckboxDongY from '../../components/CheckboxDongY.jsx'
import ThongDiepAnToan from '../../components/ThongDiepAnToan.jsx'
import Khoi from '../../components/Khoi.jsx'
import { layHoSo, xacNhanDongY, tenNhomDiUng } from '../../data/api.js'
import { TEN_MUC_DICH } from '../../lib/sinhLoTrinh.js'
import { tien } from '../../lib/dinhDang.js'

const BUOI_TUY_CHON = [
  { ma: 'sang', nhan: 'Sáng' },
  { ma: 'trua', nhan: 'Trưa' },
  { ma: 'chieu', nhan: 'Chiều' },
  { ma: 'toi', nhan: 'Tối' },
]

export default function FormLoTrinh({ coLoTrinhDangChay, onHuy, onTao }) {
  const hoSo = layHoSo()

  // DEMO 29/7 — ngân sách mặc định nâng 350k→500k và cờ "bỏ qua sàn" bật
  // SẴN, để luồng mặc định (không sửa gì, chỉ bấm Tạo lộ trình) luôn đi
  // hết 4 giai đoạn thành công. Xem lib/sinhLoTrinh.js ghi chú #2b: với
  // hồ sơ demo (kcal_muc_tieu 2500), sàn kcal_min bữa trưa (744) CAO HƠN
  // món căng-tin đắt calo nhất hiện có (720) — nếu không bật cờ này, MỌI
  // lộ trình mới đều bị chặn ở Giai đoạn 2 bất kể ngân sách.
  const [nganSachTuan, datNganSachTuan] = useState(500000)
  const [mucDich, datMucDich] = useState('du_chat_trong_ngan_sach')
  const [buoiApDung, datBuoiApDung] = useState(['trua', 'toi'])
  const [ghiChu, datGhiChu] = useState('')
  const [daTickDongY, datDaTickDongY] = useState(false)
  const [boQuaSanViChat, datBoQuaSanViChat] = useState(true)
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

  const doiBuoi = (ma) => {
    if (buoiApDung.includes(ma)) {
      datBuoiApDung(buoiApDung.filter((b) => b !== ma))
    } else {
      datBuoiApDung([...buoiApDung, ma])
    }
  }

  const guiForm = () => {
    if (!nganSachTuan || nganSachTuan <= 0) {
      datLoiThieu('Nhập ngân sách tuần trước đã.')
      return
    }
    if (buoiApDung.length === 0) {
      datLoiThieu('Chọn ít nhất một buổi để hệ thống lo.')
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
      cac_buoi_ap_dung: buoiApDung,
      ghi_chu: ghiChu,
      boQuaSanViChat,
    })
  }

  return (
    <>
      <Khoi tieuDe="Tạo lộ trình 7 ngày" phu="Giai đoạn 1/4 — Form">
        {/* §3.1 — lấy sẵn từ Hồ sơ, KHÔNG hỏi lại. */}
        <div className="tom-tat-ho-so">
          <p className="chu-nho chu-nhat">Đã lấy từ Hồ sơ, không hỏi lại:</p>
          <p className="chu-nho">
            {hoSo.tuoi} tuổi · {hoSo.gioi === 'nam' ? 'Nam' : 'Nữ'} · vận động {hoSo.muc_van_dong}
            {hoSo.di_ung.length > 0 && <> · Dị ứng: {hoSo.di_ung.map(tenNhomDiUng).join(', ')}</>}
          </p>
          <p className="chu-nho chu-nhat">
            Mục tiêu ngày: {hoSo.kcal_muc_tieu} kcal · {hoSo.dam_muc_tieu}g đạm ·{' '}
            {hoSo.canxi_muc_tieu}mg canxi · {hoSo.sat_muc_tieu}mg sắt
          </p>
        </div>

        <label className="truong-form">
          <span className="truong-form__nhan">Ngân sách tuần</span>
          <input
            type="number" min={0} step={10000}
            value={nganSachTuan}
            onChange={(e) => datNganSachTuan(e.target.value)}
          />
          <span className="chu-be chu-nhat">{tien(Number(nganSachTuan) || 0)}</span>
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
          <span className="truong-form__nhan">Buổi muốn hệ thống lo</span>
          <div className="chon-buoi">
            {BUOI_TUY_CHON.map((b) => (
              <label key={b.ma} className="chon-buoi__muc">
                <input
                  type="checkbox"
                  checked={buoiApDung.includes(b.ma)}
                  onChange={() => doiBuoi(b.ma)}
                />
                <span>{b.nhan}</span>
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

        {/* ⚠ Công cụ dựng giao diện, KHÔNG PHẢI tính năng — xem lib/sinhLoTrinh.js.
            Mặc định BẬT SẴN 29/7 (đổi từ tắt) để đảm bảo tạo lộ trình luôn
            thành công lúc demo. Khi TẮT, sàn kcal/dam/canxi/sắt mỗi bữa &
            mỗi ngày (R-32) và giới hạn tồn kho món (tối đa 2 lần/tuần mỗi
            món gốc) chạy THẬT theo đúng tài liệu — với 18 món demo hiện có,
            gần như mọi lộ trình sẽ báo "bất khả" (xem ghi chú #2b). Vẫn để
            người xem tự tắt thử nếu muốn thấy các màn "Không tạo được". */}
        <label className="bo-qua-san-demo">
          <input
            type="checkbox"
            checked={boQuaSanViChat}
            onChange={(e) => datBoQuaSanViChat(e.target.checked)}
          />
          <span>🛠 Bỏ qua sàn dinh dưỡng + giới hạn tồn kho món (chỉ để xem thử giao diện — xem lib/sinhLoTrinh.js)</span>
        </label>
      </Khoi>

      <ThongDiepAnToan />
    </>
  )
}
