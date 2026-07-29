/* =========================================================================
   LỚP DỮ LIỆU — ĐÂY LÀ LỚP THAY THẾ DUY NHẤT
   -------------------------------------------------------------------------
   Toàn bộ giao diện chỉ gọi các hàm trong file này, KHÔNG bao giờ import
   thẳng từ thư mục mock/. Khi backend xong:

       → viết lại phần thân các hàm dưới đây bằng truy vấn Supabase
       → xoá thư mục src/data/mock/
       → KHÔNG phải sửa một dòng nào trong src/pages/ hay src/components/

   Nhờ vậy các vấn đề còn đang bàn ở tầng thuật toán (sàn dinh dưỡng,
   phân bổ ngân sách, hàm chấm điểm) có sửa thế nào cũng không kéo theo
   phải dựng lại giao diện.
   ========================================================================= */

import { HOC_SINH_HIEN_TAI } from './mock/hocSinh.js'
import { DANH_SACH_MON, timMon } from './mock/mon.js'
import { DANH_SACH_QUAN } from './mock/quan.js'
import {
  TRANG_THAI, KICH_BAN, KICH_BAN_MAC_DINH, apKichBanVaoTrangThai,
  thuTuNgayHomNay, khungTheoNgayCuaLoTrinhHienTai, taoLoTrinhMoi,
  huyLoTrinhHienTai, themGhiNhanLoTrinh, xoaMotDongGhiNhanLoTrinh,
  layToanBoKhuVuc2, xoaSachTrangThaiLoTrinh, coLoTrinhTrongKhoang,
} from './mock/loTrinh.js'
import {
  LICH_SU_GOI_Y_GHI_NHAN, themGoiYGhiNhan, xoaGhiNhanCuaHocSinh, xoaMotDongGoiY,
} from './mock/goiYGhiNhanLichSu.js'
import { chayTienKiemVaSinhLoTrinh } from '../lib/sinhLoTrinh.js'
import { tinhMucTieuDinhDuong } from '../lib/traBangDinhDuong.js'
import { NHOM_DI_UNG, tenDiUng } from './mock/danhSachDiUng.js'
import { xepKhoangNgay, xepKhoangTuan, xepKhoangThang } from '../lib/xepKhoangThoiGian.js'

const MOT_NGAY_MS = 24 * 60 * 60 * 1000
const BA_TIENG_MS = 3 * 60 * 60 * 1000

/* --- Kịch bản đang xem (chỉ phục vụ việc dựng giao diện) -------------
   Chọn 1 kịch bản = nạp dữ liệu tương ứng vào TRANG_THAI (mock/loTrinh.js)
   — trạng thái sống DUY NHẤT mà mọi hàm Lộ trình bên dưới cùng đọc/ghi. */

let kichBanHienTai = KICH_BAN_MAC_DINH
export const datKichBan = (ten) => { kichBanHienTai = ten; apKichBanVaoTrangThai(ten) }
export const layKichBan = () => kichBanHienTai
export const danhSachKichBan = () =>
  Object.entries(KICH_BAN).map(([ma, k]) => ({ ma, nhan: k.nhan }))

// Nạp kịch bản mặc định ngay khi module được tải lần đầu, để Dashboard có
// dữ liệu sẵn kể cả khi chưa ai mở trang Lộ trình hay Bảng thử nghiệm.
apKichBanVaoTrangThai(kichBanHienTai)

/* --- Hồ sơ (Khu vực 1) ----------------------------------------------- */

export const layHoSo = () => HOC_SINH_HIEN_TAI

/** Danh sách cố định 14 nhóm dị ứng chuẩn EU — vốn từ dùng chung giữa Hồ
 *  sơ và Khu vực 4 ("Hồ sơ & Cài đặt" §2.1.1). Đi qua lớp này thay vì
 *  import thẳng mock/danhSachDiUng.js để giữ đúng nguyên tắc "một điểm
 *  thay thế duy nhất" ở đầu file. */
export const layNhomDiUng = () => NHOM_DI_UNG
export const tenNhomDiUng = tenDiUng

/** R-34/R-35 — checkbox đồng ý sử dụng app. GHI ĐÈ mỗi lần tick, KHÔNG
 *  giữ lịch sử đầy đủ các lần trước (khác phiếu nghiên cứu KHKT chính
 *  thức, vốn cần lưu vết đầy đủ theo R-11/R-23). Gọi khi tick ở: (a) sửa
 *  Hồ sơ, (b) tạo lộ trình mới. */
export const xacNhanDongY = () => {
  HOC_SINH_HIEN_TAI.da_dong_y = true
  HOC_SINH_HIEN_TAI.ngay_dong_y_gan_nhat = new Date().toISOString().slice(0, 10)
}

