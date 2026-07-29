/* =========================================================================
   BỘ LỌC AN TOÀN DỊ ỨNG — component riêng, không gộp vào các bộ lọc khác
   -------------------------------------------------------------------------
   "Ăn gì hôm nay" §7.2: "Tách riêng khỏi 3 lọc còn lại bằng đường phân
   cách. Tông cảnh báo (icon, màu) khác với tông trung tính của 3 lọc còn
   lại — vì đây là an toàn sức khoẻ, không phải sở thích cá nhân như giá/
   khoảng cách/buổi bán. Hiện rõ trạng thái đang bật thay vì để trống như
   các ô khác." Dùng token --mau-di-ung (tokens.css) — màu cảnh báo DUY
   NHẤT của hệ thống, không dùng cho việc gì khác.

   ⚠ Giá trị mặc định (§7.1: "Theo hồ sơ của tôi / Không lọc") KHÔNG được
     tài liệu nêu rõ. Đặt mặc định "Không lọc" ở đây để đối xứng với 3 bộ
     lọc còn lại (đều mặc định không áp dụng) — đây là một điểm cần bạn
     xác nhận, không phải quyết định tự ý thêm an toàn ngoài tài liệu.
   ========================================================================= */

export default function LocDiUng({ giaTri, onDoi }) {
  return (
    <div className="loc-di-ung">
      <div className="loc-di-ung__nut-nhom" role="radiogroup" aria-label="Bộ lọc an toàn dị ứng">
        <button
          type="button"
          className={`loc-di-ung__nut${giaTri === 'theo_ho_so' ? ' loc-di-ung__nut--dang-bat' : ''}`}
          onClick={() => onDoi('theo_ho_so')}
        >
          ⚠ Theo hồ sơ của tôi
        </button>
        <button
          type="button"
          className={`loc-di-ung__nut${giaTri === 'khong_loc' ? ' loc-di-ung__nut--dang-bat' : ''}`}
          onClick={() => onDoi('khong_loc')}
        >
          Không lọc
        </button>
      </div>

      {giaTri === 'theo_ho_so' && (
        <p className="loc-di-ung__trang-thai">Đang lọc theo hồ sơ của tôi</p>
      )}
    </div>
  )
}
