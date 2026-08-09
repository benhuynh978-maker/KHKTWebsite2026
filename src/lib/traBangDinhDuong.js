/* =========================================================================
   TRA BẢNG NHU CẦU DINH DƯỠNG (RNI 15–19 tuổi)
   -------------------------------------------------------------------------
   kcal/canxi/sắt/kẽm — nguồn: KV-BangRDA_15-19Tuoi.md (Viện Dinh dưỡng
   2016), người dùng đã tự đối chiếu xác nhận — ĐÚNG bảng RDA_15_19 đã dùng
   ở test/muc-tieu-dinh-duong.js, đồng bộ 2 bên (trước đây 2 bên lệch số,
   xem lich-su liên quan — 05/08/2026 sửa Website khớp lại số đã xác minh).

   Sắt phụ thuộc mức HẤP THU (hap_thu_sat: trungBinh/cao — hấp thu tốt hơn
   thì cần ít sắt tổng khẩu phần hơn). Kẽm phụ thuộc mức hấp thu kẽm
   (hap_thu_kem: kem/vua/tot). Hai trường này lấy từ Hồ sơ — mặc định an
   toàn khi thiếu/sai giá trị: sắt→trungBinh, kẽm→vừa (không throw).

   Đạm/Glucid/Lipid KHÔNG có trong RDA_15_19 (bảng gốc chỉ có kcal/canxi/
   sắt/kẽm) — giữ nguyên cách tính minh hoạ đã có trước (đạm tra bảng
   riêng, glucid/lipid theo % năng lượng AMDR), CHƯA đối chiếu bảng chính
   thức, xem BANG_DAM_G/TI_LE_*_NANG_LUONG bên dưới.

   Từ 07/08/2026: kcal/canxi/sắt/kẽm đọc từ BANG_MUC_TIEU — MUTABLE, giá
   trị dưới đây chỉ là mặc định/dự phòng lúc chưa tải xong. CongDuLieu.jsx
   ghi đè bằng dữ liệu thật từ bảng Supabase `Dinh_Duong_Muc_Tieu` lúc mở
   app (xem data/supabase/khoMucTieuDinhDuong.js) — số không đổi (đã đối
   chiếu khớp), chỉ đổi NGUỒN đọc, từ single-source-of-truth ở Supabase
   thay vì hằng số JS. tinhMucTieuDinhDuong() vẫn ĐỒNG BỘ (không async) vì
   HoSo.jsx gọi trong useMemo để xem trước khi gõ form — bảng phải tải
   xong TRƯỚC, không tải theo yêu cầu. */

export const BANG_MUC_TIEU = {
  kcal: { nam: { thap: 2500, vua: 2820, cao: 3140 }, nu: { thap: 2110, vua: 2380, cao: 2650 } },
  canxi: { nam: { '': 1000 }, nu: { '': 1000 } }, // tuổi vị thành niên, cả hai giới — R-32, xem 3.8 Bộ quy tắc
  sat: { nam: { trungBinh: 17.5, cao: 11.6 }, nu: { trungBinh: 29.7, cao: 19.8 } },
  kem: { nam: { kem: 20, vua: 10.0, tot: 6.0 }, nu: { kem: 16.0, vua: 8.0, tot: 4.8 } },
}

const BANG_DAM_G = {
  nam: { thap: 58, vua: 65, cao: 72 },
  nu: { thap: 52, vua: 58, cao: 64 },
}

const TI_LE_GLUCID_NANG_LUONG = 0.6
const TI_LE_LIPID_NANG_LUONG = 0.25

export function tinhMucTieuDinhDuong({ tuoi, gioi, muc_van_dong, hap_thu_sat, hap_thu_kem }) {
  const g = gioi === 'nu' ? 'nu' : 'nam'
  const v = ['thap', 'vua', 'cao'].includes(muc_van_dong) ? muc_van_dong : 'vua'
  const hs = hap_thu_sat === 'cao' ? 'cao' : 'trungBinh'
  const hk = ['kem', 'vua', 'tot'].includes(hap_thu_kem) ? hap_thu_kem : 'vua'
  const kcal = BANG_MUC_TIEU.kcal[g][v]

  return {
    kcal_muc_tieu: kcal,
    dam_muc_tieu: BANG_DAM_G[g][v],
    glucid_muc_tieu: Math.round((kcal * TI_LE_GLUCID_NANG_LUONG) / 4),
    lipid_muc_tieu: Math.round((kcal * TI_LE_LIPID_NANG_LUONG) / 9),
    canxi_muc_tieu: BANG_MUC_TIEU.canxi[g][''],
    sat_muc_tieu: BANG_MUC_TIEU.sat[g][hs],
    kem_muc_tieu: BANG_MUC_TIEU.kem[g][hk],
  }
}
