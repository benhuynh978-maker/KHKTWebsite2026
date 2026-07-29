/* =========================================================================
   TIỆN ÍCH SẮP XẾP DANH SÁCH — dùng ở "Ăn gì hôm nay" và "Quán ăn gần đây"
   ========================================================================= */

/** Xáo trộn ngẫu nhiên (Fisher–Yates), không sửa mảng gốc. */
export function xaoTron(mang) {
  const ketQua = [...mang]
  for (let i = ketQua.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ketQua[i], ketQua[j]] = [ketQua[j], ketQua[i]]
  }
  return ketQua
}

/* =========================================================================
   Round-robin theo quán — "Kế hoạch trang Ăn gì hôm nay" §3.2:
   "vòng 1 lấy 1 món mỗi quán (ngẫu nhiên trong quán đó); vòng 2 lấy thêm
   1 món khác mỗi quán (nếu còn); lặp tới khi hết món ở mọi quán."
   Mục đích: hai thẻ cùng quán không đứng liền nhau, giữ cảm giác đa dạng
   dù một quán có menu lớn hơn nhiều quán khác.
   ========================================================================= */
export function xepRoundRobinTheoQuan(danhSachMon) {
  const theoQuan = new Map()
  for (const m of danhSachMon) {
    if (!theoQuan.has(m.quan_id)) theoQuan.set(m.quan_id, [])
    theoQuan.get(m.quan_id).push(m)
  }
  const nhom = [...theoQuan.values()].map(xaoTron)

  const ketQua = []
  let vong = 0
  let conMon = true
  while (conMon) {
    conMon = false
    for (const ds of nhom) {
      if (ds[vong]) {
        ketQua.push(ds[vong])
        conMon = true
      }
    }
    vong += 1
  }
  return ketQua
}
