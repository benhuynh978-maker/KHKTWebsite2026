/* =========================================================================
   DANH SÁCH DỊ ỨNG CỐ ĐỊNH — 14 nhóm theo Quy định (EU) số 1169/2011,
   Phụ lục II. Nguồn: "Kế hoạch trang Hồ sơ & Cài đặt" §2.1.1.
   -------------------------------------------------------------------------
   Đây là VỐN TỪ DÙNG CHUNG giữa hai phía:
     • Hồ sơ học sinh  → cột di_ung[]
     • Bảng mon        → cột thanh_phan_di_ung[]
   Cả hai bắt buộc chỉ dùng mã trong file này. Nếu một phía cho gõ tự do,
   bộ lọc "An toàn dị ứng" mất khả năng so khớp → mất tác dụng bảo vệ.

   §2.1.1 cũng ghi rõ giới hạn đã biết của thiết kế này: học sinh có dị ứng
   NGOÀI 14 nhóm (hiếm) không khai báo được qua form, cần kênh dự phòng
   qua form Liên hệ hỗ trợ (§3.4).
   ========================================================================= */

export const NHOM_DI_UNG = [
  { ma: 'ngu_coc_gluten', ten: 'Ngũ cốc chứa gluten', vi_du: 'lúa mì, lúa mạch đen, lúa mạch, yến mạch' },
  { ma: 'giap_xac',       ten: 'Giáp xác',            vi_du: 'tôm, cua' },
  { ma: 'trung',          ten: 'Trứng',               vi_du: '' },
  { ma: 'ca',             ten: 'Cá',                  vi_du: 'kể cả nước mắm, mắm ruốc' },
  { ma: 'lac',            ten: 'Lạc (đậu phộng)',     vi_du: '' },
  { ma: 'dau_nanh',       ten: 'Đậu nành',            vi_du: 'nước tương, đậu hũ, dầu đậu nành' },
  { ma: 'sua',            ten: 'Sữa và chế phẩm sữa', vi_du: 'sữa đặc, phô mai, bơ' },
  { ma: 'hat_cay',        ten: 'Các loại hạt cây',    vi_du: 'hạnh nhân, óc chó, hạt điều, hạt dẻ, mắc ca' },
  { ma: 'can_tay',        ten: 'Cần tây',             vi_du: '' },
  { ma: 'mu_tat',         ten: 'Mù tạt',              vi_du: '' },
  { ma: 'vung',           ten: 'Vừng (mè)',           vi_du: 'dầu mè, muối mè' },
  { ma: 'sulfit',         ten: 'Sulfit',              vi_du: 'chất bảo quản trong đồ khô, mứt' },
  { ma: 'dau_lupin',      ten: 'Đậu lupin',           vi_du: '' },
  { ma: 'nhuyen_the',     ten: 'Nhuyễn thể',          vi_du: 'ốc, sò, mực, bạch tuộc' },
]

const BANG_TRA = Object.fromEntries(NHOM_DI_UNG.map((n) => [n.ma, n]))

/** Đổi mã dị ứng → tên tiếng Việt để hiển thị. */
export const tenDiUng = (ma) => BANG_TRA[ma]?.ten ?? ma
