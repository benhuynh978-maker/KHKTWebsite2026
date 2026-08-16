/* Phím Esc đóng bảng nổi — dùng chung cho cả 5 modal (ModalMon,
   BangBinhLuan, BaoCaoVanDe, GhiNhanPhuTro, FormDeXuatMon). Trước đây không
   modal nào bắt bàn phím: bấm ra nền tối thì đóng được, riêng Esc thì không.

   Đây là file lib DUY NHẤT có React (các file còn lại là logic thuần) — đặt
   ở đây vì cả 5 modal đều cần, chép 5 lần thì lệch nhau lúc sửa. */

import { useEffect } from 'react'

export function useDongBangEsc(onDong) {
  useEffect(() => {
    if (!onDong) return
    const nhanPhim = (e) => { if (e.key === 'Escape') onDong() }
    document.addEventListener('keydown', nhanPhim)
    return () => document.removeEventListener('keydown', nhanPhim)
  }, [onDong])
}
