/* =========================================================================
   KHU VỰC 4 THẬT — tải mon_an/dinh_duong_mon_an/quan_an từ Supabase, JOIN,
   chuyển đổi sang ĐÚNG hình dạng mà Website/src/pages,components đang dùng
   (id/quan_id/ten_mon/gia/kcal/dam_g/canxi_mg/sat_mg/kem_mg/glucid_g/
   lipid_g/các cột sai_so/thanh_phan_di_ung/buoi/cay/anh_url cho món; id/ten_quan/
   loai_hinh/dia_chi/khoang_cach_m/khoang_gio_hoat_dong/ngay_ban_va_nghi/
   so_dien_thoai/anh_url cho quán) — KHÔNG sửa gì ở src/pages hay
   src/components, đúng nguyên tắc "một lớp thay thế duy nhất" ở đầu api.js.

   Cùng bộ an toàn đã dùng ở test/du-lieu.js: xin count:'exact' để phát
   hiện bị cắt bớt, và Promise.race với hạn chót mạng.
   -------------------------------------------------------------------------
   3 lệch hình dạng cần chuyển đổi, không phải suy đoán — đọc code thật
   trước khi viết:

   1. buổi: mon_an.buoi hiện TOÀN NULL trên dữ liệu thật (chưa khảo sát).
      Trả buoi:[] sẽ làm mọi bộ lọc `.includes(buoi)` loại sạch món này ở
      MỌI buổi — hỏng cả trang. Suy ra buổi từ giờ mở quán, giống hệt công
      thức đã dùng ở test/buoi.js (khoảng giao giữa ca bán và khung giờ
      buổi) — quán CHƯA có giờ (gio_mo_1 null) thì buoi:[] thật (không suy
      diễn bừa), món đó tự bị đẩy khỏi lọc buổi nhưng vẫn hiện khi lọc
      "Tất cả".

   2. dị ứng: 66/101 món CHƯA gắn nhãn (thanh_phan_di_ung NULL) — giữ
      NGUYÊN null (không ép về [], sẽ biến "chưa kiểm" thành "đã kiểm
      sạch", sai an toàn). lib/diUng.js (thêm cùng đợt) xử lý null đúng
      luật "chưa kiểm = không an toàn khi có dị ứng đã chọn".

   3. mon_goc_id: Supabase mon_an.mon_goc là TÊN NGUYÊN LIỆU tự do (vd
      "Mực", "Nui") — KHÔNG PHẢI id nhóm biến thể món như mock cũ
      (g01..g16, nhóm "Cơm tấm sườn"/"Cơm tấm sườn trứng"/... vào 1 mã).
      Dùng thẳng chuỗi này làm khoá chống-lặp "món gốc" ở sinhLoTrinh.js —
      ý nghĩa lệch nhẹ (chống lặp theo NGUYÊN LIỆU thay vì theo BIẾN THỂ
      MÓN cụ thể) nhưng là proxy tốt nhất có trong dữ liệu thật hiện có.

   Từ 12/08/2026 (đề xuất quán/món từ học sinh): chỉ xin mon_an có
   trang_thai_duyet='da_duyet' — món học sinh vừa gửi (mặc định
   'cho_duyet', xem sql/10-...sql) lọc ngay ở nguồn, KHÔNG rơi vào
   DANH_SACH_MON cho tới khi có người duyệt tay trong Supabase Table
   Editor. Quán KHÔNG lọc ở đây (vẫn xin hết, kể cả quán chỉ có món chưa
   duyệt) — quán "hiện ra" được suy tại CongDuLieu.jsx từ việc có ≥1 món đã
   duyệt thuộc về nó, không phải từ một cờ riêng trên quan_an. */

import { supabase, GIOI_HAN_DONG, THOI_GIAN_CHO_TOI_DA_MS } from './client.js'

const TEN_BANG_MON_AN = 'mon_an'
const TEN_BANG_DINH_DUONG = 'dinh_duong_mon_an'
const TEN_BANG_QUAN_AN = 'quan_an'

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

function khoangGiaoNhau(aBatDau, aKetThuc, bBatDau, bKetThuc) {
  return aBatDau < bKetThuc && bBatDau < aKetThuc
}

/* Ca "vắt qua nửa đêm" (giờ đóng < giờ mở, vd 18:00 → 01:00) tách thành 2
   đoạn trong cùng ngày rồi kiểm giao từng đoạn — y hệt test/buoi.js. */
function caCoBanBuoi(gioMo, gioDong, khung) {
  if (!gioMo || !gioDong) return false
  const moP = raPhut(gioMo.slice(0, 5))
  const dongP = raPhut(gioDong.slice(0, 5))
  const batDauKhung = raPhut(khung.batDau)
  const ketThucKhung = raPhut(khung.ketThuc)
  if (dongP > moP) return khoangGiaoNhau(moP, dongP, batDauKhung, ketThucKhung)
  return khoangGiaoNhau(moP, 1440, batDauKhung, ketThucKhung)
      || khoangGiaoNhau(0, dongP, batDauKhung, ketThucKhung)
}

