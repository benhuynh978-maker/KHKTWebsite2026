/* =========================================================================
   ĐỀ XUẤT QUÁN/MÓN TỪ HỌC SINH — "ẩm thực học đường" (12/08/2026, yêu cầu
   riêng). Kiểu "+" đăng bài Facebook/TikTok: học sinh tự gửi quán/món thay
   vì đợi ban quản lý đi khảo sát.
   -------------------------------------------------------------------------
   ẨN DANH HOÀN TOÀN — không ghi ma_hoc_sinh/ten_ao vào mon_an/quan_an, kể
   cả với người duyệt. Vẫn cần auth.uid() (đã đăng nhập thật) mới gửi được
   — RLS ép buộc (sql/10-...sql), CHỈ để chặn spam từ trình duyệt chưa đăng
   nhập, KHÔNG phải để truy vết người gửi (cùng tinh thần
   goi_y_chon_mon_an_danh ở sql/3-...sql).

   Mọi món gửi lên đều trang_thai_duyet='cho_duyet' — RLS chặn cứng, không
   client nào tự ghi 'da_duyet' được. Hiện ra CHỈ sau khi có người vào
   thẳng Supabase Table Editor sửa tay dòng đó (không xây trang quản trị
   riêng — người dùng đã xác nhận). Quán KHÔNG có cờ duyệt riêng — "hiện
   ra" suy từ việc có ≥1 món đã duyệt thuộc về nó, xem CongDuLieu.jsx —
   duyệt đúng 1 món tự kéo quán theo, không phải duyệt 2 nơi.

   ma_dinh_duong (15/08/2026) — KHÔNG bắt học sinh tự khai, mà gọi
   /api/gan-ma-dinh-duong (Gemini phân loại vào 1 trong các mã có sẵn, xem
   chat-server/ganMaDinhDuong.js) NGAY ĐẦU HÀM, TRƯỚC cả tạo quán/tải ảnh.

   ĐẢO NGƯỢC quyết định ban đầu (đổi cùng ngày 15/08/2026, yêu cầu riêng) —
   không còn "không chặn nếu lỗi/thiếu mã" nữa: null (dù do Gemini kết luận
   thật sự không có mã khớp, hay do lỗi gọi API/hết quota/mất mạng — 2
   trường hợp KHÔNG phân biệt) → CHẶN LUÔN, trả lỗi ngay, KHÔNG tạo quán,
   KHÔNG tải ảnh, KHÔNG insert mon_an. Hệ quả chấp nhận: món hoàn toàn không
   có trong 100 mã (đồ uống, món Hàn, món ăn vặt...) sẽ không bao giờ tự
   đăng được qua tính năng này nữa, gửi lại bao nhiêu lần cũng vô ích — chỉ
   đội dự án thêm được qua Table Editor. RLS (sql/10-...sql) không giới hạn
   giá trị ma_dinh_duong trong policy INSERT nên client tự ghi được — món
   vẫn kẹt trang_thai_duyet='cho_duyet', người duyệt tay xem lại ở Table
   Editor trước khi đổi 'da_duyet'.

   Thêm 12/08/2026 (yêu cầu riêng) — CÓ gửi thanh_phan_di_ung, vì nhóm quản
   lý không có cách nào tự khảo sát dị ứng thật cho món học sinh gửi (khác
   dữ liệu "thực địa" khảo sát tay). Học sinh tự tick từ ĐÚNG 14 mã chuẩn
   (xem ChonDiUngCoGiaiThich.jsx) — dữ liệu tự khai, không kiểm định, nhưng
   là cách duy nhất có thể có được. Không tick gì → gửi NULL (không phải
   mảng rỗng) để giữ nguyên cơ chế fail-closed của lib/diUng.js ("chưa kiểm
   = KHÔNG an toàn" khi học sinh xem có chọn dị ứng) — mảng rỗng nghĩa là
   "đã kiểm, chắc chắn sạch", form này không có cách nào xác nhận chắc chắn
   như vậy nên không bao giờ tự gửi mảng rỗng. */

