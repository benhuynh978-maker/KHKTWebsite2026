/* =========================================================================
   TRANG CHƯA DỰNG — chỗ giữ sẵn cho các trang thuộc đợt sau.
   Có mặt để đường dẫn lối từ Dashboard không dẫn vào ngõ cụt.
   ========================================================================= */

import Khoi from '../components/Khoi.jsx'

export default function ChuaDung({ ten, dot, ghiChu }) {
  return (
    <Khoi tieuDe={ten} phu={dot}>
      <p className="chu-nhat">{ghiChu}</p>
    </Khoi>
  )
}

export const TrangPhanTich = () => (
  <ChuaDung
    ten="Phân tích"
    dot="Chưa xếp đợt"
    ghiChu="Trang này CHƯA CÓ TÀI LIỆU THIẾT KẾ, dù được dẫn chiếu ở nhiều tài liệu khác (Dashboard, Lịch sử, Cơ sở dữ liệu Khu vực 5). Cần chốt tài liệu trước khi dựng."
  />
)