/** Trang Hồ sơ — lưu thay đổi. Mục tiêu dinh dưỡng LUÔN được TÍNH LẠI từ
 *  (tuổi, giới, mức vận động) qua bảng tra (§2.2: "Ô mục tiêu dinh dưỡng
 *  ... bị KHOÁ — mục đích duy nhất là hiển thị, không cho người dùng
 *  chỉnh sửa dưới bất kỳ hình thức nào") — không có cách nào ghi tay vào
 *  4 cột đó qua hàm này. R-34: mỗi lần sửa Hồ sơ cũng cần đồng ý lại. */
export const capNhatHoSo = (thongTin) => {
  const { ten_ao, tuoi, gioi, muc_van_dong, di_ung } = thongTin
  Object.assign(HOC_SINH_HIEN_TAI, { ten_ao, tuoi, gioi, muc_van_dong, di_ung })
  Object.assign(HOC_SINH_HIEN_TAI, tinhMucTieuDinhDuong(HOC_SINH_HIEN_TAI))
  xacNhanDongY()
}

/** Cài đặt §3.3.2 — "Rút đồng ý & xoá dữ liệu của tôi", MỘT nút, MỘT hành
 *  động liền mạch (R-14): ngừng xử lý + xoá thật khỏi mọi bảng liên quan
 *  tới mã học sinh này (R-25). Xoá thật, không đánh dấu ẩn.
 *  Hộp thoại xác nhận nêu rõ xoá "hồ sơ, lộ trình, lịch sử ăn uống" — nên
 *  xoá CẢ thông tin hồ sơ (tuổi/giới/vận động/dị ứng/mục tiêu), không chỉ
 *  lộ trình/lịch sử. Giữ nguyên id/ma_6_so vì bản demo chưa có màn đăng
 *  ký lại/đăng nhập thật để cấp một mã mới. */
export const xoaToanBoDuLieu = () => {
  xoaSachTrangThaiLoTrinh()
  xoaGhiNhanCuaHocSinh(HOC_SINH_HIEN_TAI.ma_6_so)

  Object.assign(HOC_SINH_HIEN_TAI, {
    ten_ao: '', tuoi: null, gioi: null, muc_van_dong: null, di_ung: [],
    kcal_muc_tieu: null, dam_muc_tieu: null, canxi_muc_tieu: null, sat_muc_tieu: null,
    da_dong_y: false, ngay_dong_y_gan_nhat: null,
  })
}

/* --- Quán & Món (Khu vực 4) ------------------------------------------ */

export const layQuan = (id) => DANH_SACH_QUAN.find((q) => q.id === id) ?? null

/** Món kèm sẵn thông tin quán — khoảng cách & giờ hoạt động là thuộc tính
 *  của QUÁN, thẻ món chỉ đọc lại ("Ăn gì hôm nay" §4.1). */
export const layMonKemQuan = (mon_id) => {
  const mon = timMon(mon_id)
  if (!mon) return null
  return { ...mon, quan: layQuan(mon.quan_id) }
}

export const layTatCaMonKemQuan = () =>
  DANH_SACH_MON.map((m) => ({ ...m, quan: layQuan(m.quan_id) }))

/** Mỗi quán kèm danh sách món của đúng quán đó — nuôi trang
 *  "Quán ăn gần đây" (§2.2: "Phần dưới — thẻ món của đúng quán đó"). */
export const layTatCaQuanKemMon = () =>
  DANH_SACH_QUAN.map((q) => ({
    ...q,
    mon: DANH_SACH_MON.filter((m) => m.quan_id === q.id),
  }))

/* --- Lộ trình (Khu vực 2) ---------------------------------------------
   Tất cả đọc thẳng từ TRANG_THAI (mock/loTrinh.js) — trạng thái sống DUY
   NHẤT, dù được nạp bởi Bảng thử nghiệm (kịch bản) hay bởi luồng 4 giai
   đoạn thật ở trang Lộ trình. */

export const layLoTrinhDangChay = () => TRANG_THAI.lo_trinh

/** Toàn bộ 7 ngày × khung của lộ trình ĐANG CHẠY — dùng cho Giai đoạn 3
 *  (Xem lộ trình) và Giai đoạn 4 (Theo dõi). Khối 1 Dashboard chỉ cần
 *  "hôm nay", xem layKhungHomNay() bên dưới. */
export const layTatCaKhungTheoNgay = () => khungTheoNgayCuaLoTrinhHienTai()

