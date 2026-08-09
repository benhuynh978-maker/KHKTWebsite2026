/* =========================================================================
   XÁC THỰC THẬT — tên tài khoản/mật khẩu qua Supabase Auth (email+password).
   -------------------------------------------------------------------------
   Supabase Auth chỉ nhận "email", không có khái niệm "tên tài khoản" —
   quy đổi ngầm tên tài khoản → email giả (@hocsinh.andauchat.com — PHẢI
   dùng TLD thường, ".local"/".test" bị Supabase từ chối ngay lúc đăng ký),
   người dùng không thấy/không cần biết việc này. Mật khẩu do Supabase Auth
   tự băm/lưu phía server — KHÔNG tự lưu mật khẩu vào bảng hoc_sinh (chỉ có
   publishable key ở client, không đủ an toàn để tự làm xác thực).

   ⚠ Cần bật Authentication → Providers → Email (thường bật sẵn) VÀ tắt
   "Confirm email" ở Supabase Dashboard trước khi dùng — email ở đây là giả,
   không có hộp thư thật để bấm xác nhận, để nguyên sẽ không đăng nhập được
   sau khi đăng ký. Claude không có quyền vào Dashboard để tự tắt.

   ⚠ Không có đường khôi phục khi quên mật khẩu (hệ quả trực tiếp của email
   giả — không có hộp thư thật để gửi link đặt lại). Quyết định đã chốt
   cùng người dùng 08/08/2026: chấp nhận rủi ro này, không thu thêm email
   thật (giữ đúng tinh thần R-25 — không thu thập thêm dữ liệu ngoài cần
   thiết). Nếu sau này đổi ý, cần thêm cột email thật + bật lại luồng
   resetPasswordForEmail() của Supabase.

   Đổi từ Anonymous Auth (07/08/2026) sang cơ chế này: ConGate ở App.jsx
   giờ chặn vào app tới khi có phiên thật, CongDuLieu.jsx không còn tự
   signInAnonymously() nữa — chỉ đọc phiên đã có (đảm bảo luôn tồn tại nhờ
   ConGate chặn trước). */

import { supabase, THOI_GIAN_CHO_TOI_DA_MS } from './client.js'

// ⚠ ".local"/".test"/".invalid" là TLD dành riêng (RFC 6761/6762) — Supabase
// Auth từ chối thẳng lúc đăng ký ("Email address ... is invalid"), dù chỉ
// kiểm định dạng chuỗi chứ không xác minh hộp thư thật. Phải dùng TLD
// thường như ".com" mới qua được kiểm tra định dạng (phát hiện thật khi
// chạy Playwright, đã sửa 08/08/2026).
const HAU_TO_EMAIL_GIA = '@hocsinh.andauchat.com'

function timeoutSauMs(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Hết thời gian chờ Supabase (xác thực).')), ms)
  })
}

/** Chuẩn hoá tên tài khoản — DÙNG CHUNG cho cả đăng ký lẫn đăng nhập, để
 *  "AnAn" và "anan " luôn quy về đúng 1 tài khoản. */
export function chuanHoaTenTaiKhoan(ten) {
  return ten.trim().toLowerCase()
}

/** Tên tài khoản đã chuẩn hoá → email giả hợp lệ định dạng (bỏ dấu, đổi
 *  ký tự lạ thành "_") — Supabase chỉ cần ĐÚNG ĐỊNH DẠNG email, không xác
 *  minh có thật hay không vì "Confirm email" đã tắt. */
function tenThanhEmailGia(tenDaChuanHoa) {
  const antoan = tenDaChuanHoa
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // bỏ dấu tiếng Việt
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9._-]/g, '_')
  return `${antoan || 'hs'}${HAU_TO_EMAIL_GIA}`
}

/** Độ dài mật khẩu tối thiểu Supabase Auth yêu cầu — validate trước khi
 *  gửi để báo lỗi rõ ràng ngay tại chỗ thay vì lỗi kỹ thuật từ server. */
export const DO_DAI_MAT_KHAU_TOI_THIEU = 6

/** Đăng ký tài khoản thật. Trả về { ok:true, uid } hoặc { ok:false, loi }
 *  — loi đã là câu tiếng Việt sẵn sàng hiển thị. */
