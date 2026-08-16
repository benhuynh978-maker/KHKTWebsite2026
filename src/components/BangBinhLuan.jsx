/* =========================================================================
   BẢNG NỔI BÌNH LUẬN — thêm 29/7 theo yêu cầu riêng.
   -------------------------------------------------------------------------
   Mở từ dòng "Xem bình luận" trong ModalMon.jsx (đứng ngay trước nút "Đã
   ăn món này"). Nổi TRÊN modal chi tiết đang mở — z-index cao hơn
   .modal-nen (xem components.css) — không thay thế modal đó, bấm ra ngoài
   chỉ đóng bảng bình luận, modal chi tiết vẫn còn nguyên phía sau.

   Modal chi tiết (ModalMon) CHỈ hiện số bình luận + nút xem + trung bình
   sao (chỉ đọc) — nội dung từng bình luận VÀ ô tự chọn sao để gửi CHỈ hiện
   ở đây, đúng cách các app đánh giá phổ biến vẫn làm (Shopee/Tiki/Google
   Play: "Viết đánh giá" luôn gồm chọn sao + viết nhận xét, đặt cùng chỗ
   với danh sách đánh giá/bình luận, không đặt ở thẻ sản phẩm).

   Tên hiển thị mỗi bình luận là TÊN ẢO (ten_ao) của học sinh đăng, không
   phải mã 6 số hay tên thật — xem thêm mock/binhLuan.js.
   ========================================================================= */

import { useEffect, useState } from 'react'
import { layBinhLuan, guiBinhLuanMon, layDanhGia, guiDanhGia } from '../data/api.js'
import { ngayGio } from '../lib/dinhDang.js'
import { useDongBangEsc } from '../lib/dongBangEsc.js'
import TrangThaiRong from './TrangThaiRong.jsx'
import ChonSao from './ChonSao.jsx'

export default function BangBinhLuan({ mon, onDong }) {
  useDongBangEsc(onDong)
  const [dsBinhLuan, datDsBinhLuan] = useState([])
  const [soSaoChon, datSoSaoChon] = useState(0)
  const [noiDung, datNoiDung] = useState('')
  const [dangTai, datDangTai] = useState(true)

  useEffect(() => {
    let huy = false
    Promise.all([layBinhLuan(mon.id), layDanhGia(mon.id)]).then(([ds, dg]) => {
      if (huy) return
      datDsBinhLuan(ds)
      datSoSaoChon(dg.sao_cua_toi ?? 0)
      datDangTai(false)
    })
    return () => { huy = true }
  }, [mon.id])

  const coTheGui = soSaoChon > 0 || noiDung.trim() !== ''

  const gui = async (e) => {
    e.preventDefault()
    if (!coTheGui) return

    if (soSaoChon > 0) await guiDanhGia(mon.id, soSaoChon)

    const nd = noiDung.trim()
    if (nd) {
      await guiBinhLuanMon(mon.id, nd)
      datDsBinhLuan(await layBinhLuan(mon.id))
      datNoiDung('')
    }
  }

  return (
    <div className="modal-nen binh-luan-nen" onClick={onDong}>
      <div className="binh-luan" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="binh-luan__dau">
          <p className="binh-luan__tieu-de">Bình luận · {mon.ten_mon}</p>
          <button className="binh-luan__dong" onClick={onDong} type="button" aria-label="Đóng">
            ✕
          </button>
        </div>

        <div className="binh-luan__ds">
          {dangTai ? (
            <TrangThaiRong>Đang tải bình luận…</TrangThaiRong>
          ) : dsBinhLuan.length === 0 ? (
            <TrangThaiRong>Chưa có bình luận nào — hãy là người đầu tiên!</TrangThaiRong>
          ) : (
            dsBinhLuan.map((b) => (
              <div className="binh-luan__muc" key={b.id}>
                <div className="hang">
                  <p className="binh-luan__ten day">{b.ten_hien_thi}</p>
                  <span className="chu-be chu-nhat">{ngayGio(b.thoi_gian)}</span>
                </div>
                <p className="binh-luan__noi-dung">{b.noi_dung}</p>
              </div>
            ))
          )}
        </div>

        <form className="binh-luan__viet-danh-gia" onSubmit={gui}>
          <div className="binh-luan__hang-sao">
            <span className="chu-nho chu-nhat">Đánh giá của bạn</span>
            <ChonSao giaTri={soSaoChon} onChon={datSoSaoChon} />
          </div>
          <div className="binh-luan__gui">
            <textarea
              placeholder="Viết bình luận (không bắt buộc)..."
              value={noiDung}
              onChange={(e) => datNoiDung(e.target.value)}
              rows={2}
              maxLength={300}
            />
            <button className="nut nut--chinh" type="submit" disabled={!coTheGui}>
              Gửi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
