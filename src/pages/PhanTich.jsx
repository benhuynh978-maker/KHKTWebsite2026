/* =========================================================================
   TRANG PHÂN TÍCH — theo "Kế hoạch trang Phân tích" v1.0 (tài liệu chính
   thức). Trang này được dựng LẦN ĐẦU bằng suy luận riêng (chưa có tài
   liệu); sau khi có tài liệu chính thức, đã sửa lại theo đúng:
     • Phần 2.1 — số cột mỗi tab cố định (Ngày=7, Tuần=4; "Tháng" tài liệu
       chỉ ghi "vài tháng gần nhất" — chọn 6, xem xepKhoangThoiGian.js).
     • Phần 3.2 — Chi phí = TỔNG cộng dồn; Đạm = TRUNG BÌNH mỗi ngày
       (KHÔNG phải tổng — khác bản cũ).
     • Phần 1.2 — đơn vị chi phí là NGHÌN ĐỒNG (k), không phải đồng đầy đủ.
     • Phần 3.4 — khoảng không có lộ trình nào chạy → không vẽ cột 0, có
       chú thích riêng (xử lý trong BieuDoCot qua cờ `khongCoDuLieu`).
     • Phần 6.1 — trạng thái rỗng theo TỪNG MỤC (không phải một thông báo
       chung cho cả trang); câu chữ cho "Gợi ý nhanh"/"Tổng quan" tài liệu
       không cho ví dụ, tự viết tương tự câu mẫu ở Phần 6.1.
   Vẫn còn 2 điểm tài liệu để ngỏ (Phần 9) — xem ghi chú ở src/data/api.js.
   ========================================================================= */

import { useState } from 'react'
import Khoi from '../components/Khoi.jsx'
import BieuDoCot from '../components/BieuDoCot.jsx'
import MienTru from '../components/MienTru.jsx'
import TrangThaiRong from '../components/TrangThaiRong.jsx'
import { layBieuDoPhanTich, layMocThamChieuLoTrinh, layDuLieuPhanTich } from '../data/api.js'
import { tienNgan } from '../lib/dinhDang.js'

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

        {muc === 'lo_trinh' && !rongHoanToan && !moc && (
          <p className="chu-be chu-nhat phan-tich__khong-moc">
            Chưa có lộ trình đang chạy nên chưa có mốc tham chiếu để so sánh.
          </p>
        )}
      </Khoi>

      {rongHoanToan ? (
        <Khoi>
          <TrangThaiRong>{mucHienTai.rong}</TrangThaiRong>
        </Khoi>
      ) : (
        <>
          <Khoi tieuDe="Chi phí" phu={moc ? `Mốc tham chiếu: ${tienNgan(moc.chiPhi)}` : undefined}>
            <BieuDoCot
              duLieu={buckets.map((b) => ({
                nhan: b.nhan,
                giaTri: Math.round(b.chiPhi / 1000),
                khongCoDuLieu: b.khongCoDuLieu,
              }))}
              moc={moc ? Math.round(moc.chiPhi / 1000) : undefined}
              donVi="k"
            />
          </Khoi>

          <Khoi tieuDe="Đạm" phu={moc ? `Mốc tham chiếu: ${Math.round(moc.dam)}g/ngày` : undefined}>
            <BieuDoCot
              duLieu={buckets.map((b) => ({
                nhan: b.nhan,
                giaTri: Math.round(b.dam),
                khongCoDuLieu: b.khongCoDuLieu,
              }))}
              moc={moc ? Math.round(moc.dam) : undefined}
              donVi="g"
            />
          </Khoi>
        </>
      )}

      <MienTru />
    </>
  )
}
