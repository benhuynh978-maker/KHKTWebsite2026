/* =========================================================================
   THUẬT TOÁN SINH LỘ TRÌNH — PHIÊN BẢN TẠM, CHỈ ĐỦ CHO GIAO DIỆN 4 GIAI ĐOẠN
   -------------------------------------------------------------------------
   ⚠ ĐÂY KHÔNG PHẢI "Thuật toán sinh khung & hàm chấm điểm" cuối cùng đang
     được bàn ở tầng backend (Kế hoạch dự án Phần 5 — trọng số đa mục tiêu,
     grid search trên xếp hạng học sinh thật). Đây là bản đơn giản, tất
     định, đủ để 4 giai đoạn của trang Lộ trình chạy được trên dữ liệu
     thật (18 món demo) và phản ánh đúng logic ràng buộc đã chốt — không
     phải bản tối ưu cuối cùng. Khi thuật toán thật được chốt, thay phần
     thân các hàm dưới đây; các trang gọi chúng không cần sửa.

   Cài đặt Ở ĐÂY theo ĐÚNG tài liệu hiện có, kể cả những chỗ đã biết là
   vấn đề (không tự vá — theo quyết định "bám tài liệu 100%" của nhóm):

   • #30 — gia_max mỗi bữa = ngân_sách_tuần / tổng_số_bữa_tuần (trần PHẲNG
     mỗi bữa, đúng cách "Cơ sở dữ liệu lưu trữ" §2.3 định nghĩa cột
     gia_max). Điều này KHÔNG hiện thực đúng lời văn "ngân sách chảy giữa
     các ngày" ở Kế hoạch dự án §2.2 — mâu thuẫn giữa hai tài liệu, nhóm
     CHƯA giải quyết. Bám theo schema (cụ thể hơn) ở đây.

   • #3 — % năng lượng/đạm phân bổ theo bữa (TI_LE_THEO_BUOI bên dưới) là
     GIẢ ĐỊNH MINH HOẠ, CHƯA đối chiếu bảng chính thức của QĐ 3958/QĐ-BYT
     (R-30 yêu cầu tham chiếu văn bản đó, không tự đặt số tuỳ ý).

   • #2 — Sàn canxi/sắt THEO NGÀY (R-32) được kiểm tra THẬT, không giả vờ
     đạt. Với 18 món demo, tổ hợp trưa+tối tốt nhất chỉ đạt ~400–450mg
     canxi/ngày so với sàn ~1000mg → HẦU HẾT lộ trình sẽ báo BẤT KHẢ vì
     canxi, đúng như đã dự đoán khi rà soát 9 tài liệu. Cờ boQuaSanViChat
     (mặc định TẮT trên form) chỉ để xem tiếp Giai đoạn 3–4 lúc demo —
     KHÔNG phải một tính năng thật, sẽ gỡ khi vấn đề #2 được quyết ở tầng
     thuật toán.

   • #2b — DEMO 29/7: sau khi form mở khoá cả 4 buổi (yêu cầu riêng, khác
     MVP — xem FormLoTrinh.jsx), buổi "chiều" chỉ có 2 món khớp khung
     (quán ngoài, bán buổi chiều) trong 18 món demo. Giới hạn thật "1 món
     gốc ≤ 2 lần/tuần" (Cơ sở dữ liệu §... , tầng 2) khiến buổi chiều chỉ
     đủ món cho tối đa 4/7 ngày → tầng 1 báo "hết món khả dụng" từ ngày 5.
     Đây KHÔNG phải lỗi code, mà là hệ quả tất yếu của tập dữ liệu demo quá
     nhỏ so với việc bật đủ 4 buổi. Cờ boQuaSanViChat khi bật cũng nới tầng
     2 (ngưỡng "đủ món khác nhau" hạ xuống còn 1) và bỏ giới hạn tái sử
     dụng món gốc trong tuần — CHỈ để đi hết được 4 giai đoạn lúc demo,
     không phải sửa lại ràng buộc tồn kho thật.
   ========================================================================= */

