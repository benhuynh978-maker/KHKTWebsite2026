/* Thẻ bao dùng chung cho các khối trên Dashboard và các trang khác.
   `nguonTrang` (tuỳ chọn) — CHỈ dùng ở Dashboard cho các khối tóm tắt/dẫn
   lối sang trang khác (Lộ trình, Phân tích, Ăn gì hôm nay, Quán ăn gần
   đây): một nhãn nhỏ nói rõ "khối này thuộc trang nào", để học sinh không
   phải bấm link "Xem thêm" mới biết đang xem cái gì. KHÔNG dùng ở chính
   trang đó (vd Lịch sử tự gọi Khoi cho tiêu đề của mình — đang Ở trang đó
   rồi thì gắn nhãn "Trang Lịch sử" là thừa). */
export default function Khoi({ tieuDe, phu, hanhDong, nguonTrang, children }) {
  return (
    <section className="khoi">
      {(tieuDe || hanhDong) && (
        <header className="khoi__dau">
          <div>
            {tieuDe && (
              <h2 className="khoi__tieu-de">
                {tieuDe}
                {nguonTrang && <span className="khoi__nguon-trang">{nguonTrang}</span>}
              </h2>
            )}
            {phu && <p className="khoi__phu">{phu}</p>}
          </div>
          {hanhDong}
        </header>
      )}
      <div className="khoi__than">{children}</div>
    </section>
  )
}
