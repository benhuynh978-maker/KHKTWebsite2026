/* =========================================================================
   KHAI BÁO TOOL CHO GEMINI — port từ test/chat-server/tool-schema.js
   (07/08/2026, Pha 1). Bọc ĐÚNG 6 box của `Website/src/lib/box.js` — GIỮ
   NGUYÊN logic, chỉ đổi khuôn từ CommonJS sang ESM (Website package.json
   khai "type":"module"). Tool CHẠY Ở CLIENT (KhoiGoiYNhanh.jsx), server chỉ
   khai báo schema cho Gemini biết "có gì gọi được", không tự thực thi.

   Khác test/: KHÔNG có tieu_chi "gia_toi_da" riêng (Website chưa port box
   `gioiHan` — chưa nút nào dùng tới) — "gia_toi_da" gộp chung xử lý với
   "goi_y" ở KhoiGoiYNhanh.jsx (cùng dùng box `nhanh`, chỉ khác có kèm giá
   trần hay không, xem locTheoGiaToiDa đã áp dụng sẵn trong mọi box). */

const DI_UNG_MO_TA =
  'Danh sách mã dị ứng học sinh TỰ NÓI ra trong lúc chat (không tự suy đoán, '
  + 'không lấy từ nguồn nào khác). Chỉ dùng đúng mã trong tập: ngu_coc_gluten, '
  + 'giap_xac, trung, ca, lac, dau_nanh, sua, hat_cay, can_tay, mu_tat, vung, '
  + 'sulfit, dau_lupin, nhuyen_the.'

const BUOI_MO_TA = 'Buổi nếu có nhắc, bỏ trống nếu không rõ.'
const BUOI_ENUM = ['sang', 'trua', 'chieu', 'toi']
const SO_LUONG_MO_TA = 'Số món muốn, 1-3, mặc định 1.'
const LOAI_TRU_QUAN_MO_TA = 'Tên quán CẦN TRÁNH (vd học sinh xin "quán khác", "đừng quán vừa rồi" — lấy đúng tên quán đã thấy trong kết quả tool trước đó, không suy đoán).'

export const danhSachTool = [
  {
    name: 'tim_mon',
    description:
      'Tìm 1-3 món ăn phù hợp dinh dưỡng nhất theo tiêu chí. `tieu_chi`: '
      + '"goi_y" = gợi ý chung không giới hạn giá (hỏi chung chung "gợi ý '
      + 'món ăn"/"ăn gì bây giờ"); "gia_toi_da" = có ngân sách cụ thể (BẮT '
      + 'BUỘC kèm gia_toi_da, vd "dưới 30k"); "re_nhat" = hỏi thẳng "món '
      + 'nào rẻ nhất" mà không nêu số tiền cụ thể; "nhieu_dam" = hỏi rõ '
      + 'muốn nhiều đạm; "nhieu_canxi" = hỏi rõ muốn nhiều canxi/tốt cho '
      + 'xương; "nhieu_sat" = hỏi rõ muốn nhiều sắt/bổ máu; "nhieu_kem" = '
      + 'hỏi rõ muốn nhiều kẽm/tăng đề kháng (không dùng cho câu hỏi calo/'
      + 'dinh dưỡng chung).',
    parameters: {
      type: 'object',
      properties: {
        tieu_chi: { type: 'string', enum: ['goi_y', 'gia_toi_da', 're_nhat', 'nhieu_dam', 'nhieu_canxi', 'nhieu_sat', 'nhieu_kem'] },
        gia_toi_da: { type: 'number', description: 'Giá tối đa tính bằng đồng (vd 30000 cho "30k"). Bắt buộc khi tieu_chi="gia_toi_da"; có thể kèm thêm ở BẤT KỲ tieu_chi nào khác để giới hạn ngân sách đồng thời (vd "nhiều đạm mà dưới 40k" → tieu_chi="nhieu_dam" + gia_toi_da=40000 trong CÙNG 1 lượt gọi, không cần gọi tool 2 lần).' },
        buoi: { type: 'string', enum: BUOI_ENUM, description: BUOI_MO_TA },
        di_ung: { type: 'array', items: { type: 'string' }, description: DI_UNG_MO_TA },
        so_luong: { type: 'number', description: SO_LUONG_MO_TA },
        loai_tru_quan: { type: 'array', items: { type: 'string' }, description: LOAI_TRU_QUAN_MO_TA },
      },
      required: ['tieu_chi'],
    },
  },
  {
    name: 'tra_cuu_mon_theo_ten',
    description:
      'Tra cứu giá/dinh dưỡng/quán bán/giờ bán theo TÊN hoặc TỪ KHOÁ (có '
      + 'thể là tên món cụ thể HOẶC từ khoá/loại chung, vd "nước", "trà", '
      + '"gà"). Dùng khi học sinh hỏi về 1 món/loại đã nêu tên (vd "cơm sườn '
      + 'bao nhiêu calo", "món X quán nào bán") HOẶC hỏi "có ... không" '
      + '(vd "có trà sữa không") — LUÔN tra tool này trước khi trả lời có '
      + 'hay không, KHÔNG tự đoán. KHÔNG dùng để xếp hạng/so sánh nhiều món '
      + 'khác tên nhau.',
    parameters: {
      type: 'object',
      properties: {
        ten_mon: { type: 'string', description: 'Tên món hoặc từ khoá học sinh nhắc tới, có thể không chính xác 100% (không cần đúng dấu).' },
        loai_tru_quan: { type: 'array', items: { type: 'string' }, description: LOAI_TRU_QUAN_MO_TA },
      },
      required: ['ten_mon'],
    },
  },
  {
    name: 'tra_cuu_quan',
    description:
      'Tra cứu QUÁN ĂN theo tên (giờ mở cửa, ngày nghỉ nếu có, số món, vài '
      + 'món tiêu biểu, khoảng cách tới trường nếu có). Để trống ten_quan '
      + 'để lấy DANH SÁCH TẤT CẢ quán, SẮP THEO GẦN NHẤT TRƯỚC — dùng cho '
      + '"quán X mấy giờ mở/bán gì", "trong hệ thống có quán nào", "gợi ý '
      + 'quán quanh trường". Thêm trong_ban_kinh_km để lọc "quán trong bán '
      + 'kính Xkm". Khoảng cách là SỐ ƯỚC LƯỢNG do khảo sát nhập tay (không '
      + 'phải định vị GPS chính xác) — nói "khoảng X km", không nói chắc '
      + 'như đo tự động; quán chưa có số liệu thì nói rõ chưa khảo sát, '
      + 'không tự ước lượng thêm.',
    parameters: {
      type: 'object',
      properties: {
        ten_quan: { type: 'string', description: 'Tên hoặc từ khoá quán. Để trống để lấy toàn bộ danh sách.' },
        trong_ban_kinh_km: { type: 'number', description: 'Chỉ lấy quán CÓ khoảng cách và ≤ số này (km). Bỏ trống nếu không giới hạn.' },
      },
    },
  },
]
