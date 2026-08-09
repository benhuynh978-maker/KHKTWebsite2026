/* =========================================================================
   LOẠI MÓN DÍNH DỊ ỨNG ĐÃ KHAI Ở HỒ SƠ — dùng chung mọi nơi lọc/hiện món.
   -------------------------------------------------------------------------
   `mon.thanh_phan_di_ung` KHÔNG PHẢI mảng (null/undefined — chưa gắn nhãn)
   KHÁC mảng rỗng (đã kiểm, xác nhận sạch). Món chưa kiểm bị loại NGAY khi
   người dùng có bất kỳ dị ứng nào đã chọn — không suy đoán "chắc là an
   toàn". Cùng logic đã dùng ở test/di-ung.js (rủi ro sức khoẻ, không phải
   chính sách riêng của 1 hệ) — thêm 05/08/2026 khi nối dữ liệu Supabase
   thật, nơi 66/101 món CHƯA gắn nhãn (mock demo trước đây luôn có mảng nên
   lỗ hổng này chưa lộ ra).
   ========================================================================= */

export function monAnToanChoDiUng(mon, diUngDaChon) {
  if (!diUngDaChon || diUngDaChon.length === 0) return true
  if (!Array.isArray(mon.thanh_phan_di_ung)) return false
  return !mon.thanh_phan_di_ung.some((d) => diUngDaChon.includes(d))
}