import { DANH_SACH_MON } from '../data/mock/mon.js'
import { DANH_SACH_QUAN } from '../data/mock/quan.js'
import { tien, TEN_BUOI } from './dinhDang.js'

const TI_LE_THEO_BUOI = { sang: 0.25, trua: 0.35, chieu: 0.15, toi: 0.30 }
const NGUON_THEO_BUOI = { sang: 'quan_ngoai', trua: 'cang_tin', chieu: 'quan_ngoai', toi: 'quan_ngoai' }
const BAN_KINH_MAC_DINH = 800

export const TEN_MUC_DICH = {
  du_chat_trong_ngan_sach: 'Đủ chất trong ngân sách',
  tang_dam: 'Tăng đạm',
  tiet_kiem_toi_da: 'Tiết kiệm tối đa',
  du_nang_luong_hoc_nang: 'Đủ năng lượng cho ngày học nặng',
  an_da_dang: 'Ăn đa dạng, đổi món',
  an_nhe_de_tieu: 'Ăn nhẹ, dễ tiêu',
}

function layTatCaMonKemQuanNoiBo() {
  const quanTheoId = new Map(DANH_SACH_QUAN.map((q) => [q.id, q]))
  return DANH_SACH_MON.map((m) => ({ ...m, quan: quanTheoId.get(m.quan_id) }))
}

/** Xây khung dinh dưỡng cho MỖI bữa đã chọn — không đổi theo ngày trong
 *  bản tạm này (MVP chưa cài "cân bằng đạm giữa các ngày" — một ràng buộc
 *  xuyên-ngày mềm hơn, để lại cho thuật toán thật). */
export function xayKhungMoiBuoi(hoSo, form) {
  const soBuaMoiNgay = form.cac_buoi_ap_dung.length
  const soBuaTuan = soBuaMoiNgay * 7
  const giaMaxMoiBua = Math.max(1000, Math.floor(form.ngan_sach_tuan / soBuaTuan))

  const khungMoiBuoi = {}
  for (const buoi of form.cac_buoi_ap_dung) {
    const tiLe = TI_LE_THEO_BUOI[buoi]
    khungMoiBuoi[buoi] = {
      buoi,
      nguon: NGUON_THEO_BUOI[buoi],
      kcal_min: Math.round(hoSo.kcal_muc_tieu * tiLe * 0.85),
      kcal_max: Math.round(hoSo.kcal_muc_tieu * tiLe * 1.2),
      dam_min: Math.round(hoSo.dam_muc_tieu * tiLe),
      gia_max: giaMaxMoiBua,
      ban_kinh_m: NGUON_THEO_BUOI[buoi] === 'cang_tin' ? null : BAN_KINH_MAC_DINH,
    }
  }
  return { khungMoiBuoi, giaMaxMoiBua, soBuaTuan }
}

