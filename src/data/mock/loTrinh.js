/* =========================================================================
   TRẠNG THÁI LỘ TRÌNH SỐNG — nguồn dữ liệu DUY NHẤT cho Khu vực 2
   -------------------------------------------------------------------------
   Khác với các file mock/ khác (dữ liệu tĩnh), file này giữ một trạng thái
   CÓ THỂ THAY ĐỔI trong lúc chạy demo. Ba nơi cùng đọc/ghi vào ĐÚNG một
   trạng thái này:

     • Trang Lộ trình — luồng 4 giai đoạn thật (tạo/huỷ/ghi nhận từng bữa).
     • "Bảng thử nghiệm" trên Dashboard — chọn 1 kịch bản để xem nhanh.
     • Trang Lịch sử — CHỈ ĐỌC, hợp nhất toàn bộ lo_trinh_khung/ghi_nhan
       từng tạo, kể cả của các lộ trình ĐÃ HUỶ/HẾT HẠN.

   Nhờ vậy tạo một lộ trình thật ở trang Lộ trình sẽ lập tức phản ánh đúng
   trên Dashboard VÀ Lịch sử — không cần đồng bộ tay, không có hai "sự
   thật" khác nhau về cùng một lộ trình.

   §2.6 Cơ sở dữ liệu lưu trữ: "Học sinh huỷ lộ trình giữa chừng → giữ lại
   lo_trinh_khung + ghi_nhan đã có (phục vụ phân tích), không xoá vật lý
   trừ khi có yêu cầu xoá riêng." → `tat_ca_khung` và `ghi_nhan` bên dưới
   KHÔNG bị xoá khi huỷ/tạo lộ trình mới — chỉ `lo_trinh` (con trỏ "đang
   chạy") mới đổi. Đây là điểm đã sửa so với bản đầu (từng xoá sạch khi
   tạo lộ trình mới, làm mất lịch sử — phát hiện khi dựng trang Lịch sử).
   ========================================================================= */

import { HOC_SINH_HIEN_TAI } from './hocSinh.js'
import { xayKhungMoiBuoi } from '../../lib/sinhLoTrinh.js'

export const TRANG_THAI = {
  lo_trinh: null,           // lộ trình ĐANG CHẠY hiện tại (hoặc null)
  tat_ca_lo_trinh: [],      // TOÀN BỘ lộ trình từng tạo, kể cả đã huỷ/hết hạn
  tat_ca_khung: [],         // TOÀN BỘ lo_trinh_khung từng tạo (mảng PHẲNG, mọi lộ trình)
  ghi_nhan: [],             // TOÀN BỘ lo_trinh_ghi_nhan từng tạo (mọi lộ trình)
  ghi_nhan_goi_y_demo: [],  // CHỈ phục vụ kịch bản demo (Khu vực 3), xem KICH_BAN bên dưới
}

/** Ngày thứ mấy (1–7) trong lộ trình đang chạy là HÔM NAY — dùng
 *  thu_tu_ngay tương đối theo ngay_bat_dau, đúng cách schema đã "Sửa
 *  24/7" để tránh trùng lặp với ngày tuyệt đối (Kế hoạch trang Lộ trình
 *  §7.1). Trả về null nếu chưa có lộ trình. */
export function thuTuNgayHomNay() {
  if (!TRANG_THAI.lo_trinh) return null
  const batDau = new Date(TRANG_THAI.lo_trinh.ngay_bat_dau)
  batDau.setHours(0, 0, 0, 0)
  const homNay = new Date()
  homNay.setHours(0, 0, 0, 0)
  const soNgay = Math.round((homNay - batDau) / (24 * 60 * 60 * 1000)) + 1
  return Math.min(Math.max(soNgay, 1), 7)
}

/** Khung của lộ trình ĐANG CHẠY, gộp theo ngày — dùng cho Giai đoạn 3
 *  (Xem lộ trình) và Giai đoạn 4 (Theo dõi). */
