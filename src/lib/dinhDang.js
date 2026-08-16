/* Hàm định dạng dùng chung. */

/** 30000 → "30.000đ" */
export const tien = (so) =>
  so == null ? '—' : `${so.toLocaleString('vi-VN')}đ`

/** 30000 → "30k" — dùng ở chỗ hẹp như thẻ món. */
export const tienNgan = (so) =>
  so == null ? '—' : `${Math.round(so / 1000)}k`

/** 250 → "250m" · 1200 → "1,2km" · 0 → "Trong trường" */
export const khoangCach = (m) => {
  if (m == null) return '—'
  if (m === 0) return 'Trong trường'
  if (m < 1000) return `${m}m`
  return `${(m / 1000).toFixed(1).replace('.', ',')}km`
}

/** ISO → "20:15" */
export const gio = (iso) => {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** ISO → "27/07 · 11:20" — dùng cho mốc thời gian bình luận. */
export const ngayGio = (iso) => {
  const d = new Date(iso)
  const ngay = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  return `${ngay} · ${gio(iso)}`
}

/** "Cơm Tấm" → "com tam" — bỏ dấu để tìm kiếm không phân biệt dấu tiếng Việt.
 *  Dùng ̀-ͯ (khối Unicode "Combining Diacritical Marks") thay vì
 *  gõ trực tiếp ký tự dấu vào regex — tránh lỗi hiển thị/encoding giữa
 *  các trình soạn thảo khác nhau. */
export const boDauChu = (chuoi) =>
  chuoi
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

export const TEN_BUOI = {
  sang: 'Sáng',
  trua: 'Trưa',
  chieu: 'Chiều',
  toi: 'Tối',
}

export const TEN_NGUON = {
  cang_tin: 'Căng tin',
  quan_ngoai: 'Quán ngoài',
}

/* Hồ sơ lưu mã không dấu (thap/vua/cao) — phải tra qua bảng này trước khi
   hiện ra màn hình, đừng in thẳng mã ("vận động vua" là sai chính tả). */
export const TEN_MUC_VAN_DONG = {
  thap: 'Thấp',
  vua: 'Vừa',
  cao: 'Cao',
}
