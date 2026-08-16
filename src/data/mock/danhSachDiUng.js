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

   Thêm 12/08/2026 — cột `giai_thich`: nội dung cách gọi dân dã + ví dụ,
   dùng cho icon "i" ở form đề xuất món (ChonDiUngCoGiaiThich.jsx), giúp
   học sinh không rành thuật ngữ vẫn tick đúng. Nội dung 6 nhóm khó hiểu
   (giáp xác, nhuyễn thể, ngũ cốc gluten, hạt cây, sulfit, đậu lupin) do
   người dùng cung cấp trực tiếp; 8 nhóm còn lại AI viết thêm theo cùng
   văn phong để dùng chung 1 kiểu hiển thị. */

export const NHOM_DI_UNG = [
  {
    ma: 'ngu_coc_gluten', ten: 'Ngũ cốc chứa gluten', vi_du: 'lúa mì, lúa mạch đen, lúa mạch, yến mạch',
    giai_thich: 'Lúa mì, lúa mạch (bột mì) — các loại ngũ cốc làm ra bánh mì, mì ống, bánh quy, bia.',
  },
  {
    ma: 'giap_xac', ten: 'Giáp xác', vi_du: 'tôm, cua',
    giai_thich: 'Tôm, cua, ghẹ — các loại hải sản vỏ cứng (tôm hùm, tôm sông, cua, ghẹ).',
  },
  {
    ma: 'trung', ten: 'Trứng', vi_du: '',
    giai_thich: 'Trứng gà, trứng vịt, trứng cút và các món/nước sốt có trứng (mayonnaise, bánh có trứng...).',
  },
  {
    ma: 'ca', ten: 'Cá', vi_du: 'kể cả nước mắm, mắm ruốc',
    giai_thich: 'Các loại cá và nước chấm làm từ cá — kể cả nước mắm, mắm ruốc.',
  },
  {
    ma: 'lac', ten: 'Lạc (đậu phộng)', vi_du: '',
    giai_thich: 'Đậu phộng và các món/nước sốt có đậu phộng (sốt sa tế, kẹo lạc, bơ đậu phộng...).',
  },
  {
    ma: 'dau_nanh', ten: 'Đậu nành', vi_du: 'nước tương, đậu hũ, dầu đậu nành',
    giai_thich: 'Đậu nành và chế phẩm — nước tương, đậu hũ, dầu đậu nành, sữa đậu nành.',
  },
  {
    ma: 'sua', ten: 'Sữa và chế phẩm sữa', vi_du: 'sữa đặc, phô mai, bơ',
    giai_thich: 'Sữa bò/sữa dê và chế phẩm — sữa đặc, phô mai, bơ, kem tươi.',
  },
  {
    ma: 'hat_cay', ten: 'Các loại hạt cây', vi_du: 'hạnh nhân, óc chó, hạt điều, hạt dẻ, mắc ca',
    giai_thich: 'Hạt khô vỏ cứng — hạnh nhân, óc chó, hạt điều, hạt dẻ, mắc ca (phân biệt với lạc/đậu phộng).',
  },
  {
    ma: 'can_tay', ten: 'Cần tây', vi_du: '',
    giai_thich: 'Rau cần tây và bột/nước cốt cần tây trong một số món súp, nước sốt.',
  },
  {
    ma: 'mu_tat', ten: 'Mù tạt', vi_du: '',
    giai_thich: 'Mù tạt vàng/xanh và nước sốt có mù tạt (sốt mayonnaise, sốt salad...).',
  },
  {
    ma: 'vung', ten: 'Vừng (mè)', vi_du: 'dầu mè, muối mè',
    giai_thich: 'Hạt mè/vừng, dầu mè, muối mè, bánh có rắc mè.',
  },
  {
    ma: 'sulfit', ten: 'Sulfit', vi_du: 'chất bảo quản trong đồ khô, mứt',
    giai_thich: 'Chất bảo quản Sulfit — phụ gia chống mốc/giữ màu, hay có trong rượu vang, hoa quả sấy khô, mứt.',
  },
  {
    ma: 'dau_lupin', ten: 'Đậu lupin', vi_du: '',
    giai_thich: 'Đậu Lupin (đậu hạt lớn) — loại đậu phổ biến ở Châu Âu, thường nghiền thành bột bánh hoặc ăn hạt.',
  },
  {
    ma: 'nhuyen_the', ten: 'Nhuyễn thể', vi_du: 'ốc, sò, mực, bạch tuộc',
    giai_thich: 'Nghêu, sò, ốc, mực — hải sản thân mềm (nghêu, sò, ốc, hến, mực, bạch tuộc).',
  },
]

const BANG_TRA = Object.fromEntries(NHOM_DI_UNG.map((n) => [n.ma, n]))

/** Đổi mã dị ứng → tên tiếng Việt để hiển thị. */
export const tenDiUng = (ma) => BANG_TRA[ma]?.ten ?? ma