function monKhopKhung(mon, khung, hoSo, rangBuocGhiChu, boQuaSanViChat = false) {
  if (!mon.buoi.includes(khung.buoi)) return false
  if (mon.quan.loai_hinh !== khung.nguon) return false
  if (mon.gia > khung.gia_max) return false
  // DEMO (#2b) — sàn kcal_min/dam_min mỗi bữa cũng là "sàn dinh dưỡng" như
  // canxi/sắt theo ngày, chỉ khác cấp độ (mỗi bữa thay vì mỗi ngày). Với
  // hồ sơ demo (kcal_muc_tieu 2500) và tỉ lệ bữa trưa 35%, sàn kcal_min
  // bữa trưa (744) CAO HƠN món căng-tin đắt calo nhất hiện có (720) — nghĩa
  // là 0 món khớp khung TRƯA, cho MỌI lộ trình mới, bất kể ngân sách hay
  // buổi đã chọn (đã xác minh bằng cách chạy thử với dữ liệu mặc định).
  // Đây là lý do thật gây "Không tạo được lộ trình" ở Giai đoạn 2. Bật cờ
  // demo thì bỏ qua kcal_min/dam_min ở TỪNG BỮA (vẫn giữ kcal_max, giá,
  // dị ứng, bán kính) để có thể đi hết 4 giai đoạn lúc demo.
  if (!boQuaSanViChat) {
    if (mon.kcal < khung.kcal_min || mon.kcal > khung.kcal_max) return false
    if (mon.dam_g < khung.dam_min) return false
  } else if (mon.kcal > khung.kcal_max) {
    return false
  }
  if (khung.ban_kinh_m && mon.quan.khoang_cach_m > khung.ban_kinh_m) return false
  if (mon.thanh_phan_di_ung.some((d) => hoSo.di_ung.includes(d))) return false
  // Tầng 5 — Nhất quán ghi chú.
  if (rangBuocGhiChu?.tranh_cay && mon.cay) return false
  return true
}

/* =========================================================================
   TIỀN KIỂM 5 TẦNG + SINH LỘ TRÌNH — Kế hoạch dự án §4.1 (Bước 2), §5.1 (Bước 3)
   ========================================================================= */
