/* =========================================================================
   APPS SCRIPT — nhận báo cáo "không thấy trường của tôi" từ Website, ghi
   vào Google Sheet. KHÔNG chạy trong dự án — copy dán vào Apps Script của
   Google Sheet riêng, không phải file build cùng Website.

   CÁCH DEPLOY (làm 1 lần):
   1. Tạo 1 Google Sheet mới (Google Drive → New → Google Sheets). Đặt tên
      hàng 1 các cột: Thời gian | Tên trường | Mã 6 số.
   2. Extensions → Apps Script. Xoá code mẫu, dán TOÀN BỘ nội dung file này
      vào.
   3. Deploy → New deployment → chọn loại "Web app".
      - Execute as: Me
      - Who has access: Anyone
   4. Bấm Deploy, cho phép quyền truy cập Sheet khi được hỏi. Copy URL dạng
      https://script.google.com/macros/s/.../exec
   5. Dán URL đó vào hằng số URL_APPS_SCRIPT ở
      Website/src/data/khoBaoCaoTruong.js — KHÔNG cần sửa gì khác.
   ========================================================================= */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  var than = JSON.parse(e.postData.contents)

  sheet.appendRow([
    than.thoi_gian || new Date().toISOString(),
    than.ten_truong || '',
    than.ma_so_tuy_chon || '',
  ])

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
}
