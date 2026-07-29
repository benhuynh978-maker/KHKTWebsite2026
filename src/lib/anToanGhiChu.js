/* =========================================================================
   XỬ LÝ Ô GHI CHÚ TỰ DO — bản MOCK, KHÔNG PHẢI AI
   -------------------------------------------------------------------------
   ⚠ R-16/R-17: khi lớp AI thật được nối (Kế hoạch dự án Phần 6.2 — "AI đọc
     ghi chú → trích ràng buộc (JSON)"), thay phần thân 2 hàm dưới đây bằng
     lời gọi tới lớp đó. Nơi gọi (FormLoTrinh, ManCho) không cần đổi vì chữ
     ký hàm giữ nguyên: nhận chuỗi ghi chú, trả về ràng buộc có cấu trúc.

   R-27 — phát hiện tự khai bệnh lý → DỪNG xử lý phần ghi chú đó, KHÔNG tự
   đề xuất chế độ ăn cho tình huống này, hiện hướng dẫn liên hệ bác sỹ.
   Đây CHỈ là so khớp từ khoá đơn giản — KHÔNG phải công cụ sàng lọc lâm
   sàng (R-29 cấm điều đó); không được diễn giải/chấm điểm mức độ nghiêm
   trọng, chỉ có/không.
   ========================================================================= */

import { boDauChu } from './dinhDang.js'

const TU_KHOA_BENH_LY = [
  'suy dinh duong', 'beo phi', 'thua can', 'tieu duong',
  'bieng an', 'chan an', 'roi loan an uong', 'gay qua', 'thieu can',
]

export function coDauHieuBenhLy(ghiChu) {
  if (!ghiChu?.trim()) return false
  const chuan = boDauChu(ghiChu)
  return TU_KHOA_BENH_LY.some((tk) => chuan.includes(tk))
}

/** Trích MỘT ràng buộc rất đơn giản — chỉ "tránh cay", để minh hoạ tầng
 *  kiểm tra 5 ("Nhất quán ghi chú"). KHÔNG tự nới ràng buộc khác. */
export function trichRangBuocGhiChu(ghiChu) {
  if (!ghiChu?.trim()) return {}
  const chuan = boDauChu(ghiChu)
  const tranhCay = ['tranh cay', 'khong cay', 'it cay', 'khong an duoc cay'].some((cum) =>
    chuan.includes(cum)
  )
  return tranhCay ? { tranh_cay: true } : {}
}