export const layKhungHomNay = () => {
  if (!TRANG_THAI.lo_trinh) return []
  const thuTu = thuTuNgayHomNay()
  return khungTheoNgayCuaLoTrinhHienTai().find((n) => n.thu_tu_ngay === thuTu)?.cac_khung ?? []
}

export const layTatCaGhiNhanLoTrinh = () => TRANG_THAI.ghi_nhan
export const layThuTuNgayHomNay = () => thuTuNgayHomNay()

export const layGhiNhanLoTrinhHomNay = () => {
  const idsHomNay = layKhungHomNay().map((k) => k.id)
  return TRANG_THAI.ghi_nhan.filter((g) => idsHomNay.includes(g.lo_trinh_khung_id))
}

/* Kịch bản demo giữ 1 dòng minh hoạ cố định (ghi_nhan_goi_y_demo, xem
   mock/loTrinh.js) CỘNG với bất kỳ bữa nào học sinh vừa ghi nhận THẬT hôm
   nay qua "Ăn gì hôm nay" / "Quán ăn gần đây" trong phiên đang xem
   (LICH_SU_GOI_Y_GHI_NHAN) — để hai vòng tròn ở Dashboard phản ứng đúng
   khi bạn thử bấm "Đã ăn món này" ở hai trang đó, đúng tinh thần §3.2:
   "CỘNG dữ liệu 'đã ăn' từ CẢ Khu vực 2 và 3". Mất khi tải lại trang —
   đúng bản chất của lớp mock. */
export const layGhiNhanGoiYHomNay = () => {
  const dauNgayHomNay = new Date()
  dauNgayHomNay.setHours(0, 0, 0, 0)

  const tuTuongTacThat = LICH_SU_GOI_Y_GHI_NHAN.filter(
    (g) =>
      g.ma_hoc_sinh === HOC_SINH_HIEN_TAI.ma_6_so &&
      new Date(g.thoi_gian_ghi_nhan) >= dauNgayHomNay
  )
  return [...TRANG_THAI.ghi_nhan_goi_y_demo, ...tuTuongTacThat]
}

/* =========================================================================
   TRANG LỘ TRÌNH — Giai đoạn 1–4
   ========================================================================= */

/** Giai đoạn 2 — Màn chờ: chạy tiền kiểm 5 tầng + sinh khung. Trả về
 *  { khaThi:true, khungMoiBuoi, tongChiDuKien } hoặc
 *  { khaThi:false, tang, lyDo }. KHÔNG mutate gì — chỉ tính. */
export const chayTienKiemLoTrinh = (form, rangBuocGhiChu, opts) =>
  chayTienKiemVaSinhLoTrinh(layHoSo(), form, rangBuocGhiChu, opts)

/** Giai đoạn 3 → bấm "Áp dụng" — hậu kiểm (Kế hoạch dự án §4.2): backend
 *  kiểm lại lần cuối, có quyền từ chối lưu. Trong bản demo đồng bộ này,
 *  hậu kiểm chạy lại ĐÚNG hàm tiền kiểm với ĐÚNG input — nên về mặt tất
 *  định sẽ luôn cho cùng kết quả với tiền kiểm (không có khoảng hở lỗi
 *  logic như khi có server thật xử lý bất đồng bộ). Vẫn giữ bước gọi lại
 *  này để đúng kiến trúc "3 lớp bảo vệ" (Kế hoạch dự án §1.1, Nguyên tắc
 *  3) — không bỏ qua bước phủ quyết dù trong demo nó khó thấy tác dụng. */
export const chayHauKiemVaApDung = (form, khungMoiBuoi) => {
  const ketQuaHauKiem = chayTienKiemVaSinhLoTrinh(
    layHoSo(), form, form.rang_buoc_ghi_chu ?? {}, { boQuaSanViChat: form.boQuaSanViChat }
  )
  if (!ketQuaHauKiem.khaThi) return ketQuaHauKiem
  taoLoTrinhMoi(form, khungMoiBuoi)
  return { khaThi: true }
}

export const huyLoTrinh = (lyDo) => huyLoTrinhHienTai(lyDo)

/** Giai đoạn 4 — ghi nhận một bữa (chọn trong khung, hoặc ăn ngoài kế
 *  hoạch). Gộp "chọn món + xác nhận" làm MỘT hành động, đúng Lộ trình
 *  §6.6 — không có bước tick riêng. */
export const ghiNhanBuaLoTrinh = (dong) => themGhiNhanLoTrinh(dong)

