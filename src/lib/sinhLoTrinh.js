/* =========================================================================
   THUẬT TOÁN SINH LỘ TRÌNH — Pha 2 (07/08/2026), port công thức đã kiểm
   định từ test/lo-trinh-sinh.js + test/dieu-phoi-lo-trinh.js (xem
   test/lich-su/lo-trinh.md), thay bản tạm dùng số % tuỳ đặt trước đó.

   3 điểm khác biệt có chủ đích so với test/ (đã được người dùng xác nhận
   khi lên kế hoạch Pha 2, 07/08/2026):
   1. Buổi: quay lại đúng test/ — chỉ 2 tổ hợp cố định (3 hoặc 4 bữa), suy
      từ `form.cac_buoi_ap_dung.length` (không cần field so_bua riêng —
      bảng `lo_trinh` không có cột này, tránh phải sửa schema).
   2. Triết lý "bất khả": theo test/ — CHỈ dị ứng (tầng 4, an toàn tính
      mạng) còn chặn cứng. Tồn kho/sàn canxi-sắt/ghi chú "tránh cay" đều
      chuyển thành CẢNH BÁO đi kèm kết quả thành công (mảng `canhBao`),
      khác 5 tầng chặn cứng của bản tạm trước đây. Riêng NGÂN SÁCH: từ
      10/08/2026 có thêm 1 tầng chặn cứng MỚI (sàn tối thiểu theo số bữa,
      xem SAN_NGAN_SACH_TUAN ở thamSoLoTrinh.js) — quyết định chính sách
      riêng ngoài phạm vi triết lý "luôn sinh được" gốc của test/, KHÁC với
      việc ngân sách VƯỢT dự kiến trong lúc mô phỏng (vẫn chỉ là cảnh báo).
   3. Chống lặp Giai đoạn 4 (ghi nhận thật, xem api.js:layMonKhopKhung)
      không có tiền lệ ở test/ (test/ chưa từng làm Giai đoạn 4) — tự thiết
      kế dựa trên lịch sử ghi nhận thật, không phải mô phỏng.

   Field món dùng thẳng shape thật của khoVi4.js (dam_g/canxi_mg/sat_mg/
   kem_mg/glucid_g/lipid_g/coDinhDuong/mon_goc_id...), không phải mock cũ.
   ========================================================================= */

import { DANH_SACH_MON } from '../data/mock/mon.js'
import { DANH_SACH_QUAN } from '../data/mock/quan.js'
import { tien, TEN_BUOI } from './dinhDang.js'
import { monAnToanChoDiUng } from './diUng.js'
import { tinhDiem } from './chamDiem.js'
import { THAM_SO_CHUAN } from './thamSoChamDiem.js'
import {
  TI_LE_BUA, SO_UNG_VIEN_TOP, KHOANG_CACH_CHONG_LAP, BUOC_NOI_RONG_TOP, SAN_NGAN_SACH_TUAN,
  BAN_KINH_MAC_DINH_M, SAN_GIA_MOT_BUA,
} from './thamSoLoTrinh.js'

const NGUON_THEO_BUOI = { sang: 'quan_ngoai', trua: 'cang_tin', chieu: 'quan_ngoai', toi: 'quan_ngoai' }

export const TEN_MUC_DICH = {
  du_chat_trong_ngan_sach: 'Đủ chất trong ngân sách',
  tang_dam: 'Tăng đạm',
  tiet_kiem_toi_da: 'Tiết kiệm tối đa',
  du_nang_luong_hoc_nang: 'Đủ năng lượng cho ngày học nặng',
  an_da_dang: 'Ăn đa dạng, đổi món',
  an_nhe_de_tieu: 'Ăn nhẹ, dễ tiêu',
}

function layTatCaMonKemQuanNoiBo() {
  const quanTheoId = new Map(DANH_SACH_QUAN.map((q) => [q.id, q]))
  return DANH_SACH_MON.map((m) => ({ ...m, quan: quanTheoId.get(m.quan_id) }))
}

/* Băm chuỗi → số nguyên 32-bit không dấu (djb2) — port test/lo-trinh-sinh.js,
   tất định tuyệt đối (không Math.random()), giữ được cách kiểm chứng "tính
   tay số kỳ vọng trước" của cả dự án (CLAUDE.md mục E). */