export function khungTheoNgayCuaLoTrinhHienTai() {
  if (!TRANG_THAI.lo_trinh) return []
  const cuaLoTrinhNay = TRANG_THAI.tat_ca_khung.filter((k) => k.lo_trinh_id === TRANG_THAI.lo_trinh.id)
  const theoNgay = new Map()
  for (const k of cuaLoTrinhNay) {
    if (!theoNgay.has(k.thu_tu_ngay)) theoNgay.set(k.thu_tu_ngay, [])
    theoNgay.get(k.thu_tu_ngay).push(k)
  }
  return [...theoNgay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([thu_tu_ngay, cac_khung]) => ({ thu_tu_ngay, cac_khung }))
}

function taoKhungPhang(loTrinhId, form, khungMoiBuoi) {
  const ketQua = []
  for (let ngay = 1; ngay <= 7; ngay++) {
    for (const buoi of form.cac_buoi_ap_dung) {
      ketQua.push({
        id: `${loTrinhId}-n${ngay}-${buoi}`,
        lo_trinh_id: loTrinhId,
        thu_tu_ngay: ngay,
        ...khungMoiBuoi[buoi],
        rang_buoc_them: form.rang_buoc_ghi_chu ?? {},
      })
    }
  }
  return ketQua
}

/* =========================================================================
   Các hàm mutate — Kế hoạch trang Lộ trình gọi qua src/data/api.js
   ========================================================================= */

/** Bước 4 (hậu kiểm qua) — Áp dụng lộ trình: tạo 1 dòng lo_trinh + tối đa
 *  28 dòng lo_trinh_khung. Lộ trình/khung CŨ (nếu có, đã huỷ trước đó)
 *  vẫn còn nguyên trong tat_ca_lo_trinh/tat_ca_khung — không bị ghi đè. */
export function taoLoTrinhMoi(form, khungMoiBuoi) {
  const id = `lt-${Date.now()}`
  const homNay = new Date()

  const loTrinhMoi = {
    id,
    ma_hoc_sinh: HOC_SINH_HIEN_TAI.ma_6_so,
    tao_luc: homNay.toISOString(),
    ngay_bat_dau: homNay.toISOString().slice(0, 10),
    ngan_sach_tuan: form.ngan_sach_tuan,
    muc_dich: form.muc_dich,
    cac_buoi_ap_dung: form.cac_buoi_ap_dung,
    trang_thai: 'dang_chay',
    ly_do_huy: null,
  }

  TRANG_THAI.lo_trinh = loTrinhMoi
  TRANG_THAI.tat_ca_lo_trinh.push(loTrinhMoi)
  TRANG_THAI.tat_ca_khung.push(...taoKhungPhang(id, form, khungMoiBuoi))
  return loTrinhMoi
}

/** §2.6: huỷ giữa chừng → đổi trang_thai = da_huy, GIỮ LẠI khung + ghi_nhan
 *  đã có (phục vụ Lịch sử/phân tích). "Một lộ trình tại một thời điểm"
 *  (§2.2 Kế hoạch dự án) có hiệu lực ngay: dọn con trỏ "đang chạy" về
 *  null, không xoá gì trong tat_ca_khung/ghi_nhan. */
export function huyLoTrinhHienTai(lyDo) {
  if (TRANG_THAI.lo_trinh) {
    const i = TRANG_THAI.tat_ca_lo_trinh.findIndex((l) => l.id === TRANG_THAI.lo_trinh.id)
    if (i >= 0) {
      TRANG_THAI.tat_ca_lo_trinh[i] = { ...TRANG_THAI.tat_ca_lo_trinh[i], trang_thai: 'da_huy', ly_do_huy: lyDo ?? null }
    }
  }
  TRANG_THAI.lo_trinh = null
}

export function themGhiNhanLoTrinh(dong) {
  TRANG_THAI.ghi_nhan.push(dong)
}

/** Trang Phân tích, Phần 3.4: mỗi lộ trình cố định 7 ngày kể từ
 *  ngay_bat_dau (đúng vòng lặp `for (ngay = 1; ngay <= 7; ngay++)` khi sinh
 *  khung — xem taoKhungPhang bên dưới). Trả về true nếu CÓ ÍT NHẤT một lộ
 *  trình (kể cả đã huỷ/hết hạn — §3.1 "đang hoặc đã từng có lộ trình chạy")
 *  giao với [batDauKhoang, ketThucKhoang). Dùng để phân biệt "0 vì không
 *  ăn gì" với "0 vì không có lộ trình nào chạy" (không vẽ cột ở TH sau). */
