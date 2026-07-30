/* =========================================================================
   XẾP DỮ LIỆU THEO KHOẢNG THỜI GIAN — dùng cho trang Phân tích
   -------------------------------------------------------------------------
   Theo "Kế hoạch trang Phân tích" (tài liệu chính thức, v1.0) Phần 2.1 và
   3.2: mỗi tab có SỐ CỘT cố định (Ngày → 7, Tuần → 4; "Tháng" tài liệu chỉ
   ghi "vài tháng gần nhất" — không cho số cụ thể, nhóm dựng giao diện chọn
   6 làm mặc định, cần xác nhận lại). Cách chia "Tuần" bắt đầu Thứ 2 và
   "Tháng" theo lịch dương (không phải 30 ngày trượt) vẫn là lựa chọn của
   nhóm dựng giao diện — tài liệu không nói rõ quy ước này.

   Mỗi khoảng tính:
     • Chi tiêu = TỔNG cộng dồn trong khoảng (Phần 3.2/4.2/5.2 — tài liệu
       gọi là "chi phí", đổi tên hiển thị thành "Chi tiêu" theo yêu cầu
       29/7, số vẫn tính y hệt).
     • kcal / đạm / glucid / lipid / canxi / sắt = TRUNG BÌNH MỖI NGÀY
       trong khoảng (không phải tổng) — mở rộng 29/7 từ đúng công thức đã
       áp dụng cho đạm sang cả 5 chỉ số dinh dưỡng còn lại, cùng lý do:
       đây là các chỉ số "mỗi ngày cần bao nhiêu", cộng dồn thô sẽ sai bản
       chất khi so với mốc RNI/ngày.
   Với khoảng ĐÃ KẾT THÚC hẳn, mẫu số là số ngày định nghĩa trọn vẹn (7 cho
   tuần, số ngày thật của tháng). Với khoảng ĐANG DIỄN RA (chứa hôm nay,
   vd "Tuần này"/"Tháng này" chưa qua hết), tài liệu không nói rõ cách tính
   — nhóm dựng giao diện chọn chỉ chia cho số ngày ĐÃ TRÔI QUA tính đến hết
   hôm nay, để tránh trung bình bị pha loãng bởi những ngày chưa tới. Đây
   là suy luận riêng, gần tinh thần mục 9.2 của tài liệu (các trường hợp
   lệch khoảng "để lại quyết định khi dựng thật") — cần bạn xác nhận.

   Trả về mảng bucket { nhan, batDau, ketThuc, chiPhi, kcal, dam, glucid,
   lipid, canxi, sat } — batDau/ketThuc giữ lại (không chỉ dùng nội bộ) để
   nơi gọi (src/data/api.js) có thể tự kiểm tra thêm, ví dụ "khoảng này có
   lộ trình nào chạy không" (Phần 3.4).
   ========================================================================= */

const MOT_NGAY_MS = 24 * 60 * 60 * 1000

function pad2(n) {
  return String(n).padStart(2, '0')
}

function taoKhoangNgay(soLuong) {
  const homNay = new Date(); homNay.setHours(0, 0, 0, 0)
  const ds = []
  for (let i = soLuong - 1; i >= 0; i--) {
    const batDau = new Date(homNay); batDau.setDate(batDau.getDate() - i)
    const ketThuc = new Date(batDau); ketThuc.setDate(ketThuc.getDate() + 1)
    const nhan = i === 0 ? 'Hôm nay' : `${pad2(batDau.getDate())}/${pad2(batDau.getMonth() + 1)}`
    ds.push({ nhan, batDau, ketThuc })
  }
  return ds
}

function taoKhoangTuan(soLuong) {
  const homNay = new Date(); homNay.setHours(0, 0, 0, 0)
  const thuTrongTuan = homNay.getDay() === 0 ? 7 : homNay.getDay() // CN=0 → 7
  const dauTuanNay = new Date(homNay)
  dauTuanNay.setDate(dauTuanNay.getDate() - (thuTrongTuan - 1))

  const ds = []
  for (let i = soLuong - 1; i >= 0; i--) {
    const batDau = new Date(dauTuanNay); batDau.setDate(batDau.getDate() - i * 7)
    const ketThuc = new Date(batDau); ketThuc.setDate(ketThuc.getDate() + 7)
    const nhan = i === 0 ? 'Tuần này' : `${pad2(batDau.getDate())}/${pad2(batDau.getMonth() + 1)}`
    ds.push({ nhan, batDau, ketThuc })
  }
  return ds
}

function taoKhoangThang(soLuong) {
  const homNay = new Date()
  const ds = []
  for (let i = soLuong - 1; i >= 0; i--) {
    const batDau = new Date(homNay.getFullYear(), homNay.getMonth() - i, 1)
    const ketThuc = new Date(homNay.getFullYear(), homNay.getMonth() - i + 1, 1)
    const nhan = i === 0 ? 'Tháng này' : `Th.${batDau.getMonth() + 1}`
    ds.push({ nhan, batDau, ketThuc })
  }
  return ds
}

function soNgayLamMauSo(batDau, ketThuc) {
  const hetHomNay = new Date(); hetHomNay.setHours(0, 0, 0, 0)
  hetHomNay.setDate(hetHomNay.getDate() + 1)
  const gioiHan = ketThuc <= hetHomNay ? ketThuc : hetHomNay
  return Math.max(1, Math.round((gioiHan - batDau) / MOT_NGAY_MS))
}

const CAC_CHI_SO_TRUNG_BINH_NGAY = ['kcal', 'dam', 'glucid', 'lipid', 'canxi', 'sat']

function gomMotKhoang(khoang, danhSach) {
  const trongKhoang = danhSach.filter((d) => {
    const t = new Date(d.thoi_gian_ghi_nhan)
    return t >= khoang.batDau && t < khoang.ketThuc
  })
  const soNgay = soNgayLamMauSo(khoang.batDau, khoang.ketThuc)
  const tong = (khoa) => trongKhoang.reduce((s, d) => s + (d[khoa] ?? 0), 0)

  const ketQua = {
    nhan: khoang.nhan, batDau: khoang.batDau, ketThuc: khoang.ketThuc,
    chiPhi: tong('gia'),
  }
  for (const khoa of CAC_CHI_SO_TRUNG_BINH_NGAY) {
    ketQua[khoa] = tong(khoa) / soNgay
  }
  return ketQua
}

/** 7 ngày gần nhất (Phần 2.1). */
export function xepKhoangNgay(danhSach, soLuong = 7) {
  return taoKhoangNgay(soLuong).map((k) => gomMotKhoang(k, danhSach))
}

/** 4 tuần gần nhất (Phần 2.1), tuần bắt đầu Thứ 2. */
export function xepKhoangTuan(danhSach, soLuong = 4) {
  return taoKhoangTuan(soLuong).map((k) => gomMotKhoang(k, danhSach))
}

/** "Vài tháng gần nhất" (Phần 2.1 không cho số cụ thể) — mặc định 6. */
export function xepKhoangThang(danhSach, soLuong = 6) {
  return taoKhoangThang(soLuong).map((k) => gomMotKhoang(k, danhSach))
}