/** Trang Lộ trình, Giai đoạn 4 — "Hiện 3 món điểm cao nhất TRONG KHUNG",
 *  "Món khác" cuộn qua hạng 4,5,6... (§6.2, §6.4). Dùng lại đúng bộ lọc
 *  ràng buộc cứng của monKhopKhungLoc bên dưới — chỉ khác n = số lấy ra.
 *  ⚠ Thứ tự "hạng" ở đây là sắp theo đạm/giá, KHÔNG phải hàm chấm điểm
 *    trọng số cuối cùng (Kế hoạch dự án §5.3) — xem ghi chú ở đó. */
export const layMonKhopKhung = (khung, n = 3) =>
  monKhopKhungLoc(khung)
    .sort((a, b) => b.dam_g / b.gia - a.dam_g / a.gia)
    .slice(0, n)

/* =========================================================================
   TÓM TẮT DINH DƯỠNG HÔM NAY — nuôi hai vòng tròn ở Khối 1
   Quy tắc lấy số theo "Kế hoạch trang Dashboard" §3.2.
   ========================================================================= */

export const layTomTatDinhDuongHomNay = () => {
  const loTrinh = layLoTrinhDangChay()
  if (!loTrinh) return null

  const khung = layKhungHomNay()

  /* MẪU SỐ (mốc 100%) — lấy từ chính lộ trình đang chạy, tổng hợp từ
     lo_trinh_khung của các buổi HÔM NAY. Đọc thẳng từ lộ trình, KHÔNG đọc
     lại Hồ sơ mỗi lần hiển thị (§3.2).

     Dùng kcal_min / dam_min làm mốc vì §3.2 chốt khung ngôn ngữ
     "ĐÃ ĐẠT ĐƯỢC" (adequacy) — mốc phải là ngưỡng đủ, không phải trần. */
  const moc_dam = khung.reduce((t, k) => t + k.dam_min, 0)
  const moc_kcal = khung.reduce((t, k) => t + k.kcal_min, 0)

  /* TỬ SỐ (đã ăn) — cộng dồn mọi bản ghi hôm nay từ CẢ HAI nguồn:
     lo_trinh_ghi_nhan (Khu vực 2) VÀ goi_y_ghi_nhan (Khu vực 3),
     vì học sinh có thể ăn một bữa qua Gợi ý nhanh dù đang có lộ trình. */
  const ghiNhanLoTrinh = layGhiNhanLoTrinhHomNay()
  const ghiNhanGoiY = layGhiNhanGoiYHomNay()
  const tatCa = [...ghiNhanLoTrinh, ...ghiNhanGoiY]

  const da_an_dam = tatCa.reduce((t, g) => t + (g.dam_tai_thoi_diem ?? 0), 0)
  const da_an_kcal = tatCa.reduce((t, g) => t + (g.kcal_tai_thoi_diem ?? 0), 0)

  /* Lỗ đã được ghi nhận sẵn trong tài liệu (§3.2, khung "Lỗ đã phát hiện"):
     khi ăn ngoài lộ trình thì mon_id NULL nên kcal/đạm cũng NULL — bữa đó
     KHÔNG đóng góp vào tử số dù thực tế có ăn. Không sửa cơ chế ghi nhận,
     chỉ khai đúng bản chất con số bằng dòng chú thích. */
  const so_bua_chua_tinh = ghiNhanLoTrinh.filter(
    (g) => g.trang_thai === 'da_an_ngoai_khung'
  ).length

  return {
    phan_tram_dam: moc_dam ? (da_an_dam / moc_dam) * 100 : 0,
    phan_tram_nang_luong: moc_kcal ? (da_an_kcal / moc_kcal) * 100 : 0,
    so_bua_chua_tinh,
  }
}

/* =========================================================================
   MÓN HÔM NAY — Khối 1, Phần A
   §3.1 có 3 tình huống. Hàm này trả về đúng một trong ba.
   ========================================================================= */

export const layMonHomNay = () => {
  const loTrinh = layLoTrinhDangChay()
  if (!loTrinh) return { tinh_huong: 'chua_co_lo_trinh' }

  const ghiNhan = layGhiNhanLoTrinhHomNay()

  // Tình huống 2 — đã ghi nhận bữa hôm nay: hiện trạng thái xác nhận,
  // không còn là gợi ý nữa.
  if (ghiNhan.length > 0) {
    const g = ghiNhan[ghiNhan.length - 1]
    if (g.trang_thai === 'da_an_ngoai_khung') {
      return { tinh_huong: 'da_ghi_nhan_ngoai_khung', mon_tu_ghi: g.mon_tu_ghi }
    }
    return { tinh_huong: 'da_ghi_nhan', mon: layMonKemQuan(g.mon_id) }
  }

  // Tình huống 1 — chưa ghi nhận: hiện món hạng 1 khớp khung.
  const khung = layKhungHomNay()
  const khungKeTiep = khung[0]
  if (!khungKeTiep) return { tinh_huong: 'chua_co_lo_trinh' }

  return {
    tinh_huong: 'chua_ghi_nhan',
    mon: monHang1KhopKhung(khungKeTiep),
    buoi: khungKeTiep.buoi,
  }
}