import { supabase, THOI_GIAN_CHO_TOI_DA_MS } from './client.js'
import { HOC_SINH_HIEN_TAI } from '../mock/hocSinh.js'

const TEN_BUCKET_ANH = 'anh-mon-quan'
const SO_KET_QUA_TIM_QUAN_TOI_DA = 10
const DIA_CHI_API_GAN_MA = import.meta.env.DEV ? 'http://localhost:8787/api/gan-ma-dinh-duong' : '/api/gan-ma-dinh-duong'
const THOI_GIAN_CHO_GAN_MA_MS = 8000

function timeoutSauMs(ms, thongBao = 'Hết thời gian chờ Supabase (đề xuất món/quán).') {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(thongBao)), ms)
  })
}

/** Gợi ý mã dinh dưỡng qua Gemini — trả null nếu Gemini không tìm được mã
 *  khớp HOẶC lỗi gọi API/timeout (2 trường hợp gộp chung, gọi nơi dùng tự
 *  chặn việc gửi món khi null, xem guiDeXuatMonQuan()). */
async function ganMaDinhDuongGoiY(tenMon, moTa) {
  try {
    const res = await Promise.race([
      fetch(DIA_CHI_API_GAN_MA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenMon, moTa }),
      }),
      timeoutSauMs(THOI_GIAN_CHO_GAN_MA_MS, 'Hết thời gian chờ gán mã dinh dưỡng.'),
    ])
    if (!res.ok) return null
    const json = await res.json()
    return json.maDinhDuong ?? null
  } catch {
    return null
  }
}

/* Mã ngẫu nhiên KHÔNG trùng các quy ước mã đã có (QUAN01.., LHPHCM..) —
   tiền tố "HS" (học sinh gửi) + thời gian + số ngẫu nhiên, đủ để tránh va
   chạm ở quy mô một trường. */
function maNgauNhien(tienTo) {
  return `${tienTo}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`.toUpperCase()
}

/** Tìm quán theo tên, CHỈ trong đúng trường của học sinh đang đăng nhập —
 *  gồm CẢ quán đang chờ duyệt (chưa món nào được duyệt, còn vô hình ở mọi
 *  trang khác của app) để giảm nguy cơ 2 người gửi trùng 1 quán mới (không
 *  triệt để 100% được — chấp nhận, xử lý nốt phần trùng còn sót bằng tay
 *  lúc duyệt, xem ghi chú đầu sql/10-...sql). */
