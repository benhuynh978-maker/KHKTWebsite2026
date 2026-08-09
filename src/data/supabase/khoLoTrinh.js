/* =========================================================================
   KHU VỰC 2 THẬT — bảng `lo_trinh`/`lo_trinh_khung`/`lo_trinh_ghi_nhan`
   trên Supabase (sql/4-tao-bang-ho-so-va-lo-trinh.sql). Thay thế trạng
   thái TRANG_THAI ở src/data/mock/loTrinh.js khi CongDuLieu.jsx gọi
   taiKhuVuc2() lúc mở app — mutate TRANG_THAI TẠI CHỖ (giống khoVi4.js),
   nhờ vậy 4 giai đoạn Lộ trình + Lịch sử + Phân tích không cần sửa.

   Bảng thử nghiệm (kịch bản demo trên Dashboard) KHÔNG đi qua file này —
   nó ghi thẳng vào TRANG_THAI qua các hàm ở mock/loTrinh.js, cố tình không
   đụng Supabase (dữ liệu giả không nên lẫn vào bảng thật). Các hàm dưới
   đây chỉ được api.js gọi từ đúng luồng 4 giai đoạn thật.
   ========================================================================= */

import { supabase, THOI_GIAN_CHO_TOI_DA_MS, GIOI_HAN_DONG } from './client.js'

function timeoutSauMs(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Hết thời gian chờ Supabase (lộ trình).')), ms)
  })
}

/** Toàn bộ Khu vực 2 của một học sinh — mọi lộ trình từng tạo (kể cả đã
 *  huỷ/hết hạn), khung, và ghi nhận — đúng thứ TRANG_THAI cần để mọi hàm
 *  sync sẵn có trong api.js (khungTheoNgayCuaLoTrinhHienTai, layToanBoKhuVuc2...)
 *  chạy đúng như khi còn đọc mock. Trả về { ok:false, loi } nếu lỗi mạng —
 *  KHÔNG âm thầm coi "lỗi" là "học sinh chưa có lộ trình". */
export async function taiKhuVuc2(ma6So) {
  try {
    const { data: tatCaLoTrinh, error: loi1, count } = await Promise.race([
      supabase.from('lo_trinh').select('*', { count: 'exact' })
        .eq('ma_hoc_sinh', ma6So).limit(GIOI_HAN_DONG).order('tao_luc', { ascending: true }),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (loi1) return { ok: false, loi: `Không tải được lộ trình: ${loi1.message}` }
    if (count != null && count > tatCaLoTrinh.length) {
      return { ok: false, loi: 'Dữ liệu lộ trình bị cắt bớt (chạm trần số dòng) — báo cho quản trị viên.' }
    }

    if (tatCaLoTrinh.length === 0) {
      return { ok: true, tatCaLoTrinh: [], tatCaKhung: [], ghiNhan: [] }
    }

    const idsLoTrinh = tatCaLoTrinh.map((l) => l.id)
    const { data: tatCaKhung, error: loi2 } = await Promise.race([
      supabase.from('lo_trinh_khung').select('*').in('lo_trinh_id', idsLoTrinh).limit(GIOI_HAN_DONG),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (loi2) return { ok: false, loi: `Không tải được khung lộ trình: ${loi2.message}` }

    const idsKhung = tatCaKhung.map((k) => k.id)
    let ghiNhan = []
    if (idsKhung.length > 0) {
      const { data, error: loi3 } = await Promise.race([
        supabase.from('lo_trinh_ghi_nhan').select('*').in('lo_trinh_khung_id', idsKhung).limit(GIOI_HAN_DONG),
        timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
      ])
      if (loi3) return { ok: false, loi: `Không tải được ghi nhận: ${loi3.message}` }
      ghiNhan = data
    }

    return { ok: true, tatCaLoTrinh, tatCaKhung, ghiNhan }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}

/** Áp dụng lộ trình mới — fire-and-forget, gọi SAU khi đã mutate TRANG_THAI
 *  cục bộ (taoLoTrinhMoi trong mock/loTrinh.js). khungRows lấy từ
 *  TRANG_THAI.tat_ca_khung lọc theo lo_trinh_id ngay sau lời gọi đó. */
export function luuLoTrinhMoi(loTrinh, khungRows) {
  supabase.from('lo_trinh').insert(loTrinh).then(({ error }) => {
    if (error) { console.error(error); return }
    if (khungRows.length === 0) return
    supabase.from('lo_trinh_khung').insert(khungRows).then(({ error: e2 }) => {
      if (e2) console.error(e2)
    })
  })
}

export function luuHuyLoTrinh(id, lyDo) {
  if (!id) return
  supabase.from('lo_trinh').update({ trang_thai: 'da_huy', ly_do_huy: lyDo ?? null })
    .eq('id', id).then(({ error }) => { if (error) console.error(error) })
}

export function luuGhiNhan(dong) {
  supabase.from('lo_trinh_ghi_nhan').insert(dong).then(({ error }) => {
    if (error) console.error(error)
  })
}

export function xoaGhiNhan(id) {
  supabase.from('lo_trinh_ghi_nhan').delete().eq('id', id).then(({ error }) => {
    if (error) console.error(error)
  })
}

/** Cài đặt §3.3.2 — xoá thật. Nhờ ON DELETE CASCADE trên 2 khoá ngoại
 *  (lo_trinh_khung → lo_trinh, lo_trinh_ghi_nhan → lo_trinh_khung), chỉ
 *  cần xoá bảng gốc — Supabase tự xoá dây chuyền cả khung lẫn ghi nhận. */
export function xoaToanBoLoTrinhCuaHocSinh(ma6So) {
  supabase.from('lo_trinh').delete().eq('ma_hoc_sinh', ma6So).then(({ error }) => {
    if (error) console.error(error)
  })
}