function buoiKhopQuan(q) {
  return Object.keys(KHUNG_GIO_BUOI).filter((buoi) => {
    const khung = KHUNG_GIO_BUOI[buoi]
    return caCoBanBuoi(q.gio_mo_1, q.gio_dong_1, khung) || caCoBanBuoi(q.gio_mo_2, q.gio_dong_2, khung)
  })
}

/* Giá lưu dạng chữ kiểu "30k" — cùng công thức test/du-lieu.js:tachSoGia.
   null nếu không đọc được số (KHÔNG mặc định 0 — 0đ dễ hiểu nhầm miễn phí). */
function tachSoGia(chuoiGia) {
  if (chuoiGia === null || chuoiGia === undefined) return null
  const so = parseFloat(String(chuoiGia).replace(/[^\d.]/g, ''))
  return Number.isFinite(so) ? Math.round(so * 1000) : null
}

function dinhDangGio(hhmmss) {
  return hhmmss ? hhmmss.slice(0, 5) : null
}

function khoangGioHoatDong(q) {
  const ca1 = dinhDangGio(q.gio_mo_1) && dinhDangGio(q.gio_dong_1)
    ? `${dinhDangGio(q.gio_mo_1)} – ${dinhDangGio(q.gio_dong_1)}` : null
  const ca2 = dinhDangGio(q.gio_mo_2) && dinhDangGio(q.gio_dong_2)
    ? `${dinhDangGio(q.gio_mo_2)} – ${dinhDangGio(q.gio_dong_2)}` : null
  if (ca1 && ca2) return `${ca1} · ${ca2}`
  if (ca1) return ca1
  return null // chưa có giờ khảo sát — KHÔNG bịa "Cả ngày"
}

function ngayBanVaNghi(q) {
  return q.ngay_nghi ? `Nghỉ ${q.ngay_nghi}` : null // null = chưa khảo sát, KHÔNG suy diễn "Cả tuần"
}

function kiemTraDayDu(ketQua, tenBang) {
  if (ketQua.error) {
    console.error(ketQua.error)
    return `Không tải được dữ liệu từ Supabase (bảng "${tenBang}"): ${ketQua.error.message}`
  }
  if (typeof ketQua.count === 'number' && ketQua.data.length < ketQua.count) {
    return `Bảng "${tenBang}" có ${ketQua.count} dòng nhưng chỉ tải về được ${ketQua.data.length} — dữ liệu bị cắt bớt. Cần nới GIOI_HAN_DONG (client.js) trước khi dùng tiếp.`
  }
  return null
}

/** Tải + JOIN 3 bảng Khu vực 4 thật. Trả { ok:true, mon, quan } hoặc
 *  { ok:false, loi }. KHÔNG mutate gì — nơi gọi (App.jsx) tự quyết định
 *  ghi vào đâu. */