export async function timQuanTheoTen(tuKhoa) {
  const tk = tuKhoa.trim()
  if (!tk) return { ok: true, danhSach: [] }
  try {
    const { data, error } = await Promise.race([
      supabase.from('quan_an').select('ma_quan, ten_quan')
        .eq('truong_hoc', HOC_SINH_HIEN_TAI.truong_hoc)
        .ilike('ten_quan', `%${tk}%`)
        .limit(SO_KET_QUA_TIM_QUAN_TOI_DA),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (error) return { ok: false, loi: `Không tìm được quán: ${error.message}` }
    return { ok: true, danhSach: data }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}

async function taiAnhLen(anhFile) {
  const duoi = anhFile.name.includes('.') ? anhFile.name.split('.').pop() : 'jpg'
  const duongDan = `${maNgauNhien('anh')}.${duoi}`
  try {
    const { error } = await Promise.race([
      supabase.storage.from(TEN_BUCKET_ANH).upload(duongDan, anhFile),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (error) return { ok: false, loi: `Không tải ảnh lên được: ${error.message}` }
    const { data } = supabase.storage.from(TEN_BUCKET_ANH).getPublicUrl(duongDan)
    return { ok: true, url: data.publicUrl }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}

/** Gửi 1 đề xuất — LUÔN kèm đúng 1 món trong cùng lần gửi, không cho gửi
 *  "chỉ quán, chưa có món" (xem thảo luận 12/08/2026: quán không món sẽ
 *  không bao giờ hiện ra được, nên bắt buộc gộp ngay từ lúc nhập).
 *
 *  quanCoSan: mã quán đã có sẵn (chọn từ timQuanTheoTen) — dùng khi quán
 *  đã tồn tại (thật hoặc người khác vừa gửi, đang chờ duyệt). Các field
 *  quán (loai_hinh, giờ, ngày nghỉ, SĐT) CHỈ áp dụng khi tạo quán mới —
 *  quán có sẵn giữ nguyên dữ liệu đã có, không ghi đè.
 *  quanMoi: { ten_quan, dia_chi, loai_hinh, gio_mo_1, gio_dong_1, gio_mo_2,
 *  gio_dong_2, ngay_nghi, so_dien_thoai } — dùng khi không tìm thấy, tạo
 *  quán mới. Chỉ truyền ĐÚNG MỘT trong quanCoSan/quanMoi.
 *  thanhPhanDiUng: mảng mã dị ứng đã tick, HOẶC mảng rỗng nếu không tick
 *  gì — hàm này tự đổi mảng rỗng thành NULL trước khi gửi (xem ghi chú
 *  đầu file). */
export async function guiDeXuatMonQuan({
  quanCoSan, quanMoi, tenMon, giaNghinDong, anhFile, moTa, cay, thanhPhanDiUng,
}) {
  try {
    const maDinhDuongGoiY = await ganMaDinhDuongGoiY(tenMon, moTa)
    if (!maDinhDuongGoiY) {
      return { ok: false, loi: 'Hệ thống từ chối đăng. Vui lòng bạn đổi món mới hoặc thử lại 1 lần nữa.' }
    }

    let maQuan = quanCoSan

    if (!maQuan) {
      maQuan = maNgauNhien('HSQ')
      const { error: loiQuan } = await Promise.race([
        supabase.from('quan_an').insert({
          ma_quan: maQuan,
          ten_quan: quanMoi.ten_quan.trim(),
          dia_chi: quanMoi.dia_chi?.trim() || null,
          loai_hinh: quanMoi.loai_hinh,
          gio_mo_1: quanMoi.gio_mo_1 || null,
          gio_dong_1: quanMoi.gio_dong_1 || null,
          gio_mo_2: quanMoi.gio_mo_2 || null,
          gio_dong_2: quanMoi.gio_dong_2 || null,
          ngay_nghi: quanMoi.ngay_nghi?.trim() || null,
          so_dien_thoai: quanMoi.so_dien_thoai?.trim() || null,
          truong_hoc: HOC_SINH_HIEN_TAI.truong_hoc,
          nguon_du_lieu: 'hoc_sinh_gui',
        }),
        timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
      ])
      if (loiQuan) return { ok: false, loi: `Không tạo được quán mới: ${loiQuan.message}` }
    }

    let anhUrl = null
    if (anhFile) {
      const kqAnh = await taiAnhLen(anhFile)
      if (!kqAnh.ok) return kqAnh
      anhUrl = kqAnh.url
    }

    const { error: loiMon } = await Promise.race([
      supabase.from('mon_an').insert({
        ma_mon: maNgauNhien('HSM'),
        ma_quan: maQuan,
        ten_mon: tenMon.trim(),
        // Cùng quy ước gia_nghin_vnd với dữ liệu khảo sát thật (khoVi4.js:
        // tachSoGia nhân 1000) — lưu thẳng số nghìn đồng dạng chữ.
        gia_nghin_vnd: giaNghinDong != null ? String(giaNghinDong) : null,
        anh_url: anhUrl,
        mo_ta: moTa?.trim() || null,
        cay: !!cay,
        thanh_phan_di_ung: thanhPhanDiUng && thanhPhanDiUng.length > 0 ? thanhPhanDiUng : null,
        nguon_du_lieu: 'hoc_sinh_gui',
        trang_thai_duyet: 'cho_duyet',
        ma_dinh_duong: maDinhDuongGoiY,
      }),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (loiMon) return { ok: false, loi: `Không gửi được món: ${loiMon.message}` }

    return { ok: true }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}
