/* =========================================================================
   DEMO — "ĐĂNG NHẬP" GIẢ LẬP, KHÔNG PHẢI XÁC THỰC THẬT
   -------------------------------------------------------------------------
   Tài liệu chính thức (Cơ sở dữ liệu lưu trữ §4, Hồ sơ & Cài đặt) định danh
   học sinh bằng MÃ 6 SỐ (R-13), không phải cặp tên tài khoản/mật khẩu — xem
   HOC_SINH_HIEN_TAI.ma_6_so ở data/mock/hocSinh.js. Hai trang Đăng ký/Đăng
   nhập (yêu cầu riêng để demo giao diện trước người xem) dùng tên tài
   khoản/mật khẩu như một trang đăng nhập thông thường, CỐ Ý khác tài liệu.

   Không kiểm tra mật khẩu thật, không tạo tài khoản thật, KHÔNG LƯU gì
   ngoài một cờ tạm trong sessionStorage để nhớ đã "qua cổng" demo — mất khi
   đóng tab trình duyệt. Khi nối xác thực thật, thay toàn bộ file này.
   ========================================================================= */

const KHOA_DEMO = 'demo_da_qua_dang_nhap'

export const daQuaDangNhapDemo = () => sessionStorage.getItem(KHOA_DEMO) === '1'

export const datDaQuaDangNhapDemo = () => {
  sessionStorage.setItem(KHOA_DEMO, '1')
}
