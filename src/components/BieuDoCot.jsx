/* =========================================================================
   BIỂU ĐỒ CỘT — dùng chung ở Dashboard Khối 2 (rút gọn, không mốc) và
   trang Phân tích đầy đủ (có mốc cho mục Lộ trình).
   -------------------------------------------------------------------------
   "Kế hoạch trang Dashboard" §4: "bản rút gọn của trang Phân tích đầy đủ
   — biểu đồ cột, không phần trăm... CHỈ mục Lộ trình có đường mốc tham
   chiếu — hai mục còn lại không có mốc." Component này nhận `moc` là
   OPTIONAL — không truyền thì không vẽ đường mốc, đúng 2/3 mục còn lại.
   ========================================================================= */

export default function BieuDoCot({ duLieu, moc, donVi = '' }) {
  const coKhoangThieu = duLieu.some((d) => d.khongCoDuLieu)
  const giaTriToiDa = Math.max(
    ...duLieu.filter((d) => !d.khongCoDuLieu).map((d) => d.giaTri),
    moc ?? 0,
    1
  )

  return (
    <div className="bieu-do-cot-boc">
      {moc != null && (
        <div className="bieu-do-cot__duong-moc" style={{ bottom: `${(moc / giaTriToiDa) * 100}%` }}>
          <span className="bieu-do-cot__moc-nhan">Mốc {Math.round(moc).toLocaleString('vi-VN')}{donVi}</span>
        </div>
      )}
      <div className="bieu-do-cot">
        {duLieu.map((d) => (
          <div className="bieu-do-cot__muc" key={d.nhan}>
            <div className="bieu-do-cot__ranh">
              {d.khongCoDuLieu ? (
                <span className="bieu-do-cot__trong" title="Không có dữ liệu">–</span>
              ) : (
                <div
                  className="bieu-do-cot__cot"
                  style={{ height: `${(d.giaTri / giaTriToiDa) * 100}%` }}
                />
              )}
            </div>
            <span className="bieu-do-cot__nhan">{d.nhan}</span>
          </div>
        ))}
      </div>
      {coKhoangThieu && (
        <p className="bieu-do-cot__chu-thich">– : không có lộ trình chạy trong khoảng này</p>
      )}
    </div>
  )
}
