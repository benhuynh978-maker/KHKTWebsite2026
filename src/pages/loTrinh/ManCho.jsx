/* =========================================================================
   GIAI ĐOẠN 2 — MÀN CHỜ & KIỂM TRA KHẢ THI
   Theo "Kế hoạch trang Lộ trình ăn uống" §4.
   -------------------------------------------------------------------------
   §4.1: hiện "đang tạo lộ trình…" trong lúc backend chạy tiền kiểm + sinh
   khung. §4.2: hai kết cục — thành công tự chuyển Giai đoạn 3, hoặc dừng
   lại hiện lý do cụ thể + [Quay lại sửa form] [Huỷ].

   §3.4/R-27: nếu ghi chú có dấu hiệu bệnh lý → DỪNG xử lý phần đó, hiện
   hướng dẫn liên hệ bác sỹ; phần còn lại (ngân sách/mục đích/buổi) vẫn xử
   lý bình thường nếu không liên quan — nên cảnh báo R-27 hiển thị SONG
   SONG với kết quả tiền kiểm, không thay thế nó.

   Pha 2 (07/08/2026) — chỉ còn tầng dị ứng (an toàn tính mạng) có thể
   "bất khả". Tồn kho/sàn dinh dưỡng/ghi chú không chặn ở đây — luôn tạo
   được lộ trình, những điểm chưa đạt tuyệt đối hiện ở Giai đoạn 3 dưới
   dạng cảnh báo (xem lib/sinhLoTrinh.js, XemLoTrinh.jsx).

   Thêm 10/08/2026 — tầng 'ngan_sach' (sàn ngân sách/tuần tối thiểu, quyết
   định chính sách riêng): cũng "bất khả" ở màn này, không phải cảnh báo,
   vì dưới sàn coi là tiếp tay gây hại chứ không phải vấn đề chất lượng.
   ========================================================================= */

import { useEffect, useState } from 'react'
import Khoi from '../../components/Khoi.jsx'
import { chayTienKiemLoTrinh } from '../../data/api.js'
import { coDauHieuBenhLy, trichRangBuocGhiChu } from '../../lib/anToanGhiChu.js'
import { tien } from '../../lib/dinhDang.js'

const TEN_TANG = {
  4: 'Loại trừ cá nhân (an toàn dị ứng)',
  ngan_sach: 'Sàn ngân sách tối thiểu',
}

export default function ManCho({ form, onKhaThi, onQuayLai, onHuy }) {
  const [ketQua, datKetQua] = useState(null) // null = đang chạy

  useEffect(() => {
    const coBenhLy = coDauHieuBenhLy(form.ghi_chu)
    const rangBuocGhiChu = coBenhLy ? {} : trichRangBuocGhiChu(form.ghi_chu)
    // Gắn ràng buộc đã trích vào chính đối tượng form và mang theo tới tận
    // hậu kiểm (Giai đoạn 3 → "Áp dụng") — nếu không, hậu kiểm sẽ chạy
    // THIẾU ràng buộc "tránh cay" mà tiền kiểm đã áp, phá vỡ tính nhất
    // quán giữa hai lần kiểm (đã phát hiện và sửa khi rà lại luồng).
    const formDayDu = { ...form, rang_buoc_ghi_chu: rangBuocGhiChu }

    const hen = setTimeout(() => {
      const kq = chayTienKiemLoTrinh(formDayDu, rangBuocGhiChu)
      datKetQua({ ...kq, canhBaoGhiChu: coBenhLy, formDayDu })
    }, 900)

    return () => clearTimeout(hen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (ketQua?.khaThi) {
      onKhaThi(ketQua, ketQua.formDayDu)
    }
  }, [ketQua]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ketQua) {
    return (
      <Khoi tieuDe="Đang tạo lộ trình…" phu="Giai đoạn 2/4 — Kiểm tra khả thi">
        <p className="chu-nhat">Đang kiểm tra dị ứng và tạo lộ trình phù hợp nhất với ngân sách, mục đích và ghi chú của bạn...</p>
      </Khoi>
    )
  }

  if (ketQua.khaThi) {
    // Đang chuyển sang Giai đoạn 3 qua onKhaThi ở effect trên.
    return null
  }

  return (
    <Khoi tieuDe="Không tạo được lộ trình" phu={`Giai đoạn 2/4 — Bất khả ở tầng ${ketQua.tang}: ${TEN_TANG[ketQua.tang]}`}>
      {ketQua.canhBaoGhiChu && (
        <p className="canh-bao-benh-ly">
          Trường hợp này cần tư vấn của bác sỹ/chuyên gia dinh dưỡng, hệ thống không tự xử lý phần ghi chú của bạn.
        </p>
      )}
      <p className="ly-do-bat-kha">{ketQua.lyDo}</p>
      <p className="chu-nho chu-nhat">Ngân sách đã nhập: {tien(form.ngan_sach_tuan)}/tuần.</p>

      <div className="hang-nut-doi">
        <button className="nut nut--chinh" onClick={onQuayLai} type="button">
          Quay lại sửa form
        </button>
        <button className="nut" onClick={onHuy} type="button">
          Huỷ
        </button>
      </div>
    </Khoi>
  )
}
