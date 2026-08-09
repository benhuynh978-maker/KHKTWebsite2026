/* =========================================================================
   KHAI BÁO CÁC BOX VÀ CHIẾN LƯỢC CHỌN MÓN — port từ test/box.js (07/08/2026,
   đợt thay engine chấm điểm gợi ý nhanh, xem lich-su/du-lieu.md +
   NHAT-KY-AI.md cùng ngày). Hàm thuần: nhận kho ứng viên + trạng thái chọn,
   TRẢ VỀ trạng thái mới — không tự sửa biến của nơi gọi, không đụng giao
   diện, không đọc DOM.

   Field món đổi tên cho khớp shape của Website: ma→ma_dinh_duong,
   maMon→id, canxi→canxi_mg, sat→sat_mg, dam→dam_g. Logic KHÔNG đổi.

   Mỗi box khai 4 phần:
     thamSo     — bộ trọng số/dải để chấm điểm riêng cho box này
     locUngVien — lọc kho ứng viên từ bảng đã xếp hạng
     chon       — chiến lược lấy món tiếp theo
     thongBao   — câu hiển thị cho từng kiểu dừng
   ========================================================================= */

import { monAnToanChoDiUng } from './diUng.js'
import { xepTheoBuoi, locQuanNghiHomNay } from './buoi.js'
import { THAM_SO_CHUAN, WINDOW_GOC, BUOC_WINDOW, GIOI_HAN_LAN_RE } from './thamSoChamDiem.js'

function locTheoDiUng(kho, diUngDaChon) {
  return kho.filter((x) => monAnToanChoDiUng(x.mon, diUngDaChon))
}

/* ---- Trạng thái chọn (nơi gọi giữ, truyền vào đây mỗi lượt) ------------
   daHienMa : chặn trùng MÃ DINH DƯỠNG (2 dòng khác quán cùng mã có Điểm
              bằng nhau tuyệt đối).
   daHienMon: chặn hiện lại ĐÚNG DÒNG MÓN đó (id/Ma_mon) — không chặn cả
              quán. Một quán được góp nhiều món trong phiên; quán chỉ thật
              sự hết chỗ khi mọi dòng món của quán đó đều đã hiện hoặc đều
              trùng mã dinh dưỡng đã dùng — hệ quả tự nhiên của 2 Set này. */
export function taoTrangThaiChon() {
  return { viTri: 0, lanThuRe: 0, daHienMa: new Set(), daHienMon: new Set() }
}

function coTheChonMon(mon, tt) {
  if (mon.ma_dinh_duong !== null && tt.daHienMa.has(mon.ma_dinh_duong)) return false
  if (mon.id !== null && tt.daHienMon.has(mon.id)) return false
  return true
}

/* Trả về trạng thái MỚI đã ghi nhận món vừa chọn (không sửa `tt` cũ). */
function ghiDaHien(mon, tt) {
  const daHienMa = new Set(tt.daHienMa)
  const daHienMon = new Set(tt.daHienMon)
  if (mon.ma_dinh_duong !== null) daHienMa.add(mon.ma_dinh_duong)
  if (mon.id !== null) daHienMon.add(mon.id)
  return { ...tt, daHienMa, daHienMon }
}

/* ---- Chiến lược 1: đi tuần tự theo thứ hạng dinh dưỡng ----------------- */
export function chonTuanTuTheoHang(kho, tt) {
  let viTri = tt.viTri
  while (viTri < kho.length) {
    const ung = kho[viTri]
    viTri += 1
    if (coTheChonMon(ung.mon, tt)) {
      return { ketThuc: null, ketQua: ung, tt: ghiDaHien(ung.mon, { ...tt, viTri }) }
    }
  }
  return { ketThuc: 'hetDuLieu', ketQua: null, tt: { ...tt, viTri } }
}

/* ---- Chiến lược 2+3+4: "tốt nhất" trong window mở rộng dần ------------- */
function chonTotNhatTrongWindow(kho, tt, totHonHay, buocWindow = BUOC_WINDOW) {
  if (tt.lanThuRe > GIOI_HAN_LAN_RE) {
    return { ketThuc: 'gioiHanLuot', ketQua: null, tt }
  }
  const n = Math.min(WINDOW_GOC + buocWindow * tt.lanThuRe, kho.length)
  const ungVien = kho.slice(0, n).filter((x) => coTheChonMon(x.mon, tt))

  if (ungVien.length === 0) {
    return { ketThuc: 'hetDuLieu', ketQua: null, tt }
  }

  const chon = ungVien.reduce((tot, cur) => (totHonHay(cur, tot) ? cur : tot))

  return { ketThuc: null, ketQua: chon, tt: ghiDaHien(chon.mon, { ...tt, lanThuRe: tt.lanThuRe + 1 }) }
}