/* =========================================================================
   ⚠ HÀM TẠM — CHƯA PHẢI HÀM CHẤM ĐIỂM THẬT
   -------------------------------------------------------------------------
   Dashboard §1.2 nói rõ đây là ngoại lệ DUY NHẤT của nguyên tắc
   "không tính toán logic mới": lấy món hạng 1 khớp khung bằng cách
   DÙNG LẠI hàm chấm điểm đã tồn tại — không viết logic mới.

   Hàm chấm điểm thật (Kế hoạch dự án §5.3) hiện còn đang bàn ở tầng
   thuật toán, nên ở đây chỉ lọc theo ràng buộc CỨNG của khung rồi lấy
   món đầu tiên. KHÔNG chấm điểm, KHÔNG xếp hạng, KHÔNG đoán trọng số.

   Khi hàm chấm điểm được chốt: xoá hàm này, gọi hàm thật từ backend.
   ========================================================================= */
function monKhopKhungLoc(khung) {
  const hoSo = layHoSo()

  return layTatCaMonKemQuan().filter((m) => {
    if (!m.buoi.includes(khung.buoi)) return false
    if (m.gia > khung.gia_max) return false
    if (m.kcal < khung.kcal_min || m.kcal > khung.kcal_max) return false
    if (m.dam_g < khung.dam_min) return false
    // Loại trừ cá nhân — bỏ sạch món dính dị ứng TRƯỚC khi xét tiếp
    // (tầng kiểm tra 4, Kế hoạch dự án §4.1).
    if (m.thanh_phan_di_ung.some((d) => hoSo.di_ung.includes(d))) return false
    if (khung.nguon === 'cang_tin' && m.quan.loai_hinh !== 'cang_tin') return false
    if (khung.nguon === 'quan_ngoai' && m.quan.loai_hinh !== 'quan_ngoai') return false
    if (khung.ban_kinh_m && m.quan.khoang_cach_m > khung.ban_kinh_m) return false
    return true
  })
}

function monHang1KhopKhung(khung) {
  return monKhopKhungLoc(khung)[0] ?? null
}

/* =========================================================================
   GỢI Ý NHANH — Khối 5, tầng nút bấm khuôn mẫu (3 nút)
   §6.1: tầng này KHÔNG cần AI hiểu ngôn ngữ, chạy thẳng hàm chấm điểm
   có sẵn và trả về top 3 món.
   ⚠ Cùng lý do trên: đây là bản tạm, chưa gọi hàm chấm điểm thật.
   ========================================================================= */

export const goiYNhanh = (loai) => {
  const hoSo = layHoSo()
  const ds = layTatCaMonKemQuan().filter(
    (m) => !m.thanh_phan_di_ung.some((d) => hoSo.di_ung.includes(d))
  )

  const sapXep = {
    re_nhat: (a, b) => a.gia - b.gia,
    nhieu_dam: (a, b) => b.dam_g - a.dam_g,
    gan_nhat: (a, b) => a.quan.khoang_cach_m - b.quan.khoang_cach_m,
  }[loai]

  return [...ds].sort(sapXep).slice(0, 3)
}

/* =========================================================================
   KHỐI 3 & 4 — bản rút gọn của hai trang duyệt (nay đã dựng — Đợt 2)
   ========================================================================= */

/** Khối 4 & Khu A trang "Ăn gì hôm nay" — món được chọn nhiều nhất trong
 *  7 ngày qua, đếm gộp TOÀN BỘ học sinh, ẩn danh, không cá nhân hoá theo
 *  người đang xem ("Ăn gì hôm nay" §2.1) — COUNT trực tiếp trên
 *  goi_y_ghi_nhan (ở đây là LICH_SU_GOI_Y_GHI_NHAN, mock cho bảng đó).
 *
 *  ⚠ Không có ngưỡng số học sinh tối thiểu — đúng như tài liệu mô tả.
 *    Với cỡ mẫu thử nghiệm nhỏ (~30–50 học sinh), khối này có thể phản
 *    ánh lựa chọn của rất ít người trong những ngày đầu — đây là điều đã
 *    được bàn ở buổi trước và nhóm quyết định giữ đúng tài liệu, không tự
 *    thêm ngưỡng ẩn. */
