/* =========================================================================
   BÁO CÁO "KHÔNG THẤY TRƯỜNG CỦA TÔI" — gửi qua Google Apps Script Web App,
   CỐ Ý tách hoàn toàn khỏi Supabase (yêu cầu riêng 10/08/2026: tránh tốn
   hạn mức Supabase cho một tính năng chỉ ghi, không cần đọc lại trên
   Website). Ghi vào Google Sheet của nhóm — xem hướng dẫn deploy trong
   README cạnh file này hoặc hỏi lại nhóm phát triển.

   ⚠ URL_APPS_SCRIPT rỗng cho tới khi nhóm tự deploy Apps Script (Claude
   không có quyền vào Google Cloud/Drive của người dùng) — rỗng thì
   guiBaoCaoThieuTruong() trả lỗi rõ ràng thay vì gọi fetch('') im lặng
   hỏng. Điền URL vào đây sau khi deploy xong, KHÔNG cần đổi chỗ nào khác. */

const URL_APPS_SCRIPT = ''

function timeoutSauMs(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Hết thời gian chờ gửi báo cáo.')), ms)
  })
}

/** Gửi báo cáo "trường của tôi không có trong danh sách". Trả
 *  { ok:true } hoặc { ok:false, loi }. KHÔNG đụng Supabase — toàn bộ đi
 *  qua Google Apps Script Web App (fetch POST, JSON). */
export async function guiBaoCaoThieuTruong(tenTruongHocSinhGo, maSoTuyChon) {
  if (!URL_APPS_SCRIPT) {
    return { ok: false, loi: 'Server nhận báo cáo chưa được cấu hình — báo cho quản trị viên (URL_APPS_SCRIPT rỗng ở khoBaoCaoTruong.js).' }
  }
  if (!tenTruongHocSinhGo?.trim()) {
    return { ok: false, loi: 'Nhập tên trường của bạn trước đã.' }
  }
  try {
    const res = await Promise.race([
      fetch(URL_APPS_SCRIPT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // tránh CORS preflight, xem README Apps Script
        body: JSON.stringify({
          ten_truong: tenTruongHocSinhGo.trim(),
          ma_so_tuy_chon: maSoTuyChon?.trim() || null,
          thoi_gian: new Date().toISOString(),
        }),
      }),
      timeoutSauMs(10000),
    ])
    if (!res.ok) return { ok: false, loi: `Server nhận báo cáo trả lỗi (${res.status}).` }
    return { ok: true }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}
