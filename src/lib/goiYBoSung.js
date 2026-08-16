/* =========================================================================
   GỢI Ý THỰC PHẨM PHỤ TRỢ — tính phần dinh dưỡng còn thiếu sau món chính,
   xếp hạng thực phẩm tham khảo theo mức bù đắp. Port nguyên công thức từ
   test/goi-y-bo-sung.js (13/08/2026, đã kiểm chứng qua nhiều vòng test
   thật) — chỉ đổi tên field theo quy ước Website (canxi_mg/sat_mg/kem_mg
   thay vì canxi/sat/kem), công thức giữ nguyên không đổi. Hàm thuần: mọi
   dữ liệu vào qua đối số, không đọc trạng thái phiên, không đụng giao diện,
   không đụng chamDiem.js (công thức chấm món chính giữ nguyên).

   CHỈ tính phần thiếu cho kcal/canxi/sắt/kẽm — 4 chất DUY NHẤT có mục tiêu
   TUYỆT ĐỐI theo bữa trong hệ thống (xem lib/chamDiem.js:xepHangMon). Đạm/
   béo/đường chỉ có dải % năng lượng CỦA CHÍNH MÓN, không có mục tiêu gam
   tuyệt đối theo bữa nên không có "phần thiếu" để tính.
   ========================================================================= */

/* Phần thiếu = mục tiêu bữa - phần món chính đã có, chặn dưới 0 (món chính
   đã đạt/vượt mục tiêu ở chất nào thì chất đó không còn gì "thiếu"). */
export function tinhPhanThieu(mucTieuBua, monChinh) {
  const thieu = (tMuc, daCo) => Math.max(0, tMuc - daCo)
  return {
    kcal: thieu(mucTieuBua.kcal, monChinh.kcal),
    canxi: thieu(mucTieuBua.canxi_mg, monChinh.canxi_mg),
    sat: thieu(mucTieuBua.sat_mg, monChinh.sat_mg),
    kem: thieu(mucTieuBua.kem_mg, monChinh.kem_mg),
  }
}

/* Tỉ lệ 1 chất trong 1 thực phẩm phụ trợ lấp được so với phần thiếu, CHẶN
   TRẦN ở đúng phần thiếu — phần dư ra ngoài phần thiếu KHÔNG được tính
   thêm điểm, để thuật toán không vô tình khuyến khích ăn/uống vượt mức
   cần. Chất không thiếu gì (phanThieu = 0) thì không có gì để "lấp". */
function tiLeLapDay(coSan, phanThieu) {
  if (phanThieu <= 0) return 0
  return Math.min(coSan, phanThieu) / phanThieu
}

/* Điểm CÀNG CAO CÀNG TỐT (ngược hướng tinhDiem() của món chính — cố ý,
   đây là thưởng độ lấp đầy chứ không phải phạt độ lệch). Trung bình cộng
   4 tỉ lệ, không có trọng số riêng. */
function diemBuDap(phuTro, phanThieu) {
  const tong =
    tiLeLapDay(phuTro.kcal, phanThieu.kcal) +
    tiLeLapDay(phuTro.canxi_mg, phanThieu.canxi) +
    tiLeLapDay(phuTro.sat_mg, phanThieu.sat) +
    tiLeLapDay(phuTro.kem_mg, phanThieu.kem)
  return tong / 4
}

/* Xếp hạng thực phẩm phụ trợ theo mức bù đắp phần thiếu. Loại hẳn những
   thực phẩm không bù được gì (diem = 0) — không có gì để gợi ý thì không
   hiện, tránh gợi ý vô nghĩa. */
export function xepHangPhuTro(danhSachPhuTro, phanThieu) {
  return danhSachPhuTro
    .map((tp) => ({ phuTro: tp, diem: diemBuDap(tp, phanThieu) }))
    .filter((x) => x.diem > 0)
    .sort((a, b) => b.diem - a.diem)
}
