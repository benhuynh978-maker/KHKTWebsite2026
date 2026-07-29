/* =========================================================================
   MODAL CHI TIẾT MÓN — dùng chung ở 2 trang
   -------------------------------------------------------------------------
   "Ăn gì hôm nay" §5–6, và "Quán ăn gần đây" §3: "Dùng lại y hệt cơ chế đã
   chốt ở tài liệu Kế hoạch trang Ăn gì hôm nay, KHÔNG định nghĩa lại."

   NHỮNG ĐIỀU COMPONENT NÀY CỐ Ý LÀM ĐÚNG THEO TÀI LIỆU (đừng đổi khi không
   có quyết định mới):

   • Danh sách "thanh_phan_di_ung" hiển thị ở đây là NHÃN CHUNG, TĨNH —
     giống nhãn thành phần trên bao bì. KHÔNG so khớp với dị ứng đã khai
     của học sinh đang xem, KHÔNG tô cảnh báo cá nhân hoá tại đây.
     (§5.2: "không phải cảnh báo cá nhân hoá riêng theo từng học sinh xem.
     Việc so khớp... là việc của bộ lọc 'An toàn dị ứng', không phải của
     modal.") Việc này từng được nêu là một lỗ hổng an toàn tiềm ẩn khi bàn
     thiết kế hệ thống — nhóm đã quyết định giữ đúng tài liệu, không tự vá
     ở tầng giao diện.

   • R-31 luôn có mặt ở đây (§5.3) vì đây là nơi hiện số dinh dưỡng thật.

   • Nút "Đã ăn món này" chỉ nằm trong modal (§6.1). Không có bước huỷ/
     hoàn tác ngay tại trang (§6.2) — muốn xoá phải qua trang Lịch sử.
   ========================================================================= */

import { useState } from 'react'
import { tien, khoangCach } from '../lib/dinhDang.js'
import { ghiNhanDaAnTuChon, tenNhomDiUng } from '../data/api.js'
import MienTru from './MienTru.jsx'

export default function ModalMon({ mon, onDong, onDaGhiNhan }) {
  const [trangThai, datTrangThai] = useState('xem') // xem | da_ghi | bi_chan
  const [thongDiepChan, datThongDiepChan] = useState('')

  if (!mon) return null
  const { quan } = mon

  const xacNhanDaAn = () => {
    const kq = ghiNhanDaAnTuChon(mon)
    if (!kq.choPhep) {
      datThongDiepChan(kq.thongDiep)
      datTrangThai('bi_chan')
      return
    }
    datTrangThai('da_ghi')
    onDaGhiNhan?.()
  }

  return (
    <div className="modal-nen" onClick={onDong}>
      <div className="modal-mon" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-mon__dong" onClick={onDong} type="button" aria-label="Đóng">
          ✕
        </button>

        <div className="modal-mon__anh" aria-hidden="true">
          {mon.anh_url
            ? <img src={mon.anh_url} alt="" />
            : <span>Ảnh món</span>}
        </div>

        <div className="modal-mon__than">
          <div>
            <h3 className="modal-mon__ten">{mon.ten_mon}</h3>
            <p className="chu-nhat">
              {quan?.ten_quan} · {khoangCach(quan?.khoang_cach_m)}
            </p>
          </div>

          <p className="modal-mon__gia">{tien(mon.gia)}</p>

          {/* Dinh dưỡng chi tiết — mỗi số kèm biên sai số riêng (R-04). */}
          <dl className="modal-mon__dinh-duong">
            <div>
              <dt>Năng lượng</dt>
              <dd>{mon.kcal} kcal <span className="chu-be chu-nhat">(±{mon.sai_so_kcal})</span></dd>
            </div>
            <div>
              <dt>Đạm</dt>
              <dd>{mon.dam_g} g <span className="chu-be chu-nhat">(±{mon.sai_so_dam})</span></dd>
            </div>
            <div>
              <dt>Canxi</dt>
              <dd>{mon.canxi_mg} mg <span className="chu-be chu-nhat">(±{mon.sai_so_canxi})</span></dd>
            </div>
            <div>
              <dt>Sắt</dt>
              <dd>{mon.sat_mg} mg <span className="chu-be chu-nhat">(±{mon.sai_so_sat})</span></dd>
            </div>
          </dl>

          {mon.thanh_phan_di_ung.length > 0 && (
            <p className="modal-mon__thanh-phan">
              <span className="chu-nhat">Thành phần có thể gây dị ứng: </span>
              {mon.thanh_phan_di_ung.map(tenNhomDiUng).join(', ')}
            </p>
          )}

          <MienTru gonGang />

          <div className="modal-mon__hanh-dong">
            {trangThai === 'xem' && (
              <button className="nut nut--chinh nut--rong" onClick={xacNhanDaAn} type="button">
                Đã ăn món này
              </button>
            )}
            {trangThai === 'da_ghi' && (
              <p className="modal-mon__da-ghi">✓ Đã ghi nhận. Cảm ơn bạn!</p>
            )}
            {trangThai === 'bi_chan' && (
              <p className="modal-mon__bi-chan">{thongDiepChan}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