export const layDeXuatNoiBat = (soLuong = 5) => {
  const nguong7NgayTruoc = Date.now() - 7 * MOT_NGAY_MS
  const dem = new Map()

  for (const g of LICH_SU_GOI_Y_GHI_NHAN) {
    if (new Date(g.thoi_gian_ghi_nhan).getTime() >= nguong7NgayTruoc) {
      dem.set(g.mon_id, (dem.get(g.mon_id) ?? 0) + 1)
    }
  }

  const xepHang = [...dem.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)
  return xepHang.slice(0, soLuong).map(layMonKemQuan).filter(Boolean)
}

/** Khối 3 — bản rút gọn của trang "Quán ăn gần đây". */
export const layQuanGoiY = (soLuong = 4) => DANH_SACH_QUAN.slice(0, soLuong)

/* =========================================================================
   CHỐNG SPAM — "Ăn gì hôm nay" §6.3, dùng CHUNG với "Quán ăn gần đây" §5.
   Ngưỡng tính TẤT CẢ dòng goi_y_ghi_nhan có nguon = tu_chon của học sinh
   hiện tại, KHÔNG phân biệt ghi nhận từ trang nào trong hai trang — tránh
   việc đổi qua lại 2 trang để né giới hạn.

   ⚠ "Theo ngày" ở đây cài đặt bằng cửa sổ trượt 24 giờ (gần đúng cho bản
     demo), CHƯA giải quyết câu hỏi múi giờ / ranh giới "ngày Việt Nam"
     00:00 đã nêu ở buổi bàn trước — cần chốt khi nối backend thật.
   ========================================================================= */

export const kiemTraGioiHanTuChon = () => {
  const bayGio = Date.now()
  const cuaToi = LICH_SU_GOI_Y_GHI_NHAN.filter(
    (g) => g.ma_hoc_sinh === HOC_SINH_HIEN_TAI.ma_6_so && g.nguon === 'tu_chon'
  )
  const trong3Tieng = cuaToi.filter(
    (g) => bayGio - new Date(g.thoi_gian_ghi_nhan).getTime() < BA_TIENG_MS
  )
  const trongHomNay = cuaToi.filter(
    (g) => bayGio - new Date(g.thoi_gian_ghi_nhan).getTime() < MOT_NGAY_MS
  )

  // Hai thông báo tránh nhắc tới cân nặng/ngoại hình — nhất quán với R-05
  // và tinh thần "không phán xét" (§6.3).
  if (trong3Tieng.length >= 3) {
    return { choPhep: false, thongDiep: 'Hãy nghỉ ngơi một chút!' }
  }
  if (trongHomNay.length >= 10) {
    return {
      choPhep: false,
      thongDiep: 'App cũng cần nghỉ ngơi một chút — mai mình tiếp tục nha.',
    }
  }
  return { choPhep: true }
}

/** Nút "Đã ăn món này" trong modal (§6.2) — chỉ nguồn tu_chon mới đi qua
 *  ngưỡng chống spam này (goi_y_nhanh ở Dashboard không cộng gộp, §6.3). */
export const ghiNhanDaAnTuChon = (mon) => {
  const kt = kiemTraGioiHanTuChon()
  if (!kt.choPhep) return kt

  themGoiYGhiNhan({
    id: `gy-${Date.now()}`,
    ma_hoc_sinh: HOC_SINH_HIEN_TAI.ma_6_so,
    mon_id: mon.id,
    nguon: 'tu_chon',
    gia_tai_thoi_diem: mon.gia,
    kcal_tai_thoi_diem: mon.kcal,
    dam_tai_thoi_diem: mon.dam_g,
    canxi_tai_thoi_diem: mon.canxi_mg,
    sat_tai_thoi_diem: mon.sat_mg,
    thoi_gian_ghi_nhan: new Date().toISOString(),
  })
  return { choPhep: true }
}

/* =========================================================================
   TRANG LỊCH SỬ — hợp nhất Khu vực 2 + Khu vực 3, CHỈ ĐỌC + XOÁ
   "Kế hoạch trang Lịch sử" §4 (bảng 5 trường hợp dữ liệu), §6 (nguồn).
   -------------------------------------------------------------------------
   §4: Khu vực 2 (lo_trinh_ghi_nhan) lấy buổi qua JOIN với lo_trinh_khung —
   CHÍNH XÁC. Khu vực 3 (goi_y_ghi_nhan) không có cột buổi, phải SUY ĐOÁN
   từ giờ trong thoi_gian_ghi_nhan — kém chính xác hơn, đã được chấp nhận
   khi thiết kế Khu vực 3.
   ========================================================================= */

function suyBuoiTuGio(iso) {
  const gio = new Date(iso).getHours()
  if (gio >= 5 && gio < 10) return 'sang'
  if (gio >= 10 && gio < 14) return 'trua'
  if (gio >= 14 && gio < 17) return 'chieu'
  return 'toi'
}