export function coLoTrinhTrongKhoang(batDauKhoang, ketThucKhoang) {
  return TRANG_THAI.tat_ca_lo_trinh.some((lt) => {
    const batDau = new Date(lt.ngay_bat_dau); batDau.setHours(0, 0, 0, 0)
    const ketThuc = new Date(batDau); ketThuc.setDate(ketThuc.getDate() + 7)
    return batDau < ketThucKhoang && ketThuc > batDauKhoang
  })
}

/** Lịch sử §5 — xoá THẬT một dòng khỏi bảng gốc. Đồng bộ tự động với
 *  trang Theo dõi vì cả hai đọc CHUNG mảng ghi_nhan này (không cần logic
 *  đồng bộ riêng — xoá xong, ô bữa tương ứng tự quay về "chưa ăn"). */
export function xoaMotDongGhiNhanLoTrinh(id) {
  const i = TRANG_THAI.ghi_nhan.findIndex((g) => g.id === id)
  if (i >= 0) TRANG_THAI.ghi_nhan.splice(i, 1)
}

/** Toàn bộ dữ liệu Khu vực 2 (mọi lộ trình, kể cả đã huỷ/hết hạn) — chỉ
 *  đọc, phục vụ trang Lịch sử. */
export function layToanBoKhuVuc2() {
  return {
    tatCaLoTrinh: TRANG_THAI.tat_ca_lo_trinh,
    tatCaKhung: TRANG_THAI.tat_ca_khung,
    ghiNhan: TRANG_THAI.ghi_nhan,
  }
}

/* =========================================================================
   KỊCH BẢN DEMO — nạp cho "Bảng thử nghiệm" trên Dashboard (sẽ gỡ trước
   khi dùng thật). Mỗi lần chọn kịch bản = XOÁ SẠCH trạng thái rồi dựng lại
   từ đầu (khác luồng thật — luồng thật LUÔN giữ lịch sử). Điều này giữ
   Bảng thử nghiệm dễ đoán: chọn kịch bản nào, thấy đúng kịch bản đó, không
   cộng dồn qua các lần bấm thử trước.
   ========================================================================= */

const FORM_DEMO = {
  ngan_sach_tuan: 420000,
  muc_dich: 'du_chat_trong_ngan_sach',
  cac_buoi_ap_dung: ['trua', 'toi'],
}

function xoaSachTrangThai() {
  TRANG_THAI.lo_trinh = null
  TRANG_THAI.tat_ca_lo_trinh = []
  TRANG_THAI.tat_ca_khung = []
  TRANG_THAI.ghi_nhan = []
  TRANG_THAI.ghi_nhan_goi_y_demo = []
}

function napLoTrinhDemo() {
  xoaSachTrangThai()
  const { khungMoiBuoi } = xayKhungMoiBuoi(HOC_SINH_HIEN_TAI, FORM_DEMO)
  taoLoTrinhMoi(FORM_DEMO, khungMoiBuoi)
  // Lùi ngày bắt đầu 2 hôm để hôm nay rơi vào "Ngày 3" — giống một lộ
  // trình đã chạy được vài hôm, chỉ để demo nhìn tự nhiên hơn.
  const luiLai = new Date()
  luiLai.setDate(luiLai.getDate() - 2)
  TRANG_THAI.lo_trinh.ngay_bat_dau = luiLai.toISOString().slice(0, 10)
  const i = TRANG_THAI.tat_ca_lo_trinh.findIndex((l) => l.id === TRANG_THAI.lo_trinh.id)
  if (i >= 0) TRANG_THAI.tat_ca_lo_trinh[i] = { ...TRANG_THAI.tat_ca_lo_trinh[i], ngay_bat_dau: TRANG_THAI.lo_trinh.ngay_bat_dau }
}

function khungHomNayCuaBuoi(buoi) {
  const thuTu = thuTuNgayHomNay()
  return TRANG_THAI.tat_ca_khung.find(
    (k) => k.lo_trinh_id === TRANG_THAI.lo_trinh.id && k.thu_tu_ngay === thuTu && k.buoi === buoi
  )
}

