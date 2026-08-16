/* =========================================================================
   KHU VỰC 1 THẬT — bảng `hoc_sinh` trên Supabase (sql/4-tao-bang-ho-so-va-
   lo-trinh.sql). Thay thế src/data/mock/hocSinh.js khi CongDuLieu.jsx gọi
   taiHoacTaoHoSo() lúc mở app — mutate HOC_SINH_HIEN_TAI TẠI CHỖ (giống
   cách khoVi4.js mutate DANH_SACH_MON), nhờ vậy các hàm sync có sẵn trong
   api.js không cần sửa gì.

   Từ 07/08/2026 (đợt RLS, sql/8-them-auth-va-rls.sql): danh tính THẬT là
   auth_id (Supabase Anonymous Auth, auth.uid() có JWT ký — xem
   khoXacThuc.js), không còn là ma_6_so tự xưng trong localStorage nữa.
   ma_6_so vẫn giữ nguyên làm BÍ DANH HIỂN THỊ (R-13, ở Cài đặt) — chỉ
   không còn là ranh giới bảo mật. Đổi trình duyệt/xoá dữ liệu trình duyệt
   = mất phiên ẩn danh cũ = coi như học sinh mới (đúng hành vi cũ, không
   phải hồi quy — Supabase Anonymous Auth không cho đăng nhập lại một
   danh tính ẩn danh đã mất phiên). */

import { supabase, THOI_GIAN_CHO_TOI_DA_MS } from './client.js'

function sinhMa6So() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function timeoutSauMs(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Hết thời gian chờ Supabase (hồ sơ).')), ms)
  })
}

/** Lấy đúng dòng hoc_sinh của phiên đăng nhập ẩn danh này (qua auth_id =
 *  uid), tạo mới (sinh ma_6_so làm bí danh) nếu chưa từng có — dùng
 *  hoSoMacDinh (thường là HOC_SINH_HIEN_TAI hiện tại, giữ nguyên các giá
 *  trị demo) làm giá trị khởi tạo. Trả về { ok:true, hoSo } hoặc
 *  { ok:false, loi }.
 *
 *  ⚠ React StrictMode (main.jsx) cố ý gọi effect 2 lần lúc DEV — hàm này
 *  có thể được gọi 2 LẦN GẦN NHƯ ĐỒNG THỜI cho cùng một uid (xem lịch sử
 *  bug tương tự với ma_6_so trước khi có auth thật). Coi lỗi trùng khoá
 *  (auth_id là UNIQUE) ở bước INSERT là "đã có, không phải lỗi" — đọc lại
 *  thay vì báo lỗi. */