export const layLichSuHopNhat = () => {
  const { tatCaKhung, ghiNhan } = layToanBoKhuVuc2()
  const khungTheoId = new Map(tatCaKhung.map((k) => [k.id, k]))

  // Khu vực 2 — mỗi dòng là 1 bữa (trong lộ trình hoặc ngoài lộ trình).
  const tuLoTrinh = ghiNhan.map((g) => {
    const khung = khungTheoId.get(g.lo_trinh_khung_id)
    const mon = g.mon_id ? layMonKemQuan(g.mon_id) : null
    return {
      id: g.id,
      xoaNguon: 'lo_trinh',
      nhan: g.trang_thai === 'da_an_trong_khung' ? 'trong_khung' : 'ngoai_ke_hoach',
      ten_mon: mon?.ten_mon ?? g.mon_tu_ghi ?? null,
      ten_quan: mon?.quan?.ten_quan ?? null,
      gia: g.gia_tai_thoi_diem, kcal: g.kcal_tai_thoi_diem, dam: g.dam_tai_thoi_diem,
      canxi: g.canxi_tai_thoi_diem, sat: g.sat_tai_thoi_diem,
      buoi: khung?.buoi ?? null, buoiSuyDoan: false,
      thoi_gian_ghi_nhan: g.thoi_gian_ghi_nhan,
    }
  })

  // Khu vực 3 — CHỈ của học sinh đang xem (khác Khối 4 Dashboard, vốn
  // đếm gộp toàn trường — ở đây là lịch sử CÁ NHÂN).
  const tuGoiY = LICH_SU_GOI_Y_GHI_NHAN
    .filter((g) => g.ma_hoc_sinh === HOC_SINH_HIEN_TAI.ma_6_so)
    .map((g) => {
      const mon = layMonKemQuan(g.mon_id)
      return {
        id: g.id,
        xoaNguon: 'goi_y',
        nhan: g.nguon === 'goi_y_nhanh' ? 'goi_y_nhanh' : 'tu_chon',
        ten_mon: mon?.ten_mon ?? null,
        ten_quan: mon?.quan?.ten_quan ?? null,
        gia: g.gia_tai_thoi_diem, kcal: g.kcal_tai_thoi_diem, dam: g.dam_tai_thoi_diem,
        canxi: g.canxi_tai_thoi_diem, sat: g.sat_tai_thoi_diem,
        buoi: suyBuoiTuGio(g.thoi_gian_ghi_nhan), buoiSuyDoan: true,
        thoi_gian_ghi_nhan: g.thoi_gian_ghi_nhan,
      }
    })

  return [...tuLoTrinh, ...tuGoiY].sort(
    (a, b) => new Date(b.thoi_gian_ghi_nhan) - new Date(a.thoi_gian_ghi_nhan)
  )
}

/** §5 — xoá THẬT khỏi đúng bảng gốc, tuỳ dòng thuộc Khu vực 2 hay 3.
 *  Đồng bộ tự động với Theo dõi lộ trình vì cả hai đọc CHUNG mảng
 *  ghi_nhan — không cần logic đồng bộ riêng. */
export const xoaDongLichSu = (dong) => {
  if (dong.xoaNguon === 'lo_trinh') xoaMotDongGhiNhanLoTrinh(dong.id)
  else xoaMotDongGoiY(dong.id)
}

/* =========================================================================
   TRANG PHÂN TÍCH — theo "Kế hoạch trang Phân tích" v1.0 (tài liệu chính
   thức, bổ sung sau khi trang đã dựng lần đầu theo suy luận riêng).
   -------------------------------------------------------------------------
   3 MỤC (Phần 2.2): Lộ trình (Khu vực 2) / Gợi ý nhanh (Khu vực 3) /
   Tổng quan (hợp nhất 2+3). CHỈ mục Lộ trình có mốc tham chiếu (Phần 3.3).
   Vẫn còn 2 điểm tài liệu để ngỏ (Phần 9, chưa chốt):
     • 9.1 — mốc đạm lấy từ lộ trình đang chạy (lo_trinh_khung), KHÔNG từ
       Hồ sơ — quyết định TẠM THỜI theo chính tài liệu.
     • 9.2 — cách cộng dồn mốc khi một lộ trình chỉ phủ MỘT PHẦN khoảng
       thời gian (vd chạy nửa tuần, hoặc nối tiếp nhiều lộ trình trong một
       tháng) — tài liệu để lại "quyết định khi dựng thật", CHƯA xử lý ở
       đây. Cách tính "số ngày làm mẫu số khi trung bình đạm cho khoảng
       ĐANG diễn ra" (src/lib/xepKhoangThoiGian.js) là lựa chọn riêng của
       nhóm dựng giao diện theo tinh thần mục này, không phải từ tài liệu.
   ========================================================================= */