function chonReNhatTrongWindow(kho, tt) {
  return chonTotNhatTrongWindow(kho, tt, (cur, tot) =>
    cur.mon.gia < tot.mon.gia || (cur.mon.gia === tot.mon.gia && cur.diem < tot.diem))
}

/* %đạm trên năng lượng món — dùng riêng cho chiến lược "nhiều đạm". */
function phanTramDam(mon) {
  return mon.kcal > 0 ? (mon.dam_g * 4 / mon.kcal) * 100 : 0
}

function chonNhieuDamTrongWindow(kho, tt) {
  return chonTotNhatTrongWindow(kho, tt, (cur, tot) => {
    const pdCur = phanTramDam(cur.mon), pdTot = phanTramDam(tot.mon)
    return pdCur > pdTot || (pdCur === pdTot && cur.diem < tot.diem)
  })
}

/* Canxi/Sắt THÔ (mg), không phải mật độ/kcal — khớp đúng đơn vị RDA tuyệt
   đối (mg/ngày). Canxi dùng bước window +10 (thay vì +5 mặc định) — xác
   nhận qua mô phỏng thật ở test/, xem KV mục 18. */
function chonNhieuCanxiTrongWindow(kho, tt) {
  return chonTotNhatTrongWindow(kho, tt, (cur, tot) =>
    cur.mon.canxi_mg > tot.mon.canxi_mg || (cur.mon.canxi_mg === tot.mon.canxi_mg && cur.diem < tot.diem), 10)
}

function chonNhieuSatTrongWindow(kho, tt) {
  return chonTotNhatTrongWindow(kho, tt, (cur, tot) =>
    cur.mon.sat_mg > tot.mon.sat_mg || (cur.mon.sat_mg === tot.mon.sat_mg && cur.diem < tot.diem))
}

/* Ngưỡng giá tối đa — LOẠI CỨNG dùng chung cho MỌI box. `nguongGia === null`
   (không kèm giá) trả nguyên `ds`. */
function locTheoGiaToiDa(ds, nguongGia) {
  if (nguongGia === null) return ds
  return ds.filter((x) => x.mon.gia !== null && x.mon.gia <= nguongGia)
}

/* ---- Bảng khai báo box --------------------------------------------------
   `bc` (bối cảnh) do nơi gọi truyền vào: `nguongGia` + `buoi` (buổi đang
   chọn) + `diUngDaChon` (mảng mã dị ứng đã khai ở hồ sơ).

   Mỗi `locUngVien` gọi `locTheoDiUng()` rồi `locQuanNghiHomNay()` rồi
   `locTheoGiaToiDa()` TRƯỚC (3 loại cứng, áp dụng cho MỌI box) rồi mới tới
   bộ lọc riêng của box (nếu có), và gọi `xepTheoBuoi()` SAU CÙNG (chỉ sắp
   xếp lại, không loại). */