export async function dangKyThat(tenTaiKhoan, matKhau) {
  const ten = chuanHoaTenTaiKhoan(tenTaiKhoan)
  if (matKhau.length < DO_DAI_MAT_KHAU_TOI_THIEU) {
    return { ok: false, loi: `Mật khẩu cần ít nhất ${DO_DAI_MAT_KHAU_TOI_THIEU} ký tự.` }
  }
  try {
    const { data, error } = await Promise.race([
      supabase.auth.signUp({ email: tenThanhEmailGia(ten), password: matKhau }),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (error) {
      if (/already registered|already exists/i.test(error.message)) {
        return { ok: false, loi: 'Tên tài khoản này đã có người dùng — thử tên khác.' }
      }
      if (/confirm/i.test(error.message)) {
        return { ok: false, loi: 'Server chưa tắt "Confirm email" ở Supabase Dashboard — liên hệ người quản trị.' }
      }
      if (/rate limit/i.test(error.message)) {
        // Phát hiện thật 08/08/2026: Supabase giới hạn số email gửi/giờ dù
        // "Confirm email" đã tắt (vẫn tính vào hạn ngạch nội bộ) — chạm
        // ngưỡng rất nhanh trên gói miễn phí khi test nhiều tài khoản liên
        // tiếp trong thời gian ngắn.
        return { ok: false, loi: 'Hệ thống đang giới hạn số lượt đăng ký/giờ — đợi một lúc rồi thử lại.' }
      }
      return { ok: false, loi: `Không đăng ký được: ${error.message}` }
    }
    if (!data.session) {
      // Tắt "Confirm email" thì signUp phải trả session ngay — không có
      // nghĩa là cấu hình Dashboard chưa đúng, không phải lỗi code.
      return { ok: false, loi: 'Đăng ký xong nhưng chưa có phiên đăng nhập — kiểm tra "Confirm email" đã tắt ở Supabase Dashboard chưa.' }
    }
    return { ok: true, uid: data.user.id }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}

/** Đăng nhập tài khoản thật. Cùng thông báo lỗi cho "sai tài khoản" VÀ
 *  "sai mật khẩu" — tránh lộ tài khoản nào có tồn tại (thông lệ chuẩn). */
export async function dangNhapThat(tenTaiKhoan, matKhau) {
  const ten = chuanHoaTenTaiKhoan(tenTaiKhoan)
  try {
    const { data, error } = await Promise.race([
      supabase.auth.signInWithPassword({ email: tenThanhEmailGia(ten), password: matKhau }),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (error) return { ok: false, loi: 'Sai tên tài khoản hoặc mật khẩu.' }
    return { ok: true, uid: data.user.id }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}

/** Đăng xuất thật — sau khi gọi, nơi gọi PHẢI tải lại cứng cả trang
 *  (window.location.href), không chỉ điều hướng SPA: dữ liệu món/quán/hồ
 *  sơ/lộ trình chỉ nạp MỘT LẦN cho cả phiên JS (CongDuLieu.jsx, cờ daTai),
 *  điều hướng SPA sẽ giữ nguyên dữ liệu cũ đè lên tài khoản đăng nhập kế
 *  tiếp nếu không tải lại cứng. */
export async function dangXuatThat() {
  await supabase.auth.signOut()
}

/** Có phiên đăng nhập thật hay không — dùng ở ConGate (App.jsx) để quyết
 *  định cho vào app hay đá về /dang-nhap. */
export async function coPhienDangNhap() {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

/** Lấy uid của phiên hiện tại — CongDuLieu.jsx gọi sau khi ConGate đã đảm
 *  bảo chắc chắn có phiên, nên luôn có giá trị (không cần xử lý null ở
 *  đây, lỗi thật sự bất thường mới rơi vào nhánh ok:false). */
export async function layUidPhienHienTai() {
  try {
    const { data: { session }, error } = await Promise.race([
      supabase.auth.getSession(),
      timeoutSauMs(THOI_GIAN_CHO_TOI_DA_MS),
    ])
    if (error) return { ok: false, loi: `Không đọc được phiên đăng nhập: ${error.message}` }
    if (!session?.user?.id) return { ok: false, loi: 'Không có phiên đăng nhập — quay lại trang Đăng nhập.' }
    return { ok: true, uid: session.user.id }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}