export function chayTienKiemVaSinhLoTrinh(hoSo, form, rangBuocGhiChu, opts = {}) {
  const { boQuaSanViChat = false } = opts
  const { khungMoiBuoi } = xayKhungMoiBuoi(hoSo, form)
  const tatCaMon = layTatCaMonKemQuanNoiBo()

  // Tầng 4 — Loại trừ dị ứng TRƯỚC khi xét các tầng khác.
  const monAnToan = tatCaMon.filter(
    (m) => !m.thanh_phan_di_ung.some((d) => hoSo.di_ung.includes(d))
  )

  // Tầng 5 — Nhất quán ghi chú: nếu "tránh cay" xoá sạch ứng viên 1 buổi
  // nào đó → chặn ngay, không cần chạy hết vòng lặp 7 ngày.
  for (const buoi of form.cac_buoi_ap_dung) {
    const khung = khungMoiBuoi[buoi]
    const coCay = monAnToan.some((m) => monKhopKhung(m, khung, hoSo, {}, boQuaSanViChat))
    const khongCay = monAnToan.some((m) => monKhopKhung(m, khung, hoSo, rangBuocGhiChu, boQuaSanViChat))
    if (rangBuocGhiChu?.tranh_cay && coCay && !khongCay) {
      return {
        khaThi: false, tang: 5,
        lyDo: `Ghi chú "tránh cay" khiến không còn món nào khớp khung bữa ${TEN_BUOI[buoi].toLowerCase()}. Thử bỏ ghi chú này hoặc đổi buổi.`,
      }
    }
  }

  // Tầng 2 — Khả thi tồn kho: mỗi buổi cần đủ vài món khác nhau khớp khung,
  // nếu không cả tuần phải lặp một món (vi phạm "1 món gốc ≤ 2 lần/tuần").
  // DEMO (boQuaSanViChat): hạ ngưỡng xuống còn 1 — xem ghi chú #2b đầu file.
  const nguongTonKho = boQuaSanViChat ? 1 : 2
  for (const buoi of form.cac_buoi_ap_dung) {
    const khung = khungMoiBuoi[buoi]
    const ungVien = monAnToan.filter((m) => monKhopKhung(m, khung, hoSo, rangBuocGhiChu, boQuaSanViChat))
    if (ungVien.length < nguongTonKho) {
      return {
        khaThi: false, tang: 2,
        lyDo: `Không đủ món khác nhau quanh trường khớp khung bữa ${TEN_BUOI[buoi].toLowerCase()} với mức giá tối đa ${tien(khung.gia_max)}/bữa. Hãy nâng ngân sách tuần hoặc bớt một buổi.`,
      }
    }
  }

  // Bước 3 — Sinh khung: vòng lặp tham lam qua 7 ngày, mang theo "tiền còn
  // lại" + "món gốc đã dùng" + tính lại canxi/sắt MỖI NGÀY (§5.1).
  // ⚠ Kết quả từng ngày CHỈ dùng nội bộ để kiểm khả thi/tính tổng quan —
  //   Giai đoạn 3 hiển thị KHUNG, KHÔNG hiển thị món cụ thể này (§2.1).
  let tienConLai = form.ngan_sach_tuan
  const demMonGoc = new Map()
  const xemTruoc7Ngay = []

  for (let ngay = 1; ngay <= 7; ngay++) {
    let canxiNgay = 0
    let satNgay = 0
    const monTrongNgay = []

    for (const buoi of form.cac_buoi_ap_dung) {
      const khung = khungMoiBuoi[buoi]
      const ungVien = monAnToan
        .filter((m) => monKhopKhung(m, khung, hoSo, rangBuocGhiChu, boQuaSanViChat))
        .filter((m) => boQuaSanViChat || (demMonGoc.get(m.mon_goc_id) ?? 0) < 2)
        .filter((m) => m.gia <= tienConLai)
        // Sắp xếp tạm theo đạm/giá giảm dần — KHÔNG phải hàm chấm điểm
        // trọng số cuối cùng (Kế hoạch dự án §5.3), chỉ đủ để tất định.
        .sort((a, b) => b.dam_g / b.gia - a.dam_g / a.gia)

      if (ungVien.length === 0) {
        return {
          khaThi: false, tang: 1,
          lyDo: `Ngày ${ngay}: hết ngân sách hoặc hết món khả dụng cho bữa ${TEN_BUOI[buoi].toLowerCase()}. Mức ${tien(form.ngan_sach_tuan)}/tuần không đủ cho tổ hợp 7 ngày đã chọn — thử nâng ngân sách.`,
        }
      }

      const monChon = ungVien[0]
      monTrongNgay.push({ buoi, mon: monChon })
      tienConLai -= monChon.gia
      demMonGoc.set(monChon.mon_goc_id, (demMonGoc.get(monChon.mon_goc_id) ?? 0) + 1)
      canxiNgay += monChon.canxi_mg
      satNgay += monChon.sat_mg
    }

    // Tầng 3 — An toàn sức khoẻ: sàn canxi/sắt THEO NGÀY (R-32).
    if (!boQuaSanViChat) {
      if (canxiNgay < hoSo.canxi_muc_tieu) {
        return {
          khaThi: false, tang: 3,
          lyDo: `Ngày ${ngay}: tổ hợp món tốt nhất tìm được chỉ đạt ${Math.round(canxiNgay)}mg canxi/ngày, chưa tới sàn khuyến nghị ${hoSo.canxi_muc_tieu}mg. Đây KHÔNG phải vấn đề ngân sách — hệ thống hiện chỉ quản lý bữa trưa + tối nên khó đạt sàn canxi cả ngày từ 2 bữa. Vấn đề này đã được nhóm ghi nhận, chưa có quyết định cuối ở tầng thuật toán.`,
        }
      }
      if (satNgay < hoSo.sat_muc_tieu) {
        return {
          khaThi: false, tang: 3,
          lyDo: `Ngày ${ngay}: tổ hợp món tốt nhất tìm được chỉ đạt ${satNgay.toFixed(1)}mg sắt/ngày, chưa tới sàn khuyến nghị ${hoSo.sat_muc_tieu}mg. Cùng nguyên nhân với canxi ở trên.`,
        }
      }
    }

    xemTruoc7Ngay.push({ thu_tu_ngay: ngay, mon: monTrongNgay, canxi: canxiNgay, sat: satNgay })
  }

  return {
    khaThi: true,
    khungMoiBuoi,
    tongChiDuKien: form.ngan_sach_tuan - tienConLai,
    xemTruoc7Ngay,
  }
}
