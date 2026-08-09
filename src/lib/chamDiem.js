/* =========================================================================
   CÔNG THỨC TÍNH ĐIỂM — port từ test/cham-diem.js (07/08/2026, đợt thay
   engine chấm điểm gợi ý nhanh). Toàn bộ HÀM THUẦN: mọi dữ liệu vào qua
   đối số, không đọc trạng thái phiên, không đụng giao diện. Điểm CÀNG THẤP
   CÀNG TỐT. Công thức + lý do chọn: KV-HeThongGoiY_KetQuaCuoiCung.md mục
   1-10 (tài liệu gốc ở thư mục cha, dùng chung cho cả test/ lẫn Website/).

   Field món đổi tên cho khớp shape của Website (khoVi4.js), KHÔNG đổi công
   thức: dam→dam_g, beo→lipid_g, duong→glucid_g, canxi→canxi_mg, sat→sat_mg,
   kem→kem_mg. mucTieu đổi tên theo đúng cột hoc_sinh thật (*_ngay→*_muc_tieu).
   ========================================================================= */

import { DIEM_KHONG_XAC_DINH, HE_SO_BUA } from './thamSoChamDiem.js'

/* Một họ hàm phạt duy nhất: 0 trong dải, tăng tuyến tính khi lệch ra ngoài.
   d một phía chính là trường hợp hi = Infinity. */
function dDai(x, lo, hi) {
  if (x < lo) return Math.max(0, Math.min(1, (lo - x) / lo))
  if (x > hi) return Math.max(0, Math.min(1, (x - hi) / hi))
  return 0
}

/* Mẫu số lệch nhau hai nhánh: nhánh thiếu giữ thang đo /T_kcal, nhánh thừa
   dùng riêng s_trần. */
function dKcal(kcal, tKcal, ts) {
  if (tKcal <= 0) return 0
  const aT = ts.daiKcal.a * tKcal
  const bT = ts.daiKcal.b * tKcal
  const sTran = ts.daiKcal.sTranHeSo * tKcal
  if (kcal < aT) return Math.max(0, Math.min(1, (aT - kcal) / tKcal))
  if (kcal > bT) return Math.max(0, Math.min(1, (kcal - bT) / sTran))
  return 0
}

/* Đổi gam sang % năng lượng của chính món (đạm 4, béo 9, bột đường 4 kcal/g)
   rồi so với dải mục tiêu. Món 0 kcal coi là lệch tối đa. */
function dPLG(mon, ts) {
  if (mon.kcal <= 0) return 1
  const phanTramDam = (mon.dam_g * 4 / mon.kcal) * 100
  const phanTramBeo = (mon.lipid_g * 9 / mon.kcal) * 100
  const phanTramDuong = (mon.glucid_g * 4 / mon.kcal) * 100
  const dP = dDai(phanTramDam, ts.daiPLG.dam[0], ts.daiPLG.dam[1])
  const dL = dDai(phanTramBeo, ts.daiPLG.beo[0], ts.daiPLG.beo[1])
  const dG = dDai(phanTramDuong, ts.daiPLG.duong[0], ts.daiPLG.duong[1])
  return (dP + dL + dG) / 3
}

/* MinSum một phía trên Canxi/Sắt/Kẽm — vi chất khó "quá liều" nên không
   cần trần trên. */
function dVichat(mon, tCanxi, tSat, tKem, ts) {
  const dCa = dDai(mon.canxi_mg, tCanxi, Infinity)
  const dFe = dDai(mon.sat_mg, tSat, Infinity)
  const dZn = dDai(mon.kem_mg, tKem, Infinity)
  return ts.trongSoVichat.canxi * dCa + ts.trongSoVichat.sat * dFe + ts.trongSoVichat.kem * dZn
}

export function tinhDiem(mon, tKcal, tCanxi, tSat, tKem, ts) {
  if (!mon.coDinhDuong) return DIEM_KHONG_XAC_DINH
  return (
    ts.trongSoNhom.kcal * dKcal(mon.kcal, tKcal, ts) +
    ts.trongSoNhom.plg * dPLG(mon, ts) +
    ts.trongSoNhom.vichat * dVichat(mon, tCanxi, tSat, tKem, ts)
  )
}

/** Chấm điểm + xếp hạng toàn bộ món.
 *  `mucTieu` = hồ sơ học sinh (đọc kcal_muc_tieu/canxi_muc_tieu/sat_muc_tieu/
 *  kem_muc_tieu — mục tiêu CẢ NGÀY, nhân HE_SO_BUA để ra mục tiêu một bữa).
 *  `ts` = bộ tham số của box (thamSoChamDiem.js). */
export function xepHangMon(danhSachMon, mucTieu, ts) {
  const tKcal = (mucTieu.kcal_muc_tieu ?? 0) * HE_SO_BUA
  const tCanxi = (mucTieu.canxi_muc_tieu ?? 0) * HE_SO_BUA
  const tSat = (mucTieu.sat_muc_tieu ?? 0) * HE_SO_BUA
  const tKem = (mucTieu.kem_muc_tieu ?? 0) * HE_SO_BUA

  return danhSachMon
    .map((m) => ({ mon: m, diem: tinhDiem(m, tKcal, tCanxi, tSat, tKem, ts) }))
    .sort((a, b) => a.diem - b.diem)
}
