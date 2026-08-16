/* =========================================================================
   BÁO CÁO VẤN ĐỀ GẮN VỚI 1 MÓN CỤ THỂ (12/08/2026, yêu cầu riêng).
   -------------------------------------------------------------------------
   KHÔNG phải cơ chế mới — chỉ là lối vào NGẮN HƠN tới đúng chỗ ghi đã có
   sẵn (guiPhanHoiHoTro → bảng phan_hoi_ho_tro, xem CaiDat.jsx §3.4). Khác
   biệt duy nhất: ô mô tả TỰ ĐIỀN SẴN tên món/quán đang xem, học sinh không
   phải tự gõ lại hoặc rời khỏi món đang xem để vào Cài đặt.

   Nổi NGOÀI .modal-nen của ModalMon (chính nó là modal thứ 2) — cùng lý do
   đã ghi ở đầu ModalMon.jsx cho BangBinhLuan: nếu lồng bên trong, bấm ra
   ngoài modal này sẽ bubble lên đóng luôn cả modal chi tiết món. */

import { useState } from 'react'
import { guiPhanHoiHoTro } from '../data/api.js'
import { useDongBangEsc } from '../lib/dongBangEsc.js'

export default function BaoCaoVanDe({ moTaGoiY, onDong }) {
  useDongBangEsc(onDong)
  const [moTa, datMoTa] = useState(moTaGoiY)
  const [maSoTuyChon, datMaSoTuyChon] = useState('')
  const [daGui, datDaGui] = useState(false)

  const gui = () => {
    if (!moTa.trim()) return
    guiPhanHoiHoTro(moTa.trim(), maSoTuyChon)
    datDaGui(true)
  }

  return (
    <div className="modal-nen bao-cao-van-de-nen" onClick={onDong}>
      <div className="modal-mon" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-mon__dong" onClick={onDong} type="button" aria-label="Đóng">✕</button>

        <div className="modal-mon__than">
          <h3 className="modal-mon__ten">Báo cáo vấn đề</h3>

          {daGui ? (
            <p className="da-luu-thanh-cong">Đã gửi. Cảm ơn bạn!</p>
          ) : (
            <div className="form-phan-hoi">
              <textarea
                rows={3}
                value={moTa}
                onChange={(e) => datMoTa(e.target.value)}
              />
              <input
                type="text"
                placeholder="Mã 6 số (tuỳ chọn, để nhóm phản hồi lại)"
                value={maSoTuyChon}
                onChange={(e) => datMaSoTuyChon(e.target.value)}
              />
              <button className="nut nut--chinh nut--rong" onClick={gui} type="button">
                Gửi báo cáo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