/** Dữ liệu nuôi biểu đồ — dùng CHUNG với trang Lịch sử (layLichSuHopNhat),
 *  đúng tinh thần "Khu vực 5 tổng hợp Khu vực 2 và 3, không đọc thẳng". */
export const layDuLieuPhanTich = (muc) => {
  const toanBo = layLichSuHopNhat()
  if (muc === 'lo_trinh') {
    // Chỉ "trong lộ trình" có số dinh dưỡng thật; "ngoài lộ trình" luôn NULL.
    return toanBo.filter((d) => d.xoaNguon === 'lo_trinh' && d.nhan === 'trong_khung')
  }
  if (muc === 'goi_y_nhanh') {
    // Toàn bộ Khu vực 3 — gồm cả nguồn "goi_y_nhanh" lẫn "tu_chon", vì cả
    // hai cùng ghi vào một bảng goi_y_ghi_nhan (Cơ sở dữ liệu, Khu vực 3).
    return toanBo.filter((d) => d.xoaNguon === 'goi_y')
  }
  // "Tổng quan" — mọi dòng có số dinh dưỡng thật, gộp cả Khu vực 2 và 3.
  return toanBo.filter((d) => d.kcal != null)
}

/** Mốc tham chiếu — CHỈ mục "Lộ trình" mới có (Phần 3.3). null nếu không
 *  có lộ trình đang chạy — không suy đoán mốc từ lộ trình đã huỷ/hết hạn.
 *  Chi phí: mốc/ngày = ngân_sách_tuần ÷ 7 (đúng công thức Phần 3.3); tab
 *  Tuần dùng nguyên ngân_sách_tuần; tab Tháng nhân mốc/ngày với số ngày
 *  THẬT của tháng hiện tại (tài liệu không cho công thức tháng — xem 9.2).
 *  Đạm: lấy từ khung lộ trình đang chạy (không phải Hồ sơ — 9.1). */
export const layMocThamChieuLoTrinh = (tabThoiGian) => {
  const loTrinh = layLoTrinhDangChay()
  if (!loTrinh) return null

  const khung = layKhungHomNay()
  const damMoiNgay = khung.reduce((t, k) => t + k.dam_min, 0)
  const chiPhiMoiNgay = loTrinh.ngan_sach_tuan / 7

  if (tabThoiGian === 'ngay') return { chiPhi: chiPhiMoiNgay, dam: damMoiNgay }
  if (tabThoiGian === 'tuan') return { chiPhi: loTrinh.ngan_sach_tuan, dam: damMoiNgay * 7 }

  const homNay = new Date()
  const soNgayThang = new Date(homNay.getFullYear(), homNay.getMonth() + 1, 0).getDate()
  return { chiPhi: chiPhiMoiNgay * soNgayThang, dam: damMoiNgay * soNgayThang }
}

/** Trang Phân tích — 3 tab thời gian, dùng lại tiện ích xếp khoảng chung
 *  (src/lib/xepKhoangThoiGian.js). Số cột mỗi tab đúng Phần 2.1: Ngày → 7,
 *  Tuần → 4 (mặc định của hàm xếp khoảng, không truyền lại ở đây).
 *  Mục Lộ trình: Phần 3.4 — khoảng KHÔNG có lộ trình nào chạy → đánh dấu
 *  `khongCoDuLieu`, để UI KHÔNG vẽ cột giá trị 0 (dễ hiểu lầm "không ăn
 *  gì" thay vì "không có lộ trình"). Hai mục còn lại không có khái niệm
 *  này (luôn có ý nghĩa dù bằng 0 thật). */
export const layBieuDoPhanTich = (muc, tabThoiGian) => {
  const duLieu = layDuLieuPhanTich(muc)
  const buckets =
    tabThoiGian === 'ngay' ? xepKhoangNgay(duLieu)
    : tabThoiGian === 'tuan' ? xepKhoangTuan(duLieu)
    : xepKhoangThang(duLieu)

  if (muc !== 'lo_trinh') return buckets
  return buckets.map((b) =>
    coLoTrinhTrongKhoang(b.batDau, b.ketThuc) ? b : { ...b, khongCoDuLieu: true }
  )
}

/* --- Khối 2 Dashboard — bản rút gọn của trang Phân tích (mục Tổng quan,
   không mốc — §4 Dashboard) -------------------------------------------- */

export const layChiPhi7NgayRutGon = () => layBieuDoPhanTich('tong_quan', 'ngay')
