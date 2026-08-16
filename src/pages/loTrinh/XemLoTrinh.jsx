/* =========================================================================
   GIAI ĐOẠN 3 — XEM LỘ TRÌNH
   Theo "Kế hoạch trang Lộ trình ăn uống" §5.
   -------------------------------------------------------------------------
   §5.1: "Mỗi ô là một KHUNG, không phải món." Trang này CHỈ hiển thị
   khoảng kcal/đạm/giá/bán kính — KHÔNG hiển thị món cụ thể nào, kể cả khi
   thuật toán (bản tạm, lib/sinhLoTrinh.js) đã mô phỏng một tổ hợp món khả
   thi để kiểm tra bên trong. Đến đúng bữa mới lấp món thật (§2.1).
   ========================================================================= */

import Khoi from '../../components/Khoi.jsx'
import MienTru from '../../components/MienTru.jsx'
import { tien, tienNgan, TEN_BUOI, TEN_NGUON } from '../../lib/dinhDang.js'
import { TEN_MUC_DICH } from '../../lib/sinhLoTrinh.js'

const TEN_THU = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

function ngayThu(offsetTuNgayHomNay) {
  const d = new Date()
  d.setDate(d.getDate() + offsetTuNgayHomNay)
  return TEN_THU[d.getDay()]
}

export default function XemLoTrinh({ form, ketQuaTienKiem, onApDung, onHuyLamLai, dangHauKiem, loiHauKiem, onDungXoa }) {
  const { khungMoiBuoi, tongChiDuKien, canhBao } = ketQuaTienKiem

  // Tổng quan "phân bổ dinh dưỡng trung bình ngày" — tính từ KHUNG (trung
  // điểm kcal, sàn đạm), không từ món cụ thể nào (đúng nguyên tắc "khung,
  // không phải món").
  const trungBinhKcal = form.cac_buoi_ap_dung.reduce(
    (t, b) => t + (khungMoiBuoi[b].kcal_min + khungMoiBuoi[b].kcal_max) / 2, 0
  )
  const trungBinhDam = form.cac_buoi_ap_dung.reduce((t, b) => t + khungMoiBuoi[b].dam_min, 0)

  return (
    <Khoi tieuDe="Xem lộ trình 7 ngày" phu="Giai đoạn 3/4 — Xem trước khi áp dụng">
      <div className="tong-quan-lo-trinh">
        <p><strong>Mục đích:</strong> {TEN_MUC_DICH[form.muc_dich]}</p>
        <p><strong>Tổng chi dự kiến/tuần:</strong> ≤ {tien(form.ngan_sach_tuan)} (thực tế mô phỏng ~{tien(tongChiDuKien)})</p>
        <p><strong>Trung bình dinh dưỡng/ngày (theo khung):</strong> ~{Math.round(trungBinhKcal)} kcal · ≥{trungBinhDam}g đạm</p>
      </div>

      {/* Pha 2 (07/08/2026) — thuật toán LUÔN sinh được lộ trình (trừ dị
          ứng chặn cứng ở Giai đoạn 2), những điểm chưa đạt tuyệt đối
          (ngân sách/ghi chú tránh cay/thiếu quán đúng nguồn/không tìm được
          món phù hợp) hiện ở đây dưới dạng cảnh báo thay vì chặn — xem
          lib/sinhLoTrinh.js. KHÔNG bao giờ có sàn canxi/sắt trong mảng này
          — CỐ Ý không cảnh báo ngưỡng dinh dưỡng (CLAUDE.md mục C, xem
          comment ⚠ ở sinhLoTrinh.js) — đừng thêm nhầm nếu sửa sau này. */}
      {canhBao && canhBao.length > 0 && (
        <div className="canh-bao-lo-trinh">
          <p className="chu-nho chu-nhat">Vài điểm chưa đạt tuyệt đối trong lộ trình mô phỏng dưới đây:</p>
          <ul className="danh-sach-canh-bao">
            {canhBao.map((cb, i) => <li key={i}>{cb}</li>)}
          </ul>
        </div>
      )}

      <div className="danh-sach-ngay">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((ngay) => (
          <div className="khung-ngay" key={ngay}>
            <p className="khung-ngay__tieu-de">Ngày {ngay} — {ngayThu(ngay - 1)}</p>
            {form.cac_buoi_ap_dung.map((buoi) => {
              const k = khungMoiBuoi[buoi]
              return (
                <p className="khung-ngay__dong" key={buoi}>
                  <span className="khung-ngay__buoi">{TEN_BUOI[buoi]} ({TEN_NGUON[k.nguon]}):</span>{' '}
                  {k.kcal_min}–{k.kcal_max} kcal · đạm ≥ {k.dam_min}g · ≤ {tienNgan(k.gia_max)}
                  {k.ban_kinh_m ? ` · ≤ ${k.ban_kinh_m}m` : ''}
                </p>
              )
            })}
          </div>
        ))}
      </div>

      <MienTru />

      {/* §5.3 — Nếu hậu kiểm từ chối: "Tối ưu tiếp → BẮT BUỘC đổi ít nhất
          một tham số (thuật toán tất định — cùng input ra cùng output)
          hoặc Dừng & xoá lộ trình." Đường này khó kích hoạt thật trong
          bản demo đồng bộ (cùng hàm, cùng input, chạy lại tức thì) — xem
          ghi chú ở api.js `chayHauKiemVaApDung`. Vẫn giữ đúng luồng theo
          kiến trúc "3 lớp bảo vệ" (Kế hoạch dự án §1.1). */}
      {loiHauKiem ? (
        <div className="hau-kiem-tu-choi">
          <p className="ly-do-bat-kha">Backend kiểm lại lần cuối và từ chối lưu: {loiHauKiem}</p>
          <div className="hang-nut-doi">
            <button className="nut nut--chinh" onClick={onHuyLamLai} type="button">
              Tối ưu tiếp (đổi tham số)
            </button>
            <button className="nut" onClick={onDungXoa} type="button">
              Dừng &amp; xoá lộ trình
            </button>
          </div>
        </div>
      ) : (
        <div className="hang-nut-doi">
          <button className="nut nut--chinh" onClick={onApDung} type="button" disabled={dangHauKiem}>
            {dangHauKiem ? 'Đang kiểm lại...' : 'Áp dụng lộ trình'}
          </button>
          <button className="nut" onClick={onHuyLamLai} type="button">
            Huỷ &amp; làm lại
          </button>
        </div>
      )}
    </Khoi>
  )
}
