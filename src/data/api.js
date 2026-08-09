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
  TRANG_THAI,
  thuTuNgayHomNay, khungTheoNgayCuaLoTrinhHienTai, taoLoTrinhMoi,
  huyLoTrinhHienTai, themGhiNhanLoTrinh, xoaMotDongGhiNhanLoTrinh,
  layToanBoKhuVuc2, xoaSachTrangThaiLoTrinh, coLoTrinhTrongKhoang,
} from './mock/loTrinh.js'
import {
  LICH_SU_GOI_Y_GHI_NHAN, themGoiYGhiNhan, xoaGhiNhanCuaHocSinh, xoaMotDongGoiY,
} from './mock/goiYGhiNhanLichSu.js'
import { chayTienKiemVaSinhLoTrinh, mucTieuMotBuaTuHoSo } from '../lib/sinhLoTrinh.js'
import { TI_LE_BUA, KHOANG_CACH_CHONG_LAP } from '../lib/thamSoLoTrinh.js'
import { tinhMucTieuDinhDuong } from '../lib/traBangDinhDuong.js'
import { monAnToanChoDiUng } from '../lib/diUng.js'
import { xepHangMon, tinhDiem } from '../lib/chamDiem.js'
import { THAM_SO_CHUAN } from '../lib/thamSoChamDiem.js'
import { CAU_HINH_BOX, taoTrangThaiChon } from '../lib/box.js'
import { buoiHienTai } from '../lib/buoi.js'
import { NHOM_DI_UNG, tenDiUng } from './mock/danhSachDiUng.js'
import { xepKhoangNgay, xepKhoangTuan, xepKhoangThang } from '../lib/xepKhoangThoiGian.js'
import { supabase } from './supabase/client.js'
import { luuHoSo } from './supabase/khoHoSo.js'
import {
  luuLoTrinhMoi, luuHuyLoTrinh, luuGhiNhan, xoaGhiNhan, xoaToanBoLoTrinhCuaHocSinh,
} from './supabase/khoLoTrinh.js'
import {
  luuGoiYGhiNhan, xoaMotGoiYGhiNhan, xoaToanBoGoiYCuaHocSinh,
} from './supabase/khoGoiYGhiNhan.js'
import { ghiNhatKyXoa } from './supabase/khoNhatKyXoa.js'
import { guiPhanHoiHoTro as guiPhanHoiHoTroSupabase } from './supabase/khoPhanHoi.js'

const MOT_NGAY_MS = 24 * 60 * 60 * 1000
const BA_TIENG_MS = 3 * 60 * 60 * 1000

// Từ 06/08/2026: KHÔNG còn tự nạp kịch bản demo khi module tải — TRANG_THAI
// giờ được CongDuLieu.jsx nạp bằng dữ liệu THẬT từ Supabase (rỗng nếu học
// sinh chưa từng tạo lộ trình). Bảng thử nghiệm trên Dashboard vẫn hoạt
// động bình thường, chỉ là không còn tự áp lúc mới mở app.

/* --- Hồ sơ (Khu vực 1) ----------------------------------------------- */

export const layHoSo = () => HOC_SINH_HIEN_TAI

/** Trang Đăng ký — gán tên ảo ban đầu học sinh chọn/gõ lúc đăng ký. CHỈ
 *  đụng ten_ao trong bộ nhớ, KHÔNG tự gọi luuHoSo: HOC_SINH_HIEN_TAI.auth_id
 *  cục bộ vẫn chưa khớp phiên thật vừa tạo (chỉ taiHoacTaoHoSo() ở
 *  CongDuLieu.jsx, chạy ở lần tải trang kế tiếp, mới đồng bộ đúng) — ghi
 *  thẳng lên Supabase ở đây sẽ bị RLS chặn (sai auth_id, lỗi 42501).
 *  taiHoacTaoHoSo() tự lấy giá trị này làm ten_ao khởi tạo cho dòng mới —
 *  không cần ghi tay ở đây. */
export const datTenAoBanDau = (ten) => {
  HOC_SINH_HIEN_TAI.ten_ao = ten
}

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
  luuHoSo(HOC_SINH_HIEN_TAI)
}

/** Trang Hồ sơ — lưu thay đổi. Mục tiêu dinh dưỡng LUÔN được TÍNH LẠI từ
 *  (tuổi, giới, mức vận động) qua bảng tra (§2.2: "Ô mục tiêu dinh dưỡng
 *  ... bị KHOÁ — mục đích duy nhất là hiển thị, không cho người dùng
 *  chỉnh sửa dưới bất kỳ hình thức nào") — không có cách nào ghi tay vào
 *  4 cột đó qua hàm này. R-34: mỗi lần sửa Hồ sơ cũng cần đồng ý lại. */
export const capNhatHoSo = (thongTin) => {
  const { ten_ao, tuoi, gioi, muc_van_dong, hap_thu_sat, hap_thu_kem, di_ung, di_ung_khac } = thongTin
  Object.assign(HOC_SINH_HIEN_TAI, { ten_ao, tuoi, gioi, muc_van_dong, hap_thu_sat, hap_thu_kem, di_ung, di_ung_khac })
  Object.assign(HOC_SINH_HIEN_TAI, tinhMucTieuDinhDuong(HOC_SINH_HIEN_TAI))
  xacNhanDongY()
}