export async function taiHoacTaoHoSo(hoSoMacDinh, uid) {
  try {
    const { data, error } = await Promise.race([
      supabase.from('hoc_sinh').select('*').eq('auth_id', uid).maybeSingle(),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (error) return { ok: false, loi: `Không tải được hồ sơ: ${error.message}` }
    if (data) return { ok: true, hoSo: chuyenTuHang(data) }

    const ma6So = sinhMa6So()
    const hangMoi = {
      id: `hs-${ma6So}`,
      ma_6_so: ma6So,
      auth_id: uid,
      ten_ao: hoSoMacDinh.ten_ao ?? '',
      tuoi: hoSoMacDinh.tuoi ?? null,
      gioi: hoSoMacDinh.gioi ?? null,
      muc_van_dong: hoSoMacDinh.muc_van_dong ?? null,
      hap_thu_sat: hoSoMacDinh.hap_thu_sat ?? null,
      hap_thu_kem: hoSoMacDinh.hap_thu_kem ?? null,
      di_ung: hoSoMacDinh.di_ung ?? [],
      di_ung_khac: hoSoMacDinh.di_ung_khac ?? '',
      kcal_muc_tieu: hoSoMacDinh.kcal_muc_tieu ?? null,
      dam_muc_tieu: hoSoMacDinh.dam_muc_tieu ?? null,
      glucid_muc_tieu: hoSoMacDinh.glucid_muc_tieu ?? null,
      lipid_muc_tieu: hoSoMacDinh.lipid_muc_tieu ?? null,
      canxi_muc_tieu: hoSoMacDinh.canxi_muc_tieu ?? null,
      sat_muc_tieu: hoSoMacDinh.sat_muc_tieu ?? null,
      kem_muc_tieu: hoSoMacDinh.kem_muc_tieu ?? null,
      da_dong_y: false,
      ngay_dong_y_gan_nhat: null,
    }

    const { data: hangTao, error: loiTao } = await Promise.race([
      supabase.from('hoc_sinh').insert(hangMoi).select().single(),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (loiTao) {
      // Mã lỗi Postgres 23505 = trùng khoá (auth_id là UNIQUE) — lần gọi
      // song song kia (StrictMode) đã insert xong trước. KHÔNG phải lỗi
      // thật, đọc lại dòng vừa được tạo.
      if (loiTao.code === '23505') {
        const { data: hangCu, error: e2 } = await Promise.race([
          supabase.from('hoc_sinh').select('*').eq('auth_id', uid).maybeSingle(),
          timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
        ])
        if (e2 || !hangCu) return { ok: false, loi: `Không tải được hồ sơ sau xung đột: ${e2?.message ?? 'không tìm thấy'}` }
        return { ok: true, hoSo: chuyenTuHang(hangCu) }
      }
      return { ok: false, loi: `Không tạo được hồ sơ mới: ${loiTao.message}` }
    }

    return { ok: true, hoSo: chuyenTuHang(hangTao) }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}

function chuyenTuHang(hang) {
  return { ...hang }
}

/** Trang Hồ sơ/Cài đặt gọi sau khi HOC_SINH_HIEN_TAI đã đổi tại chỗ — ghi
 *  đè NGUYÊN DÒNG lên Supabase. Trả { ok, loi } nhưng phần lớn nơi gọi vẫn
 *  CỐ TÌNH không await (fire-and-forget): lỗi mạng ở đây không nên chặn
 *  thao tác đang làm trên giao diện cho các lượt lưu hồ sơ thường ngày —
 *  chỉ log lại, người dùng vẫn thấy thay đổi cục bộ ngay lập tức. Ngoại lệ
 *  DUY NHẤT: xoaToanBoDuLieu() (api.js) — đây là bước cuối của "xoá toàn
 *  bộ dữ liệu" (R-14/R-25), BẮT BUỘC await để biết chắc hồ sơ đã thật sự
 *  bị xoá trắng trước khi báo "đã xoá" cho học sinh (15/08/2026).
 *
 *  ⚠ BẮT BUỘC kèm auth_id trong payload dù cột này không đổi bao giờ: đây
 *  là upsert (INSERT ... ON CONFLICT DO UPDATE) — Postgres kiểm RLS
 *  WITH CHECK trên hàng ứng viên của nhánh INSERT trước khi biết có đụng
 *  khoá hay không, cột nào thiếu trong payload thì hàng ứng viên đó có
 *  giá trị NULL cho cột đó. Thiếu auth_id ở đây từng khiến MỌI upsert bị
 *  Postgres từ chối với lỗi 42501 ("new row violates row-level security
 *  policy") — lỗi bị NUỐT do fire-and-forget chỉ console.error, phát hiện
 *  qua Playwright E2E thật (07/08/2026), không lộ ra khi test bằng script
 *  không qua RLS. */
export async function luuHoSo(hoSo) {
  const { id, ma_6_so, auth_id, ten_ao, tuoi, gioi, muc_van_dong, hap_thu_sat, hap_thu_kem,
    di_ung, di_ung_khac, kcal_muc_tieu, dam_muc_tieu, glucid_muc_tieu, lipid_muc_tieu,
    canxi_muc_tieu, sat_muc_tieu, kem_muc_tieu, da_dong_y, ngay_dong_y_gan_nhat, truong_hoc } = hoSo

  const { error } = await supabase.from('hoc_sinh').upsert({
    id, ma_6_so, auth_id, ten_ao, tuoi, gioi, muc_van_dong, hap_thu_sat, hap_thu_kem,
    di_ung, di_ung_khac, kcal_muc_tieu, dam_muc_tieu, glucid_muc_tieu, lipid_muc_tieu,
    canxi_muc_tieu, sat_muc_tieu, kem_muc_tieu, da_dong_y, ngay_dong_y_gan_nhat, truong_hoc,
  }, { onConflict: 'id' })
  if (error) { console.error(error); return { ok: false, loi: `Không lưu được hồ sơ: ${error.message}` } }
  return { ok: true }
}
