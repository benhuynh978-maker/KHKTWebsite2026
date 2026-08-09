/* =========================================================================
   THAM SỐ LỘ TRÌNH — port từ test/cau-hinh-lo-trinh.js (Pha 2, 07/08/2026).
   Tách khỏi thamSoChamDiem.js CỐ Ý: tỉ lệ chia bữa là CHÍNH SÁCH riêng của
   Lộ trình (lựa chọn thiết kế), không phải hằng số chấm điểm dùng chung cho
   mọi tính năng — xem test/lich-su/he-thong.md mục "Sự kiện vs chính sách".
   ========================================================================= */

/* Tỉ lệ % năng lượng/dinh dưỡng MỖI BUỔI trên tổng ngày — áp dụng cho MỌI
   chỉ số (kcal, đạm, béo, đường, canxi, sắt, kẽm) VÀ ngân sách. Chỉ 2 tổ hợp
   cố định (Pha 2, quay về đúng test/) — không cho tick buổi tuỳ ý: không
   tồn tại lộ trình < 3 bữa (2 bữa chẳng khác gì xúi bỏ bữa). */
export const TI_LE_BUA = {
  3: { sang: 0.30, trua: 0.40, toi: 0.30 },
  4: { sang: 0.30, trua: 0.35, chieu: 0.10, toi: 0.25 },
}

/* Thứ tự buổi cố định theo số bữa đã chọn. */
export const BUOI_THEO_SO_BUA = {
  3: ['sang', 'trua', 'toi'],
  4: ['sang', 'trua', 'chieu', 'toi'],
}

/* Task 3 (test/, chốt 02/08/2026) — chống lặp món xuyên ngày:
   - SO_UNG_VIEN_TOP: chỉ chọn trong nhóm N món điểm tốt nhất, không bao giờ
     rơi xuống giữa/cuối bảng xếp hạng.
   - KHOANG_CACH_CHONG_LAP: số ngày tối thiểu giữa 2 lần dùng cùng 1 món gốc
     (cùng ngày = khoảng cách 0 → loại).
   - BUOC_NOI_RONG_TOP: nhóm top hiện tại bị chống lặp loại sạch → nới rộng
     dần, không nhảy thẳng xuống toàn bảng. */
export const SO_UNG_VIEN_TOP = 3
export const KHOANG_CACH_CHONG_LAP = 2
export const BUOC_NOI_RONG_TOP = 2
