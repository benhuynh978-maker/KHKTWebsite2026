/* =========================================================================
   THAM SỐ CHẤM ĐIỂM — port nguyên văn từ test/cau-hinh.js (đã kiểm chứng
   kỹ qua nhiều vòng test thật, xem KV-HeThongGoiY_KetQuaCuoiCung.md). Trọng
   số coi là ĐÃ TỐI ƯU theo quyết định của người dùng (07/08/2026) — không
   chờ kết quả grid-search khảo sát (đang chạy song song, xem
   lich-su/du-lieu.md) mới port.
   ========================================================================= */

/* Luôn giả định bữa trưa — gợi ý nhanh không phân biệt bữa cụ thể. */
export const HE_SO_BUA = 0.40

/* Điểm cho món không tra được dinh dưỡng. Phải > 1 (không phải đúng 1) vì
   Điểm thật cũng có thể chạm trần 1,0 — trùng thì thứ tự không chắc chắn. */
export const DIEM_KHONG_XAC_DINH = 2

/* Window mở rộng cho các chiến lược "tốt nhất trong window". */
export const WINDOW_GOC = 10
export const BUOC_WINDOW = 5
export const GIOI_HAN_LAN_RE = 10

/* Bộ tham số chấm điểm chuẩn — nguồn số: KV-HeThongGoiY_KetQuaCuoiCung.md
   mục 1-2 (trọng số), 1.2/9.3 (dải kcal), 1.3 (dải %P-L-G). */
export const THAM_SO_CHUAN = {
  trongSoNhom: { kcal: 0.45, plg: 0.25, vichat: 0.30 },
  trongSoVichat: { canxi: 0.50, sat: 0.28, kem: 0.22 },
  daiKcal: { a: 0.85, b: 1.15, sTranHeSo: 0.15 },
  daiPLG: { dam: [13, 20], beo: [20, 30], duong: [55, 65] },
}
