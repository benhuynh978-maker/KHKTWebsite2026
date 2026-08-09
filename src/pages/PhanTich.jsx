/* =========================================================================
   TRANG PHÂN TÍCH — theo "Kế hoạch trang Phân tích" v1.0 (tài liệu chính
   thức), sau đó CHỈNH LẠI 29/7 theo yêu cầu riêng — đi khác tài liệu ở
   vài điểm, có ghi chú rõ từng chỗ:

     • Biểu đồ cột dựng lại đúng khái niệm đầy đủ (trục, gridline, nhãn
       giá trị, tooltip) — xem components/BieuDoCot.jsx.
     • Thêm 5 biểu đồ mới: kcal, glucid, lipid, canxi, sắt (trước chỉ có
       Chi phí + Đạm). Mốc tham chiếu cho cả 6 chỉ số dinh dưỡng lấy từ
       bảng RNI 15–19 tuổi (lib/traBangDinhDuong.js) — xem ghi chú ở
       api.js layMocThamChieuLoTrinh (đổi khác quyết định cũ #9.1).
     • "Chi phí" đổi tên hiển thị thành "Chi tiêu" (số tính y hệt).
     • Thứ tự cột theo đúng yêu cầu: Chi tiêu, kcal, Đạm, Glucid, Lipid,
       Canxi, Sắt.

     Thêm 05/08/2026 (quyết định C2 — giữ kẽm): biểu đồ Kẽm, cuối cùng
     trong thứ tự cột — cùng cơ chế mốc tham chiếu/màu cố định như 6 chỉ
     số trên, không có gì khác biệt về xử lý.
   ========================================================================= */

import { useState } from 'react'
import Khoi from '../components/Khoi.jsx'
import BieuDoCot from '../components/BieuDoCot.jsx'
import MienTru from '../components/MienTru.jsx'
import TrangThaiRong from '../components/TrangThaiRong.jsx'
import { layBieuDoPhanTich, layMocThamChieuLoTrinh, layDuLieuPhanTich } from '../data/api.js'

const MUC = [
  { ma: 'lo_trinh', nhan: 'Lộ trình', rong: 'Chưa có lộ trình nào — tạo lộ trình để xem biểu đồ này.' },
  { ma: 'goi_y_nhanh', nhan: 'Gợi ý nhanh', rong: 'Chưa có lượt chọn món nào qua Gợi ý nhanh.' },
  { ma: 'tong_quan', nhan: 'Tổng quan', rong: 'Chưa có bữa nào được ghi nhận.' },
]

const TAB_THOI_GIAN = [
  { ma: 'ngay', nhan: 'Ngày' },
  { ma: 'tuan', nhan: 'Tuần' },
  { ma: 'thang', nhan: 'Tháng' },
]

// Thứ tự cố định theo yêu cầu — cũng là thứ tự MÀU cố định xuyên suốt app.
const CAC_CHI_SO = [
  { khoa: 'chiPhi', nhan: 'Chi tiêu', donVi: 'k', mau: 'var(--mau-bd-chi-tieu)', doiDonVi: (v) => v / 1000 },
  { khoa: 'kcal', nhan: 'Năng lượng (kcal)', donVi: '', mau: 'var(--nhan-phu)' },
  { khoa: 'dam', nhan: 'Đạm', donVi: 'g', mau: 'var(--nhan)' },
  { khoa: 'glucid', nhan: 'Glucid', donVi: 'g', mau: 'var(--mau-bd-glucid)' },
  { khoa: 'lipid', nhan: 'Lipid', donVi: 'g', mau: 'var(--mau-bd-lipid)' },
  { khoa: 'canxi', nhan: 'Canxi', donVi: 'mg', mau: 'var(--mau-bd-canxi)' },
  { khoa: 'sat', nhan: 'Sắt', donVi: 'mg', mau: 'var(--mau-bd-sat)' },
  { khoa: 'kem', nhan: 'Kẽm', donVi: 'mg', mau: 'var(--mau-bd-kem)' },
]

export default function PhanTich() {
  const [muc, datMuc] = useState('lo_trinh')
  const [tabThoiGian, datTabThoiGian] = useState('ngay')

  const mucHienTai = MUC.find((m) => m.ma === muc)
  // Phần 6.1: "hoàn toàn chưa có dữ liệu" xét trên TOÀN BỘ mục (mọi thời
  // gian), không phải chỉ trong tab đang xem — khác `khongCoDuLieu` theo
  // từng cột (Phần 3.4), vốn chỉ áp dụng cho mục Lộ trình.
  const rongHoanToan = layDuLieuPhanTich(muc).length === 0
  const buckets = layBieuDoPhanTich(muc, tabThoiGian)
  const moc = muc === 'lo_trinh' ? layMocThamChieuLoTrinh(tabThoiGian) : null

  return (
    <>
      <Khoi tieuDe="Phân tích">
        <div className="tab-hang">
          {MUC.map((m) => (
            <button
              key={m.ma}
              type="button"
              className={`tab-nut${muc === m.ma ? ' tab-nut--dang-chon' : ''}`}
              onClick={() => datMuc(m.ma)}
            >
              {m.nhan}
            </button>
          ))}
        </div>

        <div className="tab-hang tab-hang--phu">
          {TAB_THOI_GIAN.map((t) => (
            <button
              key={t.ma}
              type="button"
              className={`tab-nut tab-nut--phu${tabThoiGian === t.ma ? ' tab-nut--dang-chon' : ''}`}
              onClick={() => datTabThoiGian(t.ma)}
            >
              {t.nhan}
            </button>
          ))}
        </div>
      </Khoi>

      {rongHoanToan ? (
        <Khoi>
          <TrangThaiRong>{mucHienTai.rong}</TrangThaiRong>
        </Khoi>
      ) : (
        CAC_CHI_SO.map((cs) => {
          const mocGiaTriGoc = moc ? moc[cs.khoa] : null
          const coMoc = mocGiaTriGoc != null
          const mocHienThi = coMoc ? (cs.doiDonVi ? cs.doiDonVi(mocGiaTriGoc) : mocGiaTriGoc) : undefined

          return (
            <Khoi
              key={cs.khoa}
              tieuDe={cs.nhan}
              phu={
                cs.khoa === 'chiPhi' && muc === 'lo_trinh' && !coMoc
                  ? 'Chưa có lộ trình đang chạy nên chưa có ngân sách để so mốc.'
                  : undefined
              }
            >
              <BieuDoCot
                duLieu={buckets.map((b) => ({
                  nhan: b.nhan,
                  giaTri: Math.round(cs.doiDonVi ? cs.doiDonVi(b[cs.khoa]) : b[cs.khoa]),
                  khongCoDuLieu: b.khongCoDuLieu,
                }))}
                moc={coMoc ? Math.round(mocHienThi) : undefined}
                donVi={cs.donVi}
                mau={cs.mau}
                nhanChiSo={cs.nhan}
              />
            </Khoi>
          )
        })
      )}

      <MienTru />
    </>
  )
}
