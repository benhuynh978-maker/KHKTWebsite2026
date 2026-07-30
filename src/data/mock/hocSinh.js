/* =========================================================================
   DỮ LIỆU GIẢ — Bảng `hoc_sinh` (Khu vực 1: Hồ sơ & Định danh)
   Schema theo: "Cơ sở dữ liệu lưu trữ" §4, Khu vực 1
   -------------------------------------------------------------------------
   R-12 / R-12-a — KHÔNG có cột cân nặng, chiều cao, BMI. Không bao giờ.
     Nếu ai đó thêm một trong ba cột này vào đây, đó là vi phạm quy tắc cứng,
     không phải "tối ưu độ chính xác".

   R-13 — định danh bằng mã giả danh 6 số, không dùng danh tính thật.
   R-12-a — các cột *_muc_tieu là dữ liệu GIẢ DANH (pseudonymous),
     không phải ẩn danh tuyệt đối: vẫn truy ngược được qua ma_6_so.

   Mục tiêu dinh dưỡng được TRA BẢNG từ (tuổi, giới, mức vận động) theo
   Bảng Nhu cầu Dinh dưỡng Khuyến nghị 2016 — Viện Dinh dưỡng Quốc gia.
   Học sinh KHÔNG sửa được (Hồ sơ & Cài đặt §2.2 — ô bị khoá).

   ⚠ Bốn con số mục tiêu dưới đây là DEMO. Phải đối chiếu bảng NCDD 2016
     bản chính thức trước khi dùng thật.
   ========================================================================= */

export const HOC_SINH_HIEN_TAI = {
  id: 'hs-uuid-0001',
  ma_6_so: '482913',
  ten_ao: 'Mèo Lười',          // khuyến khích biệt danh — không tham gia phép tính nào
  tuoi: 16,
  gioi: 'nam',
  muc_van_dong: 'vua',         // thap | vua | cao
  di_ung: ['lac'],             // mã lấy từ danhSachDiUng.js
  // Thêm 29/7 — ô "Khác" ở Hồ sơ: ghi chú TỰ DO cho dị ứng ngoài 14 nhóm
  // chuẩn. KHÔNG tham gia bộ lọc "An toàn dị ứng" (khác di_ung[] ở trên) —
  // vì thanh_phan_di_ung của món chỉ bao giờ gắn mã trong 14 nhóm chuẩn,
  // không có chỗ so khớp với chữ tự gõ. Chỉ để hiển thị/ghi chú lại.
  di_ung_khac: '',

  // --- Mục tiêu NGÀY, tra bảng, chỉ xem ---
  kcal_muc_tieu: 2500,
  dam_muc_tieu: 68,
  glucid_muc_tieu: 375, // thêm 29/7 — xem công thức ở lib/traBangDinhDuong.js
  lipid_muc_tieu: 69,
  canxi_muc_tieu: 1000,
  sat_muc_tieu: 18,

  // --- Đồng ý sử dụng app (R-34, R-35) ---
  // Ghi đè mỗi lần tick, KHÔNG giữ lịch sử đầy đủ các lần trước.
  da_dong_y: true,
  ngay_dong_y_gan_nhat: '2026-07-21',
}
