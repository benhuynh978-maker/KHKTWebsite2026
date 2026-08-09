/* =========================================================================
   ƯU TIÊN/LOẠI MÓN THEO BUỔI — port từ test/buoi.js (07/08/2026, đợt thay
   engine chấm điểm gợi ý nhanh). Khác test/: KHÔNG tính lại giao ca giờ từ
   đầu (mon.gioMo1/gioDong1... không có trên shape món của Website) — dùng
   thẳng `mon.buoi` (mảng buổi đã tính sẵn 1 lần lúc tải, xem
   data/supabase/khoVi4.js:buoiKhopQuan()), tránh tính trùng 2 lần. Riêng
   quán-nghỉ-hôm-nay cần field thô `ngay_nghi` (thêm vào khoVi4.js cùng đợt
   này) vì khoVi4.js trước đó chỉ giữ chuỗi hiển thị, không giữ giá trị so
   sánh được.
   ========================================================================= */

const KHUNG_GIO_BUOI = {
  sang: { batDau: '05:00', ketThuc: '10:00' },
  trua: { batDau: '10:00', ketThuc: '14:00' },
  chieu: { batDau: '14:00', ketThuc: '17:00' },
  toi: { batDau: '17:00', ketThuc: '22:00' },
}

function raPhut(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Buổi hiện tại theo giờ máy. Trả null nếu ngoài cả 4 khung (đêm khuya
 *  22h–5h) — nơi gọi tự quyết định mặc định khi đó. */
export function buoiHienTai() {
  const bayGio = new Date()
  const phutHienTai = bayGio.getHours() * 60 + bayGio.getMinutes()
  for (const buoi of Object.keys(KHUNG_GIO_BUOI)) {
    const k = KHUNG_GIO_BUOI[buoi]
    if (phutHienTai >= raPhut(k.batDau) && phutHienTai < raPhut(k.ketThuc)) return buoi
  }
  return null
}

/** SẮP XẾP LẠI, KHÔNG LOẠI BỎ: món của quán bán đúng buổi lên trước, món của
 *  quán không bán/thiếu dữ liệu buổi xuống cuối. Partition ổn định — giữ
 *  nguyên thứ tự điểm trong từng nhóm, không sort lại. `buoi === null` (chưa
 *  xác định được buổi hiện tại) trả nguyên `kho`, không xếp lại gì. */
export function xepTheoBuoi(kho, buoi) {
  if (buoi === null) return kho
  const khop = []
  const khongKhop = []
  for (const x of kho) {
    (Array.isArray(x.mon.buoi) && x.mon.buoi.includes(buoi) ? khop : khongKhop).push(x)
  }
  return [...khop, ...khongKhop]
}

/* Nhãn thứ trong tuần khớp định dạng cột quan_an.ngay_nghi (vd "Thứ 2") —
   Chủ nhật ở chỉ số 0 giống Date.getDay(). */
const NHAN_THU_TRONG_TUAN = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

function thuHomNay() {
  return NHAN_THU_TRONG_TUAN[new Date().getDay()]
}

/** LOẠI CỨNG (không đẩy-xuống-cuối như buổi) — quán nghỉ hôm nay là chắc
 *  chắn không bán, khác "không khớp buổi" (chỉ là không ưu tiên). ngay_nghi
 *  null (đa số quán, chưa khảo sát) không loại — thiếu dữ liệu không phải
 *  bằng chứng "có nghỉ". */
export function quanNghiHomNay(mon) {
  return mon.ngay_nghi === thuHomNay()
}

export function locQuanNghiHomNay(kho) {
  return kho.filter((x) => !quanNghiHomNay(x.mon))
}