export const KICH_BAN = {
  khong_co_lo_trinh: {
    nhan: 'Chưa có lộ trình · Khối 1 ẩn hoàn toàn',
    ap: () => xoaSachTrangThai(),
  },
  co_lo_trinh_chua_an: {
    nhan: 'Có lộ trình · chưa ghi nhận bữa nào hôm nay',
    ap: () => napLoTrinhDemo(),
  },
  da_an_trong_khung: {
    nhan: 'Đã ăn trưa · trong lộ trình',
    ap: () => {
      napLoTrinhDemo()
      const k = khungHomNayCuaBuoi('trua')
      if (k) {
        themGhiNhanLoTrinh({
          id: 'gn-demo-01', lo_trinh_khung_id: k.id,
          trang_thai: 'da_an_trong_khung', mon_id: 'm06', mon_tu_ghi: null,
          gia_tai_thoi_diem: 32000, kcal_tai_thoi_diem: 720, dam_tai_thoi_diem: 33,
          canxi_tai_thoi_diem: 45, sat_tai_thoi_diem: 2.4, so_lan_bam_mon_khac: 1,
          thoi_gian_ghi_nhan: new Date().toISOString(),
        })
      }
    },
  },
  da_an_ngoai_ke_hoach: {
    nhan: 'Đã ăn trưa · ngoài lộ trình',
    ap: () => {
      napLoTrinhDemo()
      const k = khungHomNayCuaBuoi('trua')
      if (k) {
        themGhiNhanLoTrinh({
          id: 'gn-demo-02', lo_trinh_khung_id: k.id,
          trang_thai: 'da_an_ngoai_khung', mon_id: null, mon_tu_ghi: 'Mì gói với bạn cùng phòng',
          gia_tai_thoi_diem: null, kcal_tai_thoi_diem: null, dam_tai_thoi_diem: null,
          canxi_tai_thoi_diem: null, sat_tai_thoi_diem: null, so_lan_bam_mon_khac: 0,
          thoi_gian_ghi_nhan: new Date().toISOString(),
        })
      }
    },
  },
  co_them_goi_y_nhanh: {
    nhan: 'Ăn trưa trong lộ trình + 1 bữa qua Gợi ý nhanh',
    ap: () => {
      napLoTrinhDemo()
      const k = khungHomNayCuaBuoi('trua')
      if (k) {
        themGhiNhanLoTrinh({
          id: 'gn-demo-03', lo_trinh_khung_id: k.id,
          trang_thai: 'da_an_trong_khung', mon_id: 'm06', mon_tu_ghi: null,
          gia_tai_thoi_diem: 32000, kcal_tai_thoi_diem: 720, dam_tai_thoi_diem: 33,
          canxi_tai_thoi_diem: 45, sat_tai_thoi_diem: 2.4, so_lan_bam_mon_khac: 0,
          thoi_gian_ghi_nhan: new Date().toISOString(),
        })
      }
      TRANG_THAI.ghi_nhan_goi_y_demo = [{
        id: 'gy-demo-01', ma_hoc_sinh: HOC_SINH_HIEN_TAI.ma_6_so, mon_id: 'm07',
        nguon: 'goi_y_nhanh', gia_tai_thoi_diem: 20000, kcal_tai_thoi_diem: 420,
        dam_tai_thoi_diem: 17, canxi_tai_thoi_diem: 65, sat_tai_thoi_diem: 2.3,
        thoi_gian_ghi_nhan: new Date().toISOString(),
      }]
    },
  },
}

export const KICH_BAN_MAC_DINH = 'da_an_trong_khung'

export function apKichBanVaoTrangThai(ten) {
  KICH_BAN[ten]?.ap()
}

/** Cài đặt §3.3.2 — "xoá TOÀN BỘ dữ liệu": bản demo chỉ có MỘT học sinh
 *  "hiện tại", nên toàn bộ TRANG_THAI vốn đã chỉ thuộc về người đó — xoá
 *  sạch không cần lọc theo mã. */
export function xoaSachTrangThaiLoTrinh() {
  xoaSachTrangThai()
}