function bamChuoiTatDinh(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) | 0
  return h >>> 0
}

function chonTatDinhTheoSeed(list, seed) {
  return list[bamChuoiTatDinh(seed) % list.length]
}

function monChuaLapGanDay(mon, lichSuDaDung, ngay) {
  const ngayCuoiDung = lichSuDaDung.get(mon.id)
  return ngayCuoiDung === undefined || ngay - ngayCuoiDung >= KHOANG_CACH_CHONG_LAP
}

/** Mục tiêu dinh dưỡng ĐÚNG 1 BỮA (số đơn, không phải khoảng) — dùng cho
 *  `tinhDiem()`. KHÔNG lưu vào khung (không đụng schema Supabase), tính lại
 *  mỗi lần cần. Gọi thẳng `tinhDiem()`, KHÔNG qua `xepHangMon()` — hàm đó tự
 *  nhân `HE_SO_BUA` (giả định "1 bữa = 40% ngày" cho Gợi ý nhanh), ở đây
 *  mục tiêu đã là số của ĐÚNG buổi đang xét, nhân lại sẽ sai gấp đôi hệ số
 *  (xem test/lich-su/lo-trinh.md mục "Kiến trúc"). */
export function mucTieuMotBuaTuHoSo(hoSo, tiLe) {
  return {
    kcal: (hoSo.kcal_muc_tieu ?? 0) * tiLe,
    canxi: (hoSo.canxi_muc_tieu ?? 0) * tiLe,
    sat: (hoSo.sat_muc_tieu ?? 0) * tiLe,
    kem: (hoSo.kem_muc_tieu ?? 0) * tiLe,
  }
}

/* Chỉ xét BUỔI — dùng cho tầng 4 (an toàn dị ứng, tầng DUY NHẤT chặn cứng).
   Nguồn (căng-tin/quán ngoài) và bán kính KHÔNG phải vấn đề an toàn, mà là
   tồn kho/dữ liệu (đúng tầng 2 cũ) — nên KHÔNG được gộp vào đây, dù cùng
   nằm trong object `khung`. Tách riêng để phát hiện đúng thật: dữ liệu
   hiện có 0 quán `cang_tin` (chưa khảo sát căng-tin trường), nếu gộp
   chung sẽ chặn cứng NHẦM bữa trưa mọi lúc dù không hề liên quan dị ứng. */
function monKhopBuoi(mon, khung) {
  return mon.buoi.includes(khung.buoi)
}

function monKhopNguonBanKinh(mon, khung) {
  if (mon.quan.loai_hinh !== khung.nguon) return false
  if (khung.ban_kinh_m && mon.quan.khoang_cach_m > khung.ban_kinh_m) return false
  return true
}

/** Khung dinh dưỡng/giá cho MỖI buổi đã chọn — dùng để HIỂN THỊ (Giai đoạn 3)
 *  và LƯU Supabase (`lo_trinh_khung`, 5 cột numeric cố định: kcal_min/
 *  kcal_max/dam_min/gia_max/ban_kinh_m — KHÔNG thêm field lạ vào object này,
 *  sẽ vỡ INSERT). kcal theo dải đã dùng để chấm điểm (`THAM_SO_CHUAN.daiKcal`,
 *  85%-115%); đạm theo cận dưới dải AMDR (`daiPLG.dam`, suy ra gam từ %,
 *  KHÔNG phải số mới tự đặt); ngân sách/bữa = (ngân_sách_tuần/7) × tỉ_lệ_buổi
 *  — CÙNG bảng tỉ lệ với dinh dưỡng (buổi ăn nhiều thì chi phí tự nhiên
 *  nhiều hơn, quyết định gốc của test/, chốt 02/08/2026). */