/** Cài đặt §3.3.2 — "Rút đồng ý & xoá dữ liệu của tôi", MỘT nút, MỘT hành
 *  động liền mạch (R-14): ngừng xử lý + xoá thật khỏi mọi bảng liên quan
 *  tới mã học sinh này (R-25). Xoá thật, không đánh dấu ẩn.
 *  Hộp thoại xác nhận nêu rõ xoá "hồ sơ, lộ trình, lịch sử ăn uống" — nên
 *  xoá CẢ thông tin hồ sơ (tuổi/giới/vận động/dị ứng/mục tiêu), không chỉ
 *  lộ trình/lịch sử. Giữ nguyên id/ma_6_so vì bản demo chưa có màn đăng
 *  ký lại/đăng nhập thật để cấp một mã mới.
 *  Từ 07/08/2026 (đợt RLS): thêm xoá bình luận/đánh giá — trước đó 2 bảng
 *  này chưa có policy DELETE (sql/3-...sql) nên bị bỏ sót, nay
 *  sql/8-them-auth-va-rls.sql đã mở DELETE theo đúng chủ sở hữu. */
export const xoaToanBoDuLieu = () => {
  ghiNhatKyXoa(HOC_SINH_HIEN_TAI.ma_6_so)
  xoaToanBoLoTrinhCuaHocSinh(HOC_SINH_HIEN_TAI.ma_6_so)
  xoaSachTrangThaiLoTrinh()
  xoaToanBoGoiYCuaHocSinh(HOC_SINH_HIEN_TAI.ma_6_so)
  xoaGhiNhanCuaHocSinh(HOC_SINH_HIEN_TAI.ma_6_so)
  xoaBinhLuanCuaHocSinh(HOC_SINH_HIEN_TAI.ma_6_so)
  xoaDanhGiaCuaHocSinh(HOC_SINH_HIEN_TAI.ma_6_so)

  Object.assign(HOC_SINH_HIEN_TAI, {
    ten_ao: '', tuoi: null, gioi: null, muc_van_dong: null,
    hap_thu_sat: null, hap_thu_kem: null, di_ung: [], di_ung_khac: '',
    kcal_muc_tieu: null, dam_muc_tieu: null, glucid_muc_tieu: null, lipid_muc_tieu: null,
    canxi_muc_tieu: null, sat_muc_tieu: null, kem_muc_tieu: null,
    da_dong_y: false, ngay_dong_y_gan_nhat: null,
  })
  luuHoSo(HOC_SINH_HIEN_TAI)
}

/** Cài đặt — "Liên hệ hỗ trợ". mã 6 số TUỲ CHỌN do người dùng tự gõ (không
 *  phải HOC_SINH_HIEN_TAI.ma_6_so — cố ý, để chỗ cho trường hợp báo hộ
 *  người khác/gõ mã sai không chặn gửi). */