export const CAU_HINH_BOX = {
  nhanh: {
    nhan: 'Gợi ý nhanh',
    thamSo: THAM_SO_CHUAN,
    locUngVien: (dsDaXep, bc) => xepTheoBuoi(
      locTheoGiaToiDa(locQuanNghiHomNay(locTheoDiUng(dsDaXep, bc.diUngDaChon)), bc.nguongGia),
      bc.buoi,
    ),
    chon: chonTuanTuTheoHang,
    thongBao: {
      khoRong: 'Không có món nào trong dữ liệu để gợi ý.',
      hetDuLieu: 'Hết món phù hợp.',
    },
  },

  reNhat: {
    nhan: 'Món rẻ nhất',
    thamSo: THAM_SO_CHUAN,
    locUngVien: (dsDaXep, bc) => xepTheoBuoi(
      locTheoGiaToiDa(locQuanNghiHomNay(locTheoDiUng(dsDaXep, bc.diUngDaChon)), bc.nguongGia)
        .filter((x) => x.mon.gia !== null),
      bc.buoi,
    ),
    chon: chonReNhatTrongWindow,
    thongBao: {
      khoRong: 'Không còn món nào khác phù hợp với tiêu chí giá.',
      hetDuLieu: 'Không còn món nào khác phù hợp với tiêu chí giá.',
      gioiHanLuot: 'Để đảm bảo cân bằng giữa giá và chất lượng dinh dưỡng, bạn đã dùng hết lượt đổi món cho lần tìm này.',
    },
  },

  nhieuDam: {
    nhan: 'Nhiều đạm',
    thamSo: THAM_SO_CHUAN,
    locUngVien: (dsDaXep, bc) => xepTheoBuoi(
      locTheoGiaToiDa(locQuanNghiHomNay(locTheoDiUng(dsDaXep, bc.diUngDaChon)), bc.nguongGia)
        .filter((x) => x.mon.coDinhDuong),
      bc.buoi,
    ),
    chon: chonNhieuDamTrongWindow,
    thongBao: {
      khoRong: 'Không có món nào có đủ dữ liệu dinh dưỡng (hoặc trong khoảng giá đã nêu, nếu có) để xét đạm.',
      hetDuLieu: 'Hết món phù hợp.',
      gioiHanLuot: 'Để đảm bảo cân bằng giữa lượng đạm và chất lượng dinh dưỡng tổng thể, bạn đã dùng hết lượt đổi món cho lần tìm này.',
    },
  },

  nhieuCanxi: {
    nhan: 'Nhiều canxi',
    thamSo: THAM_SO_CHUAN,
    locUngVien: (dsDaXep, bc) => xepTheoBuoi(
      locTheoGiaToiDa(locQuanNghiHomNay(locTheoDiUng(dsDaXep, bc.diUngDaChon)), bc.nguongGia)
        .filter((x) => x.mon.coDinhDuong),
      bc.buoi,
    ),
    chon: chonNhieuCanxiTrongWindow,
    thongBao: {
      khoRong: 'Không có món nào có đủ dữ liệu dinh dưỡng (hoặc trong khoảng giá đã nêu, nếu có) để xét canxi.',
      hetDuLieu: 'Hết món phù hợp.',
      gioiHanLuot: 'Để đảm bảo cân bằng giữa lượng canxi và chất lượng dinh dưỡng tổng thể, bạn đã dùng hết lượt đổi món cho lần tìm này.',
    },
  },

  nhieuSat: {
    nhan: 'Nhiều sắt',
    thamSo: THAM_SO_CHUAN,
    locUngVien: (dsDaXep, bc) => xepTheoBuoi(
      locTheoGiaToiDa(locQuanNghiHomNay(locTheoDiUng(dsDaXep, bc.diUngDaChon)), bc.nguongGia)
        .filter((x) => x.mon.coDinhDuong),
      bc.buoi,
    ),
    chon: chonNhieuSatTrongWindow,
    thongBao: {
      khoRong: 'Không có món nào có đủ dữ liệu dinh dưỡng (hoặc trong khoảng giá đã nêu, nếu có) để xét sắt.',
      hetDuLieu: 'Hết món phù hợp.',
      gioiHanLuot: 'Để đảm bảo cân bằng giữa lượng sắt và chất lượng dinh dưỡng tổng thể, bạn đã dùng hết lượt đổi món cho lần tìm này.',
    },
  },

  nhieuKem: {
    nhan: 'Nhiều kẽm',
    // KHÔNG dùng window (khác canxi/sắt) — xem KV mục 21, xác nhận trên dữ
    // liệu thật của test/: ngưỡng kẽm/bữa thấp hơn giá trị max thật nên
    // Điểm chuẩn không bị dồn dải hẹp, tự xếp hạng đúng theo kẽm.
    thamSo: THAM_SO_CHUAN,
    locUngVien: (dsDaXep, bc) => xepTheoBuoi(
      locTheoGiaToiDa(locQuanNghiHomNay(locTheoDiUng(dsDaXep, bc.diUngDaChon)), bc.nguongGia)
        .filter((x) => x.mon.coDinhDuong),
      bc.buoi,
    ),
    chon: chonTuanTuTheoHang,
    thongBao: {
      khoRong: 'Không có món nào có đủ dữ liệu dinh dưỡng (hoặc trong khoảng giá đã nêu, nếu có) để xét kẽm.',
      hetDuLieu: 'Hết món phù hợp.',
    },
  },
}
