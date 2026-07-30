/* =========================================================================
   BẢNG THỬ NGHIỆM — LỘ TRÌNH (CÔNG CỤ DỰNG GIAO DIỆN, KHÔNG PHẢI TÍNH NĂNG)
   -------------------------------------------------------------------------
   Yêu cầu riêng 29/7: "làm một nút ấn test hiện các giao diện khi bị chặn
   hay huỷ và các thông báo cho từng trường hợp riêng... phải thấy được
   các case đó sẽ xuất hiện khi như thế nào, làm sao để xuất hiện."

   Mỗi hàng dưới đây = một case CHẶN/HUỶ có thật trong lib/sinhLoTrinh.js
   và luồng 4 giai đoạn (đọc kỹ file đó trước khi đổi danh sách này). Bấm
   "Xem giao diện" để NHẢY THẲNG tới đúng màn hình đó bằng dữ liệu giả lập
   (không chạy lại tiền kiểm thật) — cột "Xảy ra thật khi nào" giải thích
   điều kiện THẬT sẽ tự kích hoạt case đó trong lúc dùng bình thường.

   ⚠ GỠ THÀNH PHẦN NÀY TRƯỚC KHI ĐƯA CHO HỌC SINH DÙNG THẬT — không nằm
     trong bất kỳ tài liệu thiết kế nào.
   ========================================================================= */

import { useState } from 'react'

export const CAC_CASE_CHAN = [
  {
    ma: 'tang1',
    nhan: 'Chặn Giai đoạn 2 — Tầng 1: hết ngân sách/tồn kho',
    dieuKienThat: 'Ngân sách/tuần quá thấp so với số buổi đã chọn — hết tiền hoặc hết món hợp giá trước khi đủ 7 ngày.',
    ketQua: {
      khaThi: false, tang: 1,
      lyDo: 'Ngày 4: hết ngân sách hoặc hết món khả dụng cho bữa trưa. Mức 150.000đ/tuần không đủ cho tổ hợp 7 ngày đã chọn — thử nâng ngân sách.',
    },
  },
  {
    ma: 'tang2',
    nhan: 'Chặn Giai đoạn 2 — Tầng 2: không đủ món khác nhau',
    dieuKienThat: 'Một buổi (thường là Chiều — chỉ 2 món khớp trong 18 món demo) có ít hơn ngưỡng tối thiểu món khác nhau khớp khung.',
    ketQua: {
      khaThi: false, tang: 2,
      lyDo: 'Không đủ món khác nhau quanh trường khớp khung bữa chiều với mức giá tối đa 20.000đ/bữa. Hãy nâng ngân sách tuần hoặc bớt một buổi.',
    },
  },
  {
    ma: 'tang3',
    nhan: 'Chặn Giai đoạn 2 — Tầng 3: thiếu canxi/sắt sàn ngày',
    dieuKienThat: 'Tắt ô "Bỏ qua sàn dinh dưỡng" ở Form — tổ hợp 2 bữa/ngày khó đạt sàn canxi/sắt cả ngày theo RNI.',
    ketQua: {
      khaThi: false, tang: 3,
      lyDo: 'Ngày 2: tổ hợp món tốt nhất tìm được chỉ đạt 420mg canxi/ngày, chưa tới sàn khuyến nghị 1000mg. Đây KHÔNG phải vấn đề ngân sách — hệ thống hiện chỉ quản lý 2 bữa nên khó đạt sàn canxi cả ngày.',
    },
  },
  {
    ma: 'tang5',
    nhan: 'Chặn Giai đoạn 2 — Tầng 5: ghi chú "tránh cay"',
    dieuKienThat: 'Gõ ghi chú có chữ "tránh cay" ở Form, đúng lúc buổi đó chỉ toàn món cay khớp khung (vd Mì Quảng, Bún bò Huế).',
    ketQua: {
      khaThi: false, tang: 5,
      lyDo: 'Ghi chú "tránh cay" khiến không còn món nào khớp khung bữa trưa. Thử bỏ ghi chú này hoặc đổi buổi.',
    },
  },
  {
    ma: 'hau_kiem',
    nhan: 'Chặn Giai đoạn 3 — Hậu kiểm từ chối lúc bấm "Áp dụng"',
    dieuKienThat: 'Rất khó tự xảy ra trong demo: hậu kiểm chạy lại ĐÚNG hàm/ĐÚNG input với tiền kiểm nên luôn khả thi lại — case này giả lập để xem màn "Tối ưu tiếp / Dừng & xoá".',
    apDungGiaiDoanXem: true,
  },
  {
    ma: 'da_co_lo_trinh',
    nhan: 'Khoá Giai đoạn 1 — "Bạn đang có lộ trình"',
    dieuKienThat: 'Tự xảy ra khi vào trang Lộ trình lúc ĐÃ có 1 lộ trình đang chạy (bình thường sẽ nhảy thẳng Giai đoạn 4 — case này ép xem riêng màn Form bị khoá).',
    epKhoaForm: true,
  },
]

export default function BangThuNghiemLoTrinh({ onXemCase, onVeBinhThuong, dangEp }) {
  const [mo, datMo] = useState(false)

  return (
    <aside className="bang-thu">
      <button className="bang-thu__nut" onClick={() => datMo(!mo)} type="button">
        🛠 Bảng thử nghiệm — xem các case chặn/huỷ lộ trình {mo ? '▾' : '▸'}
      </button>

      {mo && (
        <div className="bang-thu__than">
          <p className="bang-thu__ghi-chu">
            Bấm "Xem giao diện" để nhảy thẳng tới màn hình đó (dữ liệu giả lập). Thành phần
            này sẽ được gỡ trước khi đưa vào dùng thật.
          </p>

          {dangEp && (
            <button className="nut nut--rong" onClick={onVeBinhThuong} type="button">
              ← Quay lại luồng bình thường
            </button>
          )}

          <ul className="ds-case-lo-trinh">
            {CAC_CASE_CHAN.map((c) => (
              <li className="case-lo-trinh" key={c.ma}>
                <p className="case-lo-trinh__nhan">{c.nhan}</p>
                <p className="chu-be chu-nhat">
                  <strong>Xảy ra thật khi:</strong> {c.dieuKienThat}
                </p>
                <button className="nut" onClick={() => onXemCase(c)} type="button">
                  Xem giao diện
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