export const guiPhanHoiHoTro = (moTa, maSoTuyChon) => {
  guiPhanHoiHoTroSupabase(moTa, maSoTuyChon)
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

/* --- Bình luận & đánh giá 5 sao theo món — bảng Supabase thật từ
   05/08/2026 (sql/3-tao-bang-moi-khong-nhay-cam.sql). KHÔNG phải dữ liệu
   sức khoẻ (chỉ bình luận/sao món ăn), nên chấp nhận lên Supabase dù chưa
   có auth thật — xem ghi chú đầu file SQL đó. 4 hàm dưới đây ASYNC (khác
   phần lớn api.js) vì tải theo-yêu-cầu từng món khi mở modal, không tải
   trước như Khu vực 4 (101 món tải hết trước là hợp lý, hàng trăm bình
   luận thì không). */

export const layBinhLuan = async (mon_id) => {
  const { data, error } = await supabase
    .from('binh_luan_mon')
    .select('*')
    .eq('ma_mon', mon_id)
    .order('thoi_gian', { ascending: false })
  if (error) { console.error(error); return [] }
  return data.map((b) => ({
    id: b.id, mon_id: b.ma_mon, ten_hien_thi: b.ten_hien_thi,
    noi_dung: b.noi_dung, thoi_gian: b.thoi_gian,
  }))
}

/** Hiển thị tên ảo (ten_ao) của học sinh đang đăng — không phải mã 6 số
 *  hay tên thật, đúng nguyên tắc định danh giả áp dụng toàn hệ thống. */
export const guiBinhLuanMon = async (mon_id, noiDung) => {
  const { error } = await supabase.from('binh_luan_mon').insert({
    ma_mon: mon_id,
    ma_hoc_sinh: HOC_SINH_HIEN_TAI.ma_6_so,
    ten_hien_thi: HOC_SINH_HIEN_TAI.ten_ao || 'Học sinh ẩn danh',
    noi_dung: noiDung,
  })
  if (error) console.error(error)
}

export const layDanhGia = async (mon_id) => {
  const { data, error } = await supabase.from('danh_gia_mon').select('so_sao').eq('ma_mon', mon_id)
  if (error) { console.error(error); return { trung_binh: null, so_luot: 0, sao_cua_toi: null } }
  const soLuot = data.length
  const trungBinh = soLuot > 0 ? data.reduce((t, d) => t + d.so_sao, 0) / soLuot : null

  const { data: saoCuaToi } = await supabase
    .from('danh_gia_mon').select('so_sao')
    .eq('ma_mon', mon_id).eq('ma_hoc_sinh', HOC_SINH_HIEN_TAI.ma_6_so)
    .maybeSingle()

  return { trung_binh: trungBinh, so_luot: soLuot, sao_cua_toi: saoCuaToi?.so_sao ?? null }
}

/** 1 học sinh chỉ 1 lượt/món (UNIQUE ma_mon+ma_hoc_sinh) — gửi lại = SỬA
 *  lượt cũ, không cộng thêm lượt (khớp hành vi mock cũ). */
export const guiDanhGia = async (mon_id, soSao) => {
  const { error } = await supabase.from('danh_gia_mon').upsert(
    { ma_mon: mon_id, ma_hoc_sinh: HOC_SINH_HIEN_TAI.ma_6_so, so_sao: soSao },
    { onConflict: 'ma_mon,ma_hoc_sinh' },
  )
  if (error) console.error(error)
}

/** Cài đặt §3.3.2 — phần trước đây bị "Rút đồng ý & xoá dữ liệu" bỏ sót
 *  (bảng chưa có policy DELETE, xem sql/3-...sql). Nay sql/8-them-auth-va-
 *  rls.sql đã mở DELETE theo đúng ma_hoc_sinh của người gọi, gọi từ
 *  xoaToanBoDuLieu() ở trên. */
const xoaBinhLuanCuaHocSinh = (ma6So) => {
  supabase.from('binh_luan_mon').delete().eq('ma_hoc_sinh', ma6So).then(({ error }) => {
    if (error) console.error(error)
  })
}

const xoaDanhGiaCuaHocSinh = (ma6So) => {
  supabase.from('danh_gia_mon').delete().eq('ma_hoc_sinh', ma6So).then(({ error }) => {
    if (error) console.error(error)
  })
}

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

/* Mọi bữa học sinh vừa ghi nhận THẬT qua "Ăn gì hôm nay" / "Quán ăn gần
   đây" (LICH_SU_GOI_Y_GHI_NHAN, tải thật từ bảng goi_y_ghi_nhan lúc mở app
   + còn nhau khi tải lại trang) — để hai vòng tròn ở Dashboard phản ứng
   đúng khi bạn bấm "Đã ăn món này" ở hai trang đó, đúng tinh thần §3.2:
   "CỘNG dữ liệu 'đã ăn' từ CẢ Khu vực 2 và 3". */
export const layGhiNhanGoiYHomNay = () => {
  const dauNgayHomNay = new Date()
  dauNgayHomNay.setHours(0, 0, 0, 0)

  return LICH_SU_GOI_Y_GHI_NHAN.filter(
    (g) =>
      g.ma_hoc_sinh === HOC_SINH_HIEN_TAI.ma_6_so &&
      new Date(g.thoi_gian_ghi_nhan) >= dauNgayHomNay
  )
}

/* =========================================================================
   TRANG LỘ TRÌNH — Giai đoạn 1–4
   ========================================================================= */

/** Giai đoạn 2 — Màn chờ: chạy tiền kiểm (chỉ còn tầng dị ứng chặn cứng,
 *  xem lib/sinhLoTrinh.js) + sinh khung. Trả về
 *  { khaThi:true, khungMoiBuoi, tongChiDuKien, xemTruoc7Ngay, canhBao } hoặc
 *  { khaThi:false, tang, lyDo }. KHÔNG mutate gì — chỉ tính. */
export const chayTienKiemLoTrinh = (form, rangBuocGhiChu) =>
  chayTienKiemVaSinhLoTrinh(layHoSo(), form, rangBuocGhiChu)

/** Giai đoạn 3 → bấm "Áp dụng" — hậu kiểm (Kế hoạch dự án §4.2): backend
 *  kiểm lại lần cuối, có quyền từ chối lưu. Trong bản demo đồng bộ này,
 *  hậu kiểm chạy lại ĐÚNG hàm tiền kiểm với ĐÚNG input — nên về mặt tất
 *  định sẽ luôn cho cùng kết quả với tiền kiểm (không có khoảng hở lỗi
 *  logic như khi có server thật xử lý bất đồng bộ). Vẫn giữ bước gọi lại
 *  này để đúng kiến trúc "3 lớp bảo vệ" (Kế hoạch dự án §1.1, Nguyên tắc
 *  3) — không bỏ qua bước phủ quyết dù trong demo nó khó thấy tác dụng. */
export const chayHauKiemVaApDung = (form, khungMoiBuoi) => {
  const ketQuaHauKiem = chayTienKiemVaSinhLoTrinh(
    layHoSo(), form, form.rang_buoc_ghi_chu ?? {}
  )
  if (!ketQuaHauKiem.khaThi) return ketQuaHauKiem
  const loTrinhMoi = taoLoTrinhMoi(form, khungMoiBuoi)
  const khungMoiTao = TRANG_THAI.tat_ca_khung.filter((k) => k.lo_trinh_id === loTrinhMoi.id)
  luuLoTrinhMoi(loTrinhMoi, khungMoiTao)
  return { khaThi: true }
}

export const huyLoTrinh = (lyDo) => {
  const idDangHuy = TRANG_THAI.lo_trinh?.id
  huyLoTrinhHienTai(lyDo)
  luuHuyLoTrinh(idDangHuy, lyDo)
}

/** Giai đoạn 4 — ghi nhận một bữa (chọn trong khung, hoặc ăn ngoài kế
 *  hoạch). Gộp "chọn món + xác nhận" làm MỘT hành động, đúng Lộ trình
 *  §6.6 — không có bước tick riêng. */
export const ghiNhanBuaLoTrinh = (dong) => {
  themGhiNhanLoTrinh(dong)
  luuGhiNhan(dong)
}

/** Trang Lộ trình, Giai đoạn 4 — "Hiện 3 món điểm cao nhất TRONG KHUNG",
 *  "Món khác" cuộn qua hạng 4,5,6... (§6.2, §6.4). Dùng lại đúng bộ lọc
 *  ràng buộc cứng của monKhopKhungLoc bên dưới — chỉ khác n = số lấy ra.
 *  Từ Pha 2 (07/08/2026): xếp theo tinhDiem() thật (engine Pha 0) thay vì
 *  sort đạm/giá tạm — mục tiêu 1 bữa tính từ hồ sơ × tỉ lệ buổi thật của
 *  khung (TI_LE_BUA). Món vừa ăn trong <KHOANG_CACH_CHONG_LAP ngày gần đây
 *  (lịch sử ghi nhận thật, không phải mô phỏng) bị đẩy xuống cuối — không
 *  loại hẳn, vì "Món khác" vẫn nên cuộn tới được nếu hết lựa chọn mới.
 *  Ưu tiên không cay nếu khung có ghi chú "tránh cay" (rang_buoc_them). */
export const layMonKhopKhung = (khung, n = 3) => {
  const hoSo = layHoSo()
  const loTrinh = layLoTrinhDangChay()
  const soBua = loTrinh?.cac_buoi_ap_dung?.length
  const tiLe = TI_LE_BUA[soBua]?.[khung.buoi] ?? 0
  const mucTieuBua = mucTieuMotBuaTuHoSo(hoSo, tiLe)
  const lichSuGanDay = layLichSuDaDungTruocNgay(khung.thu_tu_ngay)
  const tranhCay = !!khung.rang_buoc_them?.tranh_cay

  return monKhopKhungLoc(khung)
    .map((m) => ({
      mon: m,
      diem: tinhDiem(m, mucTieuBua.kcal, mucTieuBua.canxi, mucTieuBua.sat, mucTieuBua.kem, THAM_SO_CHUAN),
      vuaAnGanDay: lichSuGanDay.has(m.id) && khung.thu_tu_ngay - lichSuGanDay.get(m.id) < KHOANG_CACH_CHONG_LAP,
      canCay: tranhCay && m.cay,
    }))
    .sort((a, b) => {
      if (a.canCay !== b.canCay) return a.canCay ? 1 : -1
      if (a.vuaAnGanDay !== b.vuaAnGanDay) return a.vuaAnGanDay ? 1 : -1
      return a.diem - b.diem
    })
    .map((x) => x.mon)
    .slice(0, n)
}

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
  const khung = layKhungHomNay()

  // Tình huống 2 — đã ghi nhận bữa hôm nay: hiện trạng thái xác nhận,
  // không còn là gợi ý nữa.
  if (ghiNhan.length > 0) {
    const g = ghiNhan[ghiNhan.length - 1]
    if (g.trang_thai === 'da_an_ngoai_khung') {
      return { tinh_huong: 'da_ghi_nhan_ngoai_khung', mon_tu_ghi: g.mon_tu_ghi }
    }
    // Buổi lấy từ ĐÚNG khung đã ghi nhận (join qua lo_trinh_khung_id) —
    // KHÔNG suy đoán từ mon.buoi (mảng "món này bán buổi nào", có thể
    // gồm nhiều buổi, không phải "đã ăn vào buổi nào" — thêm 29/7 để nuôi
    // thẻ món ở Dashboard Khối 1, xem Dashboard.jsx TheMonBuoiHomNay).
    const khungCuaG = khung.find((k) => k.id === g.lo_trinh_khung_id)
    return { tinh_huong: 'da_ghi_nhan', mon: layMonKemQuan(g.mon_id), buoi: khungCuaG?.buoi }
  }

  // Tình huống 1 — chưa ghi nhận: hiện món hạng 1 khớp khung.
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
/* Pha 2 (07/08/2026) — bỏ kcal_min/kcal_max/dam_min khỏi bộ lọc CỨNG: đây
   là chỉ số CHẤT LƯỢNG (dùng để xếp hạng qua tinhDiem() ở layMonKhopKhung
   bên dưới), không phải điều kiện "chọn được hay không". Giá vẫn lọc cứng
   ở ĐÂY (khác tiền kiểm mô phỏng 7 ngày — xem lib/sinhLoTrinh.js) vì đây là
   Giai đoạn 4 tương tác thật: 0 món trong khung giá thì hiện "Hết món khớp
   khung" (đã có UI ở TheoDoi.jsx), không cần nới giá như mô phỏng nền.

   ⚠ Nguồn/bán kính KHÔNG còn lọc cứng tuyệt đối (sửa cùng đợt rà soát lại
   Pha 2) — dữ liệu Supabase thật hiện có 0 quán `cang_tin`, nếu giữ lọc
   cứng thì bữa TRƯA sẽ VĨNH VIỄN "Hết món khớp khung" ở Giai đoạn 4 (đã
   xác nhận qua Playwright thật trước khi sửa). Ưu tiên đúng nguồn trước,
   nới nếu rỗng — cùng nguyên tắc với lib/sinhLoTrinh.js:monKhopNguonBanKinh
   (tồn kho/dữ liệu, không phải an toàn hay giá). */
function monKhopKhungLoc(khung) {
  const hoSo = layHoSo()

  const quaBuoiGiaDiUng = layTatCaMonKemQuan().filter((m) => {
    if (!m.buoi.includes(khung.buoi)) return false
    if (m.gia === null || m.gia > khung.gia_max) return false
    // Loại trừ cá nhân — bỏ sạch món dính dị ứng TRƯỚC khi xét tiếp
    // (tầng kiểm tra 4, Kế hoạch dự án §4.1). Món CHƯA gắn nhãn dị ứng
    // (thanh_phan_di_ung không phải mảng) coi là KHÔNG AN TOÀN, không suy
    // đoán — xem lib/diUng.js.
    return monAnToanChoDiUng(m, hoSo.di_ung)
  })

  const dungNguon = quaBuoiGiaDiUng.filter((m) => {
    if (khung.nguon === 'cang_tin' && m.quan.loai_hinh !== 'cang_tin') return false
    if (khung.nguon === 'quan_ngoai' && m.quan.loai_hinh !== 'quan_ngoai') return false
    if (khung.ban_kinh_m && m.quan.khoang_cach_m > khung.ban_kinh_m) return false
    return true
  })

  return dungNguon.length > 0 ? dungNguon : quaBuoiGiaDiUng
}

/** Lịch sử món ĐÃ ĂN (ghi nhận thật, trạng_thái = trong khung) của lộ trình
 *  ĐANG CHẠY, tính TRƯỚC ngày đang xét — dùng để đẩy xuống cuối danh sách
 *  món vừa ăn gần đây ở layMonKhopKhung (Task 3 chống lặp, phiên bản Giai
 *  đoạn 4 — test/ chưa có tiền lệ vì chưa từng làm ghi nhận thật, xem ghi
 *  chú đầu lib/sinhLoTrinh.js). Trả về Map(mon_id → ngày ăn gần nhất). */
function layLichSuDaDungTruocNgay(ngayDangXet) {
  const loTrinh = layLoTrinhDangChay()
  if (!loTrinh) return new Map()
  const khungTheoId = new Map(TRANG_THAI.tat_ca_khung.map((k) => [k.id, k]))
  const ketQua = new Map()
  for (const g of TRANG_THAI.ghi_nhan) {
    if (g.trang_thai !== 'da_an_trong_khung' || !g.mon_id) continue
    const khungCuaG = khungTheoId.get(g.lo_trinh_khung_id)
    if (!khungCuaG || khungCuaG.lo_trinh_id !== loTrinh.id) continue
    if (khungCuaG.thu_tu_ngay >= ngayDangXet) continue
    const hienTai = ketQua.get(g.mon_id)
    if (hienTai === undefined || khungCuaG.thu_tu_ngay > hienTai) ketQua.set(g.mon_id, khungCuaG.thu_tu_ngay)
  }
  return ketQua
}

function monHang1KhopKhung(khung) {
  return monKhopKhungLoc(khung)[0] ?? null
}

/* =========================================================================
   GỢI Ý NHANH — Khối 5, tầng nút bấm khuôn mẫu (6 nút)
   §6.1: tầng này KHÔNG cần AI hiểu ngôn ngữ, chạy thẳng hàm chấm điểm
   có sẵn và trả về top 3 món.
   Từ 07/08/2026: dùng engine chấm điểm thật (lib/chamDiem.js + lib/box.js,
   port từ test/) thay vì sort đơn tiêu chí — sửa luôn bug 3 nút trước đó
   rơi vào comparator undefined (goi_y/nhieu_canxi/nhieu_sat không có trong
   bảng sapXep cũ, sort không đúng như nhãn nút ghi). ========================================================================= */

const MA_LOAI_GOI_Y_SANG_BOX = {
  goi_y: 'nhanh',
  re_nhat: 'reNhat',
  nhieu_dam: 'nhieuDam',
  nhieu_canxi: 'nhieuCanxi',
  nhieu_sat: 'nhieuSat',
  nhieu_kem: 'nhieuKem',
}

export const goiYNhanh = (loai) => {
  const hoSo = layHoSo()
  const box = CAU_HINH_BOX[MA_LOAI_GOI_Y_SANG_BOX[loai] ?? 'nhanh']

  const dsXepHang = xepHangMon(layTatCaMonKemQuan(), hoSo, box.thamSo)
  const boiCanh = { nguongGia: null, buoi: buoiHienTai(), diUngDaChon: hoSo.di_ung }
  const dsUngVien = box.locUngVien(dsXepHang, boiCanh)

  let trangThai = taoTrangThaiChon()
  const ketQua = []
  for (let i = 0; i < 3; i++) {
    const luot = box.chon(dsUngVien, trangThai)
    if (luot.ketThuc) break
    ketQua.push(luot.ketQua.mon)
    trangThai = luot.tt
  }
  return ketQua
}

/* =========================================================================
   CHAT AI — Khối 5 thật (Pha 1, 07/08/2026). 3 hàm dưới đây là "tool" mà
   KhoiGoiYNhanh.jsx cho Gemini gọi — port từ test/dieu-phoi-chat.js:chayTool(),
   dùng engine chấm điểm thật (Pha 0) thay vì gọi lại box.js trực tiếp trong
   tool như test/.

   ⚠ KHÔNG tự đọc hồ sơ đã lưu (chốt 03/08/2026 ở test/, giữ nguyên chính
   sách khi port — 07/08/2026 người dùng xác nhận giữ, xem NHAT-KY-AI.md):
   AI phải HỎI dị ứng/nhu cầu trong hội thoại, không tự lấy dữ liệu cá nhân
   gửi cho Gemini (bên thứ ba). Vì vậy luôn chấm điểm theo hồ sơ MẶC ĐỊNH
   (layHoSoMauChat) — hệ quả tất yếu của chính sách đó, không phải quên nối
   hồ sơ thật. */

const TIEU_CHI_SANG_BOX_CHAT = {
  goi_y: 'nhanh',
  gia_toi_da: 'nhanh', // Website chưa port box `gioiHan` riêng — nguongGia đã lọc sẵn trong mọi box
  re_nhat: 'reNhat',
  nhieu_dam: 'nhieuDam',
  nhieu_canxi: 'nhieuCanxi',
  nhieu_sat: 'nhieuSat',
  nhieu_kem: 'nhieuKem',
}
const CAC_BUOI_HOP_LE_CHAT = new Set(['sang', 'trua', 'chieu', 'toi'])
const SO_LUONG_TOI_DA_CHAT = 3

let mucTieuMacDinhChat = null
function layHoSoMauChat() {
  if (!mucTieuMacDinhChat) {
    mucTieuMacDinhChat = tinhMucTieuDinhDuong({ tuoi: 17, gioi: 'nam', muc_van_dong: 'vua', hap_thu_sat: 'trungBinh', hap_thu_kem: 'vua' })
  }
  return mucTieuMacDinhChat
}

function boDauTiengVietChat(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
}

/** Tóm tắt món cho Gemini đọc (KHÔNG gửi nguyên object đầy đủ — đỡ tốn
 *  token, và tránh lộ field nội bộ như sai số/mon_goc_id không cần AI biết).
 *  UI hiện thẻ món dùng object ĐẦY ĐỦ (monList), tách riêng. */
function tomTatMonChoAI(mon) {
  return {
    ten_mon: mon.ten_mon,
    gia: mon.gia,
    quan: mon.quan?.ten_quan ?? null,
    gio_ban: mon.quan?.khoang_gio_hoat_dong ?? null,
  }
}

/** Tool `tim_mon` — bọc `CAU_HINH_BOX` (Pha 0), không sửa logic bên trong.
 *  `maMonDaGoiY`: Set mã món đã gợi ý trong phiên chat này (KhoiGoiYNhanh.jsx
 *  giữ, truyền vào mỗi lượt) — mồi sẵn cho `daHienMon` để "đổi món khác"
 *  không trả lại đúng món cũ. Trả `{ timDuoc, monList, tomTat, lyDo? }` —
 *  `monList` (đầy đủ) cho UI, `tomTat` (rút gọn) gửi lại Gemini. */
export const timMonChat = (thamSo, maMonDaGoiY) => {
  const maBox = TIEU_CHI_SANG_BOX_CHAT[thamSo.tieu_chi]
  if (!maBox) return { timDuoc: false, lyDo: 'Thiếu hoặc sai "tieu_chi".' }
  if (thamSo.tieu_chi === 'gia_toi_da' && !(typeof thamSo.gia_toi_da === 'number' && thamSo.gia_toi_da > 0)) {
    return { timDuoc: false, lyDo: 'Thiếu hoặc sai định dạng giá tối đa — hỏi lại học sinh số tiền cụ thể.' }
  }
  const soLuong = Number.isInteger(thamSo.so_luong) && thamSo.so_luong >= 1 && thamSo.so_luong <= SO_LUONG_TOI_DA_CHAT
    ? thamSo.so_luong : 1

  const box = CAU_HINH_BOX[maBox]
  const quanLoaiTru = new Set(Array.isArray(thamSo.loai_tru_quan) ? thamSo.loai_tru_quan : [])
  const boiCanh = {
    nguongGia: typeof thamSo.gia_toi_da === 'number' ? thamSo.gia_toi_da : null,
    buoi: CAC_BUOI_HOP_LE_CHAT.has(thamSo.buoi) ? thamSo.buoi : (buoiHienTai() || 'trua'),
    diUngDaChon: Array.isArray(thamSo.di_ung) ? thamSo.di_ung : [],
  }

  const dsXepHang = xepHangMon(layTatCaMonKemQuan(), layHoSoMauChat(), box.thamSo)
    .filter((x) => !quanLoaiTru.has(x.mon.quan?.ten_quan))
  const dsHienThi = box.locUngVien(dsXepHang, boiCanh)
  if (dsHienThi.length === 0) return { timDuoc: false, lyDo: box.thongBao.khoRong }

  let trangThai = { ...taoTrangThaiChon(), daHienMon: new Set(maMonDaGoiY) }
  const ketQua = []
  for (let i = 0; i < soLuong; i++) {
    const luot = box.chon(dsHienThi, trangThai)
    if (luot.ketThuc) break
    ketQua.push(luot.ketQua.mon)
    trangThai = luot.tt
  }
  if (ketQua.length === 0) return { timDuoc: false, lyDo: box.thongBao.hetDuLieu || box.thongBao.khoRong }

  return { timDuoc: true, monList: ketQua, tomTat: ketQua.map(tomTatMonChoAI) }
}

/** Tool `tra_cuu_mon_theo_ten` — tìm theo tên/từ khoá, không đi qua box.js
 *  (không phải thao tác xếp hạng). */
export const traCuuMonTheoTen = (thamSo) => {
  const tenTim = typeof thamSo.ten_mon === 'string' ? thamSo.ten_mon.trim() : ''
  if (tenTim === '') return { timDuoc: false, lyDo: 'Thiếu từ khoá/tên món cần tra cứu — hỏi lại học sinh cụ thể hơn.' }

  const quanLoaiTru = new Set(Array.isArray(thamSo.loai_tru_quan) ? thamSo.loai_tru_quan : [])
  const tenChuan = boDauTiengVietChat(tenTim)
  const ketQua = layTatCaMonKemQuan()
    .filter((m) => !quanLoaiTru.has(m.quan?.ten_quan))
    .filter((m) => boDauTiengVietChat(m.ten_mon).includes(tenChuan))
    .slice(0, SO_LUONG_TOI_DA_CHAT)

  if (ketQua.length === 0) return { timDuoc: false, lyDo: `Không tìm thấy món nào khớp "${tenTim}" trong danh sách hiện có.` }

  return {
    timDuoc: true,
    monList: ketQua,
    tomTat: ketQua.map((mon) => ({
      ...tomTatMonChoAI(mon),
      dinh_duong: mon.coDinhDuong
        ? { kcal: mon.kcal, dam_g: mon.dam_g, glucid_g: mon.glucid_g, lipid_g: mon.lipid_g, canxi_mg: mon.canxi_mg, sat_mg: mon.sat_mg, kem_mg: mon.kem_mg }
        : null, // chưa có dữ liệu — KHÔNG trả số 0 gây hiểu lầm
    })),
  }
}

/** Tool `tra_cuu_quan` — gộp món theo quán (dữ liệu vốn có sẵn trên từng
 *  dòng món qua layTatCaMonKemQuan(), chỉ tổng hợp lại). Đơn vị đổi km↔m
 *  giữa tool (km, khớp cách học sinh nói) và dữ liệu Website (m). */
export const traCuuQuan = (thamSo) => {
  const theoQuan = new Map()
  for (const m of layTatCaMonKemQuan()) {
    if (!m.quan) continue
    if (!theoQuan.has(m.quan.id)) theoQuan.set(m.quan.id, { ...m.quan, soMon: 0, monTieuBieu: [] })
    const q = theoQuan.get(m.quan.id)
    q.soMon += 1
    if (q.monTieuBieu.length < SO_LUONG_TOI_DA_CHAT) q.monTieuBieu.push({ ten_mon: m.ten_mon, gia: m.gia })
  }

  const tenTim = typeof thamSo.ten_quan === 'string' ? thamSo.ten_quan.trim() : ''
  const banKinhM = typeof thamSo.trong_ban_kinh_km === 'number' && thamSo.trong_ban_kinh_km > 0
    ? thamSo.trong_ban_kinh_km * 1000 : null

  if (tenTim === '') {
    const ds = [...theoQuan.values()]
    const coKhoangCach = ds.filter((q) => q.khoang_cach_m !== null).sort((a, b) => a.khoang_cach_m - b.khoang_cach_m)
    const chuaKhaoSat = ds.filter((q) => q.khoang_cach_m === null)
    let xep = [...coKhoangCach, ...chuaKhaoSat]
    if (banKinhM !== null) {
      xep = xep.filter((q) => q.khoang_cach_m !== null && q.khoang_cach_m <= banKinhM)
      if (xep.length === 0) return { timDuoc: false, lyDo: `Không có quán nào trong bán kính ${thamSo.trong_ban_kinh_km}km (đã khảo sát khoảng cách).` }
    }
    return {
      timDuoc: true,
      danhSachQuan: xep.map((q) => ({ ten_quan: q.ten_quan, khoang_cach_km: q.khoang_cach_m !== null ? q.khoang_cach_m / 1000 : null })),
    }
  }

  const tenChuan = boDauTiengVietChat(tenTim)
  const ketQua = [...theoQuan.values()].filter((q) => boDauTiengVietChat(q.ten_quan).includes(tenChuan))
  if (ketQua.length === 0) return { timDuoc: false, lyDo: `Không tìm thấy quán nào khớp "${tenTim}" trong hệ thống.` }

  return {
    timDuoc: true,
    quanList: ketQua.map((q) => ({
      ten_quan: q.ten_quan, so_mon: q.soMon, mon_tieu_bieu: q.monTieuBieu,
      khoang_gio_hoat_dong: q.khoang_gio_hoat_dong, ngay_ban_va_nghi: q.ngay_ban_va_nghi,
      khoang_cach_km: q.khoang_cach_m !== null ? q.khoang_cach_m / 1000 : null,
    })),
  }
}

/* =========================================================================
   KHỐI 3 & 4 — bản rút gọn của hai trang duyệt (nay đã dựng — Đợt 2)
   ========================================================================= */

/** Khối 4 & Khu A trang "Ăn gì hôm nay" — món được chọn nhiều nhất trong
 *  7 ngày qua, đếm gộp TOÀN BỘ học sinh, ẩn danh, không cá nhân hoá theo
 *  người đang xem ("Ăn gì hôm nay" §2.1) — COUNT trực tiếp trên
 *  `goi_y_chon_mon_an_danh` (đếm gộp ẩn danh, KHÁC `goi_y_ghi_nhan` cá
 *  nhân bên dưới dù cùng thuộc Khu vực 3 — xem ghi chú đầu sql/5-...sql).
 *
 *  ⚠ Không có ngưỡng số học sinh tối thiểu — đúng như tài liệu mô tả.
 *    Với cỡ mẫu thử nghiệm nhỏ (~30–50 học sinh), khối này có thể phản
 *    ánh lựa chọn của rất ít người trong những ngày đầu — đây là điều đã
 *    được bàn ở buổi trước và nhóm quyết định giữ đúng tài liệu, không tự
 *    thêm ngưỡng ẩn.
 *
 *  Đổi 05/08/2026: đọc bảng Supabase THẬT `goi_y_chon_mon_an_danh` (đếm
 *  gộp toàn trường, THẬT SỰ ẩn danh — không ma_hoc_sinh) thay vì mock 15
 *  học sinh giả trong goiYGhiNhanLichSu.js. ASYNC — nơi gọi (Dashboard,
 *  AnGiHomNay) tự tải qua useEffect, xem ghi chú ở 2 nơi đó. */
export const layDeXuatNoiBat = async (soLuong = 5) => {
  const nguong7NgayTruoc = new Date(Date.now() - 7 * MOT_NGAY_MS).toISOString()
  const { data, error } = await supabase
    .from('goi_y_chon_mon_an_danh')
    .select('ma_mon')
    .gte('thoi_gian_ghi_nhan', nguong7NgayTruoc)
  if (error) { console.error(error); return [] }

  const dem = new Map()
  for (const g of data) dem.set(g.ma_mon, (dem.get(g.ma_mon) ?? 0) + 1)

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

  const dongMoi = {
    id: `gy-${Date.now()}`,
    ma_hoc_sinh: HOC_SINH_HIEN_TAI.ma_6_so,
    mon_id: mon.id,
    nguon: 'tu_chon',
    gia_tai_thoi_diem: mon.gia,
    kcal_tai_thoi_diem: mon.kcal,
    dam_tai_thoi_diem: mon.dam_g,
    glucid_tai_thoi_diem: mon.glucid_g,
    lipid_tai_thoi_diem: mon.lipid_g,
    canxi_tai_thoi_diem: mon.canxi_mg,
    sat_tai_thoi_diem: mon.sat_mg,
    kem_tai_thoi_diem: mon.kem_mg,
    thoi_gian_ghi_nhan: new Date().toISOString(),
  }
  themGoiYGhiNhan(dongMoi)
  luuGoiYGhiNhan(dongMoi)

  // Đếm gộp ẩn danh (nuôi "Đề xuất nổi bật" toàn trường) — ghi CHUYỂN
  // riêng, KHÔNG ma_hoc_sinh (xem ghi chú đầu sql/3-tao-bang-moi...).
  // Không await: đây là số liệu tổng hợp phụ, không nên làm chậm phản hồi
  // "Đã ghi nhận" của chính học sinh đang bấm; lỗi (nếu có) chỉ log, không
  // chặn hành động chính.
  supabase.from('goi_y_chon_mon_an_danh').insert({
    ma_mon: mon.id, tieu_chi: null, nguon: 'tu_chon',
  }).then(({ error }) => { if (error) console.error(error) })

  return { choPhep: true }
}

/* =========================================================================
   TRANG LỊCH SỬ — hợp nhất Khu vực 2 + Khu vực 3, CHỈ ĐỌC + XOÁ
   "Kế hoạch trang Lịch sử" §4 (bảng 5 trường hợp dữ liệu), §6 (nguồn).
   -------------------------------------------------------------------------
   Sửa 29/7 (yêu cầu riêng): bỏ hẳn buoi/buoiSuyDoan khỏi mỗi dòng — trang
   đã hiện thoi_gian_ghi_nhan (giờ:phút thật) nên nhãn buổi suy đoán không
   còn cần thiết (hàm suyBuoiTuGio cũ chỉ phục vụ đúng việc này, đã xoá
   theo). Thêm loai_hinh (căn_tin/quan_ngoai) — nuôi bộ lọc "Loại hình"
   mới ở trang Lịch sử, cùng vốn giá trị với bộ lọc cùng tên ở trang
   "Quán ăn gần đây".
   ========================================================================= */

export const layLichSuHopNhat = () => {
  const { ghiNhan } = layToanBoKhuVuc2()

  // Khu vực 2 — mỗi dòng là 1 bữa (trong lộ trình hoặc ngoài lộ trình).
  const tuLoTrinh = ghiNhan.map((g) => {
    const mon = g.mon_id ? layMonKemQuan(g.mon_id) : null
    return {
      id: g.id,
      xoaNguon: 'lo_trinh',
      nhan: g.trang_thai === 'da_an_trong_khung' ? 'trong_khung' : 'ngoai_ke_hoach',
      ten_mon: mon?.ten_mon ?? g.mon_tu_ghi ?? null,
      ten_quan: mon?.quan?.ten_quan ?? null,
      loai_hinh: mon?.quan?.loai_hinh ?? null,
      gia: g.gia_tai_thoi_diem, kcal: g.kcal_tai_thoi_diem, dam: g.dam_tai_thoi_diem,
      glucid: g.glucid_tai_thoi_diem, lipid: g.lipid_tai_thoi_diem,
      canxi: g.canxi_tai_thoi_diem, sat: g.sat_tai_thoi_diem, kem: g.kem_tai_thoi_diem,
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
        loai_hinh: mon?.quan?.loai_hinh ?? null,
        gia: g.gia_tai_thoi_diem, kcal: g.kcal_tai_thoi_diem, dam: g.dam_tai_thoi_diem,
        glucid: g.glucid_tai_thoi_diem, lipid: g.lipid_tai_thoi_diem,
        canxi: g.canxi_tai_thoi_diem, sat: g.sat_tai_thoi_diem, kem: g.kem_tai_thoi_diem,
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
  if (dong.xoaNguon === 'lo_trinh') {
    xoaMotDongGhiNhanLoTrinh(dong.id)
    xoaGhiNhan(dong.id)
  } else {
    xoaMotDongGoiY(dong.id)
    xoaMotGoiYGhiNhan(dong.id)
  }
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

/** Mốc tham chiếu — CHỈ mục "Lộ trình" mới có (Phần 3.3).
 *  Đổi 29/7 (theo yêu cầu riêng, đi khác quyết định cũ ở #9.1 — tài liệu
 *  cho phép "quyết định khi dựng thật"): TẤT CẢ mốc dinh dưỡng (kcal/đạm/
 *  glucid/lipid/canxi/sắt) giờ lấy THẲNG từ bảng RNI 15–19 tuổi của Hồ sơ
 *  (lib/traBangDinhDuong.js) — KHÔNG còn cộng dồn từ lo_trinh_khung của
 *  lộ trình đang chạy. Ưu điểm: mốc luôn có sẵn (không cần đợi có lộ
 *  trình chạy mới thấy đường mốc), nhất quán với con số mục tiêu đã hiện
 *  ở trang Hồ sơ. Riêng Chi tiêu (tiền, không phải dinh dưỡng, không có
 *  RNI) vẫn PHẢI lấy từ ngân_sách_tuần của lộ trình đang chạy — null nếu
 *  không có lộ trình, vì không có "ngân sách" nào để tham chiếu. */
export const layMocThamChieuLoTrinh = (tabThoiGian) => {
  const hoSo = layHoSo()
  const loTrinh = layLoTrinhDangChay()

  const heSo =
    tabThoiGian === 'ngay' ? 1
    : tabThoiGian === 'tuan' ? 7
    : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()

  return {
    chiPhi: loTrinh ? (loTrinh.ngan_sach_tuan / 7) * heSo : null,
    kcal: hoSo.kcal_muc_tieu * heSo,
    dam: hoSo.dam_muc_tieu * heSo,
    glucid: hoSo.glucid_muc_tieu * heSo,
    lipid: hoSo.lipid_muc_tieu * heSo,
    canxi: hoSo.canxi_muc_tieu * heSo,
    sat: hoSo.sat_muc_tieu * heSo,
    kem: hoSo.kem_muc_tieu * heSo,
  }
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