export function xayKhungMoiBuoi(hoSo, form) {
  const soBua = form.cac_buoi_ap_dung.length
  const tiLeBang = TI_LE_BUA[soBua]

  const khungMoiBuoi = {}
  for (const buoi of form.cac_buoi_ap_dung) {
    const tiLe = tiLeBang[buoi]
    const kcalBua = (hoSo.kcal_muc_tieu ?? 0) * tiLe
    const damBuaCanDuoi = (kcalBua * THAM_SO_CHUAN.daiPLG.dam[0]) / 100 / 4
    khungMoiBuoi[buoi] = {
      buoi,
      nguon: NGUON_THEO_BUOI[buoi],
      kcal_min: Math.round(kcalBua * THAM_SO_CHUAN.daiKcal.a),
      kcal_max: Math.round(kcalBua * THAM_SO_CHUAN.daiKcal.b),
      dam_min: Math.round(damBuaCanDuoi),
      gia_max: Math.max(SAN_GIA_MOT_BUA, Math.round((form.ngan_sach_tuan / 7) * tiLe)),
      ban_kinh_m: NGUON_THEO_BUOI[buoi] === 'cang_tin' ? null : BAN_KINH_MAC_DINH_M,
    }
  }
  return { khungMoiBuoi }
}

/** Chọn 1 món cho đúng 1 bữa trong mô phỏng 7 ngày. LUÔN cố trả về 1 món
 *  (triết lý test/: "luôn sinh, không bao giờ bất khả" — trừ dị ứng đã
 *  chặn ở tầng 4 trước khi hàm này chạy) — ưu tiên trong ngân sách/không
 *  cay trước, nới dần nếu rỗng, KHÔNG bao giờ chặn cứng vì lý do chất
 *  lượng. Trả kèm 2 cờ để caller ghi cảnh báo, không tự ghi ở đây (hàm này
 *  không biết "ngày mấy/bữa nào" để viết câu cảnh báo đầy đủ). */
function chonMonMoPhongBua(monAnToan, khung, rangBuocGhiChu, mucTieuBua, lichSuDaDung, ngay, seedBua) {
  const quaBuoi = monAnToan.filter((m) => monKhopBuoi(m, khung))
  if (quaBuoi.length === 0) return { mon: null, giaVuotNganSach: false, khongTimDuocKhongCay: false, khongDungNguon: false }

  // Ưu tiên đúng nguồn/bán kính dự kiến — nới nếu rỗng (KHÔNG chặn cứng).
  // Tồn kho/dữ liệu (vd chưa khảo sát căng-tin) là chuyện chất lượng, không
  // phải an toàn — xem ghi chú monKhopBuoi().
  let ungVienNguon = quaBuoi.filter((m) => monKhopNguonBanKinh(m, khung))
  let khongDungNguon = false
  if (ungVienNguon.length === 0) {
    khongDungNguon = true
    ungVienNguon = quaBuoi
  }

  // Ưu tiên trong ngân sách bữa — nới dần nếu rỗng (KHÔNG chặn cứng).
  let ungVien = ungVienNguon.filter((m) => m.gia !== null && m.gia <= khung.gia_max)
  let giaVuotNganSach = false
  if (ungVien.length === 0) {
    const coGia = ungVienNguon.filter((m) => m.gia !== null)
    giaVuotNganSach = coGia.length > 0
    ungVien = coGia.length > 0 ? coGia : ungVienNguon
  }

  // Ưu tiên không cay nếu ghi chú "tránh cay" — nới nếu rỗng.
  let khongTimDuocKhongCay = false
  if (rangBuocGhiChu?.tranh_cay) {
    const khongCay = ungVien.filter((m) => !m.cay)
    if (khongCay.length > 0) ungVien = khongCay
    else khongTimDuocKhongCay = true
  }

  const xepHang = ungVien
    .map((mon) => ({ mon, diem: tinhDiem(mon, mucTieuBua.kcal, mucTieuBua.canxi, mucTieuBua.sat, mucTieuBua.kem, THAM_SO_CHUAN) }))
    .sort((a, b) => a.diem - b.diem)

  // Task 3 — chống lặp: chỉ chọn trong top, nới rộng dần nếu chống lặp loại
  // sạch nhóm top, chọn 1 bằng băm tất định (test/lich-su/lo-trinh.md mục Task 3).
  let k = Math.min(SO_UNG_VIEN_TOP, xepHang.length)
  for (;;) {
    const bang = xepHang.slice(0, k)
    const conLai = bang.filter((x) => monChuaLapGanDay(x.mon, lichSuDaDung, ngay))
    if (conLai.length > 0) {
      return { mon: chonTatDinhTheoSeed(conLai, `${seedBua}|top${k}`).mon, giaVuotNganSach, khongTimDuocKhongCay, khongDungNguon }
    }
    if (k >= xepHang.length) break
    k = Math.min(k + BUOC_NOI_RONG_TOP, xepHang.length)
  }

  const bangGoc = xepHang.slice(0, Math.min(SO_UNG_VIEN_TOP, xepHang.length))
  return { mon: chonTatDinhTheoSeed(bangGoc, `${seedBua}|fallback`).mon, giaVuotNganSach, khongTimDuocKhongCay, khongDungNguon }
}

