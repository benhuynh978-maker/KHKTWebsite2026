/* =========================================================================
   TRA BẢNG NHU CẦU DINH DƯỠNG (RNI 15–19 tuổi) — PHIÊN BẢN TẠM, CHƯA ĐỐI
   CHIẾU BẢNG CHÍNH THỨC
   -------------------------------------------------------------------------
   ⚠ Kế hoạch dự án §1.1 (Nguyên tắc 5) và §3.1 chốt: mục tiêu dinh dưỡng
     PHẢI tra từ Bảng Nhu cầu Dinh dưỡng Khuyến nghị (RNI) 2016 (Viện Dinh
     dưỡng Quốc gia) theo tuổi/giới/mức vận động — KHÔNG bao giờ thu cân
     nặng/chiều cao. Bảng số bên dưới là GIẢ ĐỊNH MINH HOẠ do nhóm dựng
     giao diện tự đặt để form Hồ sơ và trang Phân tích có số hiển thị
     được, CHƯA đối chiếu bảng RNI chính thức. Khi có số thật từ Viện Dinh
     dưỡng, thay phần thân hàm dưới đây — nơi gọi (HoSo.jsx, api.js mục
     Phân tích) không cần sửa.

     Ghi chú riêng: sat_muc_tieu demo cũ trong mock/hocSinh.js (18mg cho
     nam) cao bất thường cho nam giới — bảng dưới dùng số hợp lý hơn
     (nữ tuổi dậy thì cần sắt cao hơn nam do mất máu kinh nguyệt), nhưng
     VẪN LÀ MINH HOẠ, không phải số đã kiểm chứng.

   Glucid/Lipid (thêm 29/7, theo yêu cầu trang Phân tích): RNI chính thức
   thường không cho số gram tuyệt đối cho hai chỉ số này như đạm/canxi/sắt,
   mà cho theo % năng lượng khẩu phần (AMDR — Acceptable Macronutrient
   Distribution Range). Ước lượng MINH HOẠ dùng ở đây: Glucid ≈ 60% năng
   lượng (÷4 kcal/g), Lipid ≈ 25% năng lượng (÷9 kcal/g) — mức giữa của
   khung khuyến nghị chung cho vị thành niên, CHƯA đối chiếu văn bản chính
   thức (giống hạn chế đã nêu ở #3, lib/sinhLoTrinh.js).
   ========================================================================= */

const BANG_KCAL = {
  nam: { thap: 2200, vua: 2500, cao: 2800 },
  nu: { thap: 1800, vua: 2000, cao: 2300 },
}

const BANG_DAM_G = {
  nam: { thap: 58, vua: 65, cao: 72 },
  nu: { thap: 52, vua: 58, cao: 64 },
}

const CANXI_MG = 1000 // tuổi vị thành niên, cả hai giới — R-32, xem 3.8 Bộ quy tắc
const BANG_SAT_MG = { nam: 12, nu: 20 }

const TI_LE_GLUCID_NANG_LUONG = 0.6
const TI_LE_LIPID_NANG_LUONG = 0.25

export function tinhMucTieuDinhDuong({ tuoi, gioi, muc_van_dong }) {
  const g = gioi === 'nu' ? 'nu' : 'nam'
  const v = ['thap', 'vua', 'cao'].includes(muc_van_dong) ? muc_van_dong : 'vua'
  const kcal = BANG_KCAL[g][v]

  return {
    kcal_muc_tieu: kcal,
    dam_muc_tieu: BANG_DAM_G[g][v],
    glucid_muc_tieu: Math.round((kcal * TI_LE_GLUCID_NANG_LUONG) / 4),
    lipid_muc_tieu: Math.round((kcal * TI_LE_LIPID_NANG_LUONG) / 9),
    canxi_muc_tieu: CANXI_MG,
    sat_muc_tieu: BANG_SAT_MG[g],
  }
}
