/* =========================================================================
   DỮ LIỆU GIẢ — Bảng `quan` (Khu vực 4: Dữ liệu tham chiếu Quán & Món)
   Schema theo: "Kế hoạch trang Ăn gì hôm nay" §8.2
   -------------------------------------------------------------------------
   ⚠ TOÀN BỘ SỐ LIỆU DƯỚI ĐÂY LÀ DEMO, KHÔNG PHẢI DỮ LIỆU THỰC ĐỊA.
     Tài liệu "Ăn gì hôm nay" §4.1 đã ghi rõ: khoảng cách và giờ hoạt động
     hiện đang ở dạng DEMO vì chưa có GPS thật / giờ mở cửa thật.
     Khi có dữ liệu thu thập thật, thay file này, không sửa giao diện.
   ========================================================================= */

export const DANH_SACH_QUAN = [
  {
    id: 'q01',
    ten_quan: 'Căng tin trường',
    loai_hinh: 'cang_tin',
    dia_chi: 'Khu A, trong khuôn viên trường',
    khoang_cach_m: 0,
    khoang_gio_hoat_dong: '06:00 – 18:00',
    ngay_ban_va_nghi: 'Thứ 2 – Thứ 7 · Nghỉ Chủ nhật',
    so_dien_thoai: '028 3822 0011',
    anh_url: null,
  },
  {
    id: 'q02',
    ten_quan: 'Quán Bà Tư',
    loai_hinh: 'quan_ngoai',
    dia_chi: '12 Nguyễn Văn Cừ',
    khoang_cach_m: 250,
    khoang_gio_hoat_dong: '10:30 – 21:00',
    ngay_ban_va_nghi: 'Cả tuần',
    so_dien_thoai: '0903 112 233',
    anh_url: null,
  },
  {
    id: 'q03',
    ten_quan: 'Cơm tấm Ba Long',
    loai_hinh: 'quan_ngoai',
    dia_chi: '45 Trần Hưng Đạo',
    khoang_cach_m: 400,
    khoang_gio_hoat_dong: '06:00 – 22:00',
    ngay_ban_va_nghi: 'Cả tuần',
    so_dien_thoai: '0912 445 566',
    anh_url: null,
  },
  {
    id: 'q04',
    ten_quan: 'Bún bò O Hạnh',
    loai_hinh: 'quan_ngoai',
    dia_chi: '8 Hẻm 220 Lê Lợi',
    khoang_cach_m: 550,
    khoang_gio_hoat_dong: '06:00 – 13:00 · 17:00 – 21:00',
    ngay_ban_va_nghi: 'Thứ 2 – Thứ 7 · Nghỉ Chủ nhật',
    so_dien_thoai: '0988 776 554',
    anh_url: null,
  },
  {
    id: 'q05',
    ten_quan: 'Phở Hà Nội 79',
    loai_hinh: 'quan_ngoai',
    dia_chi: '79 Nguyễn Trãi',
    khoang_cach_m: 700,
    khoang_gio_hoat_dong: '05:30 – 14:00',
    ngay_ban_va_nghi: 'Cả tuần',
    so_dien_thoai: '0977 334 221',
    anh_url: null,
  },
  {
    id: 'q06',
    ten_quan: 'Bánh mì Chị Hoa',
    loai_hinh: 'quan_ngoai',
    dia_chi: 'Góc đường Lê Lợi – Cách Mạng',
    khoang_cach_m: 180,
    khoang_gio_hoat_dong: '05:00 – 10:00 · 15:00 – 19:00',
    ngay_ban_va_nghi: 'Cả tuần',
    so_dien_thoai: '0909 887 665',
    anh_url: null,
  },
  {
    id: 'q07',
    ten_quan: 'Quán chay Sen',
    loai_hinh: 'quan_ngoai',
    dia_chi: '30 Phan Bội Châu',
    khoang_cach_m: 620,
    khoang_gio_hoat_dong: '10:00 – 20:00',
    ngay_ban_va_nghi: 'Cả tuần',
    so_dien_thoai: '0938 221 447',
    anh_url: null,
  },
]
