/* =========================================================================
   HIỂN THỊ SAO TRUNG BÌNH — CHỈ ĐỌC, đặt cạnh giá món (ModalMon.jsx).
   -------------------------------------------------------------------------
   Sửa 29/7 (theo yêu cầu riêng): ban đầu ô này VỪA hiện vừa cho bấm gửi
   sao — đổi lại theo hướng UI đánh giá sao phổ biến (Shopee/Tiki/Google
   Play...): nơi hiện trung bình luôn CHỈ ĐỌC, tách khỏi nơi NGƯỜI DÙNG TỰ
   CHỌN sao (đã chuyển qua ChonSao.jsx, đặt trong bảng bình luận — nơi
   người dùng thường thấy ô "Viết đánh giá" trong các app tương tự).

   Mỗi sao tô theo TỈ LỆ đúng phần thập phân của điểm trung bình (vd 4.3 →
   sao thứ 5 tô 30%) bằng cách chồng 1 lớp sao vàng lên sao nền xám, cắt
   theo width % — kỹ thuật CSS quen thuộc cho rating tĩnh, không cần ảnh. */

export default function DanhGiaSao({ trungBinh, soLuot }) {
  if (trungBinh == null) {
    return (
      <div className="danh-gia-sao danh-gia-sao--rong">
        <div className="danh-gia-sao__sao" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((sao) => (
            <span className="danh-gia-sao__o" key={sao}>
              <span className="danh-gia-sao__nen">★</span>
            </span>
          ))}
        </div>
        <p className="danh-gia-sao__tom-tat chu-be chu-nhat">Chưa có đánh giá</p>
      </div>
    )
  }

  return (
    <div className="danh-gia-sao" aria-label={`${trungBinh.toFixed(1)} trên 5 sao, ${soLuot} lượt đánh giá`}>
      <div className="danh-gia-sao__sao" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((sao) => {
          const tiLe = Math.max(0, Math.min(1, trungBinh - (sao - 1))) * 100
          return (
            <span className="danh-gia-sao__o" key={sao}>
              <span className="danh-gia-sao__nen">★</span>
              <span className="danh-gia-sao__day" style={{ width: `${tiLe}%` }}>★</span>
            </span>
          )
        })}
      </div>
      <p className="danh-gia-sao__tom-tat chu-be chu-nhat">
        <strong className="chu-nhat">{trungBinh.toFixed(1)}</strong> · {soLuot} lượt đánh giá
      </p>
    </div>
  )
}