export async function taiKhoVi4() {
  let ketQuaMonAn, ketQuaDinhDuong, ketQuaQuan
  let idHetGio
  try {
    const hetGio = new Promise((_, tuChoi) => {
      idHetGio = setTimeout(
        () => tuChoi(new Error(`Không phản hồi sau ${THOI_GIAN_CHO_TOI_DA_MS / 1000}s`)),
        THOI_GIAN_CHO_TOI_DA_MS,
      )
    })
    ;[ketQuaMonAn, ketQuaDinhDuong, ketQuaQuan] = await Promise.race([
      Promise.all([
        supabase.from(TEN_BANG_MON_AN).select('*', { count: 'exact' }).eq('trang_thai_duyet', 'da_duyet').limit(GIOI_HAN_DONG),
        supabase.from(TEN_BANG_DINH_DUONG).select('*', { count: 'exact' }).limit(GIOI_HAN_DONG),
        supabase.from(TEN_BANG_QUAN_AN).select('*', { count: 'exact' }).limit(GIOI_HAN_DONG),
      ]),
      hetGio,
    ])
    clearTimeout(idHetGio)
  } catch (err) {
    clearTimeout(idHetGio)
    console.error(err)
    return { ok: false, loi: `Không tải được dữ liệu — lỗi mạng hoặc mạng quá chậm. Kiểm tra kết nối rồi thử lại. Chi tiết: ${err.message}` }
  }

  const loiMonAn = kiemTraDayDu(ketQuaMonAn, TEN_BANG_MON_AN)
  if (loiMonAn) return { ok: false, loi: loiMonAn }
  const loiDinhDuong = kiemTraDayDu(ketQuaDinhDuong, TEN_BANG_DINH_DUONG)
  if (loiDinhDuong) return { ok: false, loi: loiDinhDuong }
  const loiQuan = kiemTraDayDu(ketQuaQuan, TEN_BANG_QUAN_AN)
  if (loiQuan) return { ok: false, loi: loiQuan }

  const mapDinhDuong = new Map(ketQuaDinhDuong.data.map((d) => [d.ma_dinh_duong, d]))
  const mapQuan = new Map(ketQuaQuan.data.map((q) => [q.ma_quan, q]))

  const quan = ketQuaQuan.data.map((q) => ({
    id: q.ma_quan,
    ten_quan: q.ten_quan,
    loai_hinh: q.loai_hinh,
    dia_chi: q.dia_chi,
    // Thêm 10/08/2026 — CongDuLieu.jsx lọc mon/quan theo đúng khu vực
    // trường học của hồ sơ TRƯỚC khi đổ vào DANH_SACH_MON/QUAN (điểm lọc
    // DUY NHẤT cho cả app, xem sql/9-tao-bang-truong-hoc.sql). null = quán
    // chưa gắn trường — bị loại khỏi MỌI học sinh, không suy đoán.
    truong_hoc: q.truong_hoc,
    khoang_cach_m: typeof q.khoang_cach_km === 'number' ? Math.round(q.khoang_cach_km * 1000) : null,
    khoang_gio_hoat_dong: khoangGioHoatDong(q),
    ngay_ban_va_nghi: ngayBanVaNghi(q),
    so_dien_thoai: q.so_dien_thoai,
    anh_url: q.anh_url,
  }))

  const mon = ketQuaMonAn.data.map((m) => {
    const dd = m.ma_dinh_duong ? mapDinhDuong.get(m.ma_dinh_duong) : undefined
    const q = m.ma_quan ? mapQuan.get(m.ma_quan) : undefined
    return {
      id: m.ma_mon,
      quan_id: m.ma_quan,
      mon_goc_id: m.mon_goc, // xem ghi chú #3 đầu file — proxy theo nguyên liệu, không phải nhóm biến thể
      // 2 field dưới thêm 07/08/2026 cho lib/box.js (đợt thay engine chấm
      // điểm gợi ý nhanh) — ma_dinh_duong để chặn trùng theo mã dinh dưỡng,
      // coDinhDuong để box "nhiều đạm/canxi/sắt/kẽm" loại đúng món CHƯA khớp
      // dinh dưỡng thay vì hiểu nhầm 0 (fallback dưới) là "0 thật".
      ma_dinh_duong: m.ma_dinh_duong,
      coDinhDuong: !!dd,
      ten_mon: m.ten_mon,
      gia: tachSoGia(m.gia_nghin_vnd),
      kcal: dd ? Number(dd.nang_luong_kcal) || 0 : 0,
      sai_so_kcal: dd ? dd.sai_so_kcal : null,
      dam_g: dd ? Number(dd.chat_dam_g) || 0 : 0,
      sai_so_dam: dd ? dd.sai_so_dam : null,
      canxi_mg: dd ? Number(dd.canxi_mg) || 0 : 0,
      sai_so_canxi: dd ? dd.sai_so_canxi : null,
      sat_mg: dd ? Number(dd.sat_mg) || 0 : 0,
      sai_so_sat: dd ? dd.sai_so_sat : null,
      kem_mg: dd ? Number(dd.kem_mg) || 0 : 0,
      sai_so_kem: dd ? dd.sai_so_kem : null,
      glucid_g: dd ? Number(dd.chat_duong_g) || 0 : 0,
      sai_so_glucid: dd ? dd.sai_so_duong : null,
      lipid_g: dd ? Number(dd.chat_beo_g) || 0 : 0,
      sai_so_lipid: dd ? dd.sai_so_beo : null,
      // KHÔNG ép về [] — null nghĩa là CHƯA gắn nhãn, khác [] (đã kiểm,
      // sạch). Xem lib/diUng.js.
      thanh_phan_di_ung: m.thanh_phan_di_ung,
      buoi: q ? buoiKhopQuan(q) : [],
      cay: m.cay === true, // NULL (chưa khảo sát) -> false, mặc định an toàn nhất hiện có — KHÔNG suy đoán cay
      anh_url: m.anh_url,
      // Thêm 07/08/2026 cho lib/buoi.js:quanNghiHomNay() — giá trị THÔ để so
      // sánh được (ngayBanVaNghi() ở trên chỉ ra chuỗi hiển thị, không so
      // sánh được). null = chưa khảo sát, KHÔNG loại (khác có nghỉ thật).
      ngay_nghi: q ? q.ngay_nghi : null,
    }
  })

  return { ok: true, mon, quan }
}
