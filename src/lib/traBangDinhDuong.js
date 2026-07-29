/* =========================================================================
   TRA BẢNG NHU CẦU DINH DƯỠNG — PHIÊN BẢN TẠM, CHƯA ĐỐI CHIẾU BẢNG CHÍNH THỨC
   -------------------------------------------------------------------------
   ⚠ Kế hoạch dự án §1.1 (Nguyên tắc 5) và §3.1 chốt: mục tiêu dinh dưỡng
     PHẢI tra từ Bảng Nhu cầu Dinh dưỡng Khuyến nghị 2016 (Viện Dinh dưỡng
     Quốc gia) theo tuổi/giới/mức vận động — KHÔNG bao giờ thu cân nặng/
     chiều cao. Bảng số bên dưới là GIẢ ĐỊNH MINH HOẠ do nhóm dựng giao
     diện tự đặt để form Hồ sơ có số hiển thị được, CHƯA đối chiếu bảng
     chính thức. Khi có số thật từ Viện Dinh dưỡng, thay phần thân hàm
     dưới đây — nơi gọi (HoSo.jsx) không cần sửa.

     Ghi chú riêng: sat_muc_tieu demo cũ trong mock/hocSinh.js (18mg cho
     nam) cao bất thường cho nam giới — bảng dưới dùng số hợp lý hơn
     (nữ tuổi dậy thì cần sắt cao hơn nam do mất máu kinh nguyệt), nhưng
     VẪN LÀ MINH HOẠ, không phải số đã kiểm chứng.
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

export function tinhMucTieuDinhDuong({ tuoi, gioi, muc_van_dong }) {
  const g = gioi === 'nu' ? 'nu' : 'nam'
  const v = ['thap', 'vua', 'cao'].includes(muc_van_dong) ? muc_van_dong : 'vua'

  return {
    kcal_muc_tieu: BANG_KCAL[g][v],
    dam_muc_tieu: BANG_DAM_G[g][v],
    canxi_muc_tieu: CANXI_MG,
    sat_muc_tieu: BANG_SAT_MG[g],
  }
}