/* =========================================================================
   TIỀN KIỂM + SINH LỘ TRÌNH
   -------------------------------------------------------------------------
   2 điều kiện chặn cứng: an toàn dị ứng (tầng 4) VÀ sàn ngân sách/tuần
   (tầng 'ngan_sach', thêm 10/08/2026 — quyết định chính sách riêng, dưới
   sàn coi là tiếp tay gây hại, không phải vấn đề "chọn được món hay không"
   nên không thể xử lý bằng cảnh báo như các mục dưới). Mọi thứ khác (tồn
   kho/lặp món, sàn canxi/sắt, ghi chú "tránh cay") LUÔN được xử lý bằng
   cách chọn phương án tốt nhất có thể + ghi cảnh báo, đúng triết lý test/
   đã chốt từ lúc bàn ý tưởng ("không bao giờ báo bất khả", xem
   test/lich-su/lo-trinh.md mục "Đã cân nhắc và bỏ").
   ========================================================================= */
export function chayTienKiemVaSinhLoTrinh(hoSo, form, rangBuocGhiChu) {
  const soBua = form.cac_buoi_ap_dung.length

  // Tầng ngân sách — chặn TRƯỚC tầng dị ứng (rẻ hơn, không cần lọc món).
  // Kiểm theo soBua thật (KHÔNG suy ngược từ form.so_bua — field đó không
  // tồn tại, xem ghi chú đầu file) để không lệch với sàn form đã chặn.
  const sanNganSach = SAN_NGAN_SACH_TUAN[soBua]
  if (sanNganSach != null && form.ngan_sach_tuan < sanNganSach) {
    return {
      khaThi: false, tang: 'ngan_sach',
      lyDo: `Ngân sách tuần (${tien(form.ngan_sach_tuan)}) thấp hơn mức tối thiểu ${tien(sanNganSach)} cho lộ trình ${soBua} bữa/ngày — mức này đảm bảo lộ trình có đủ món đạt dinh dưỡng cơ bản, không phải giới hạn kỹ thuật. Hãy quay lại form tăng ngân sách.`,
    }
  }

  const { khungMoiBuoi } = xayKhungMoiBuoi(hoSo, form)
  const tatCaMon = layTatCaMonKemQuanNoiBo()
  const tiLeBang = TI_LE_BUA[soBua]

  // Tầng 4 — loại trừ dị ứng TRƯỚC khi xét các tầng khác. Tầng CÒN LẠI vẫn
  // chặn cứng: an toàn tính mạng, không thể "cứ chọn liều một món".
  const monAnToan = tatCaMon.filter((m) => monAnToanChoDiUng(m, hoSo.di_ung))
  for (const buoi of form.cac_buoi_ap_dung) {
    const khung = khungMoiBuoi[buoi]
    const coMonAnToan = monAnToan.some((m) => monKhopBuoi(m, khung))
    if (!coMonAnToan) {
      return {
        khaThi: false, tang: 4,
        lyDo: `Không có món nào an toàn (theo dị ứng đã khai ở Hồ sơ) khớp buổi ${TEN_BUOI[buoi].toLowerCase()} trong dữ liệu hiện có. Hãy cập nhật lại dị ứng ở Hồ sơ, hoặc thử lại nếu chỉ là thiếu dữ liệu tạm thời.`,
      }
    }
  }

  let tienConLai = form.ngan_sach_tuan
  const lichSuDaDung = new Map() // mã món → ngày dùng gần nhất (Task 3)
  const xemTruoc7Ngay = []
  const canhBao = []
  const daCanhBaoNguon = new Set() // 1 cảnh báo/buổi, không lặp lại 7 lần
  const seedGoc = `${form.ngan_sach_tuan}|${soBua}|${form.muc_dich}`

  for (let ngay = 1; ngay <= 7; ngay++) {
    let canxiNgay = 0
    let satNgay = 0
    const monTrongNgay = []

    for (const buoi of form.cac_buoi_ap_dung) {
      const khung = khungMoiBuoi[buoi]
      const mucTieuBua = mucTieuMotBuaTuHoSo(hoSo, tiLeBang[buoi])
      const seedBua = `${seedGoc}|${ngay}|${buoi}`
      const tenBuoiChu = TEN_BUOI[buoi].toLowerCase()

      const { mon, giaVuotNganSach, khongTimDuocKhongCay, khongDungNguon } = chonMonMoPhongBua(
        monAnToan, khung, rangBuocGhiChu, mucTieuBua, lichSuDaDung, ngay, seedBua,
      )

      if (!mon) {
        // Phòng thủ — tầng 4 ở trên đã đảm bảo có ≥1 món an toàn khớp
        // buổi này, nên nhánh này không nên xảy ra trong vận hành bình
        // thường. Vẫn xử lý mềm thay vì để undefined rơi xuống làm hỏng
        // phần tính canxi/sắt bên dưới.
        canhBao.push(`Ngày ${ngay}, bữa ${tenBuoiChu}: không tìm được món phù hợp, bỏ trống bữa này.`)
        monTrongNgay.push({ buoi, mon: null })
        continue
      }

      monTrongNgay.push({ buoi, mon })
      tienConLai -= mon.gia ?? 0
      lichSuDaDung.set(mon.id, ngay)
      canxiNgay += mon.canxi_mg
      satNgay += mon.sat_mg

      if (giaVuotNganSach) {
        canhBao.push(`Ngày ${ngay}, bữa ${tenBuoiChu}: món đã chọn (${tien(mon.gia)}) vượt ngân sách dự kiến cho bữa này (${tien(khung.gia_max)}).`)
      }
      if (khongTimDuocKhongCay) {
        canhBao.push(`Ngày ${ngay}, bữa ${tenBuoiChu}: chưa tìm được món không cay theo ghi chú, đã chọn món cay tốt nhất có thể.`)
      }
      if (khongDungNguon && !daCanhBaoNguon.has(buoi)) {
        daCanhBaoNguon.add(buoi)
        canhBao.push(`Bữa ${tenBuoiChu}: chưa đủ dữ liệu quán đúng nguồn dự kiến (căng-tin/quán ngoài trường), tạm dùng quán khác cho những ngày liên quan.`)
      }
    }

    // ⚠ CỐ Ý không cảnh báo khi canxiNgay/satNgay dưới sàn khuyến nghị —
    // R-32/§3.2 (xem VongTron.jsx, CLAUDE.md mục C): "KHÔNG cảnh báo, màu
    // đỏ, hay thông điệp ở BẤT KỲ ngưỡng dinh dưỡng nào" (nghiên cứu cho
    // thấy cảnh báo hạn mức tạo ám ảnh đồ ăn ở lứa tuổi này). Vẫn tính và
    // giữ 2 số này trong xemTruoc7Ngay để dùng nội bộ sau này nếu cần,
    // nhưng KHÔNG đẩy thành canhBao hiển thị cho học sinh.
    xemTruoc7Ngay.push({ thu_tu_ngay: ngay, mon: monTrongNgay, canxi: canxiNgay, sat: satNgay })
  }

  if (tienConLai < 0) {
    canhBao.push(`Tổng chi dự kiến cả tuần (${tien(form.ngan_sach_tuan - tienConLai)}) vượt ngân sách đã đặt (${tien(form.ngan_sach_tuan)}).`)
  }

  return {
    khaThi: true,
    khungMoiBuoi,
    tongChiDuKien: form.ngan_sach_tuan - tienConLai,
    xemTruoc7Ngay,
    canhBao,
  }
}
