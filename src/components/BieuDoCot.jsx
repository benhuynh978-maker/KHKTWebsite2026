/* =========================================================================
   BIỂU ĐỒ CỘT — dùng chung ở Dashboard Khối 2 (rút gọn, không mốc) và
   trang Phân tích đầy đủ (có mốc cho mục Lộ trình).
   -------------------------------------------------------------------------
   Viết lại 29/7 theo khái niệm biểu đồ cột đầy đủ (trước đó chỉ có cột
   cao/thấp theo % khoảng chứa, không trục, không nhãn giá trị, không
   tương tác — "quá cơ bản"). Bản mới có:
     • Trục Y với gridline ở các mốc số TRÒN (không phải chia đều thô).
     • Cột chỉ bo góc ở ĐẦU cột, vuông ở đáy — mọc từ một đường gốc (0)
       chung, độ dày cột giới hạn tối đa để không chiếm hết ô cột.
     • Nhãn giá trị trực tiếp ở cột CUỐI (khoảng đang diễn ra, vd "Hôm
       nay") — không nhãn hết mọi cột để tránh rối, số còn lại đọc qua
       trục hoặc tooltip.
     • Tooltip khi di chuột/focus vào từng cột (bàn phím dùng Tab focus
       được, không chỉ chuột).
     • Bảng dữ liệu ẩn-chỉ-cho-trình-đọc-màn-hình đi kèm — số liệu vẫn
       đọc được mà không cần hover (không có gì bị "khoá sau" tương tác).
   Màu cột truyền vào qua prop `mau` — MỘT màu cố định cho MỖI chỉ số dinh
   dưỡng xuyên suốt cả app (xem tokens.css) — mặc định --nhan nếu không
   truyền, để không phá chỗ gọi cũ nào lỡ quên truyền prop.
   ========================================================================= */

import { useId, useState } from 'react'

function tinhTickDep(giaTriToiDa, soTickMongMuon = 4) {
  if (!(giaTriToiDa > 0)) return { tick: [0], max: 1 }

  const buocTho = giaTriToiDa / soTickMongMuon
  const bacSo = 10 ** Math.floor(Math.log10(buocTho))
  const phanDu = buocTho / bacSo
  const buoc = (phanDu > 5 ? 10 : phanDu > 2 ? 5 : phanDu > 1 ? 2 : 1) * bacSo

  const max = Math.ceil(giaTriToiDa / buoc) * buoc
  const tick = []
  for (let v = 0; v <= max + buoc * 1e-6; v += buoc) tick.push(Math.round(v * 100) / 100)
  return { tick, max }
}

function dinhDangSo(so) {
  return Math.round(so).toLocaleString('vi-VN')
}

export default function BieuDoCot({ duLieu, moc, donVi = '', mau = 'var(--nhan)', nhanChiSo }) {
  const idBang = useId()
  const [oHover, datOHover] = useState(null)

  const coKhoangThieu = duLieu.some((d) => d.khongCoDuLieu)
  const coDuLieuThat = duLieu.some((d) => !d.khongCoDuLieu && d.giaTri > 0)

  const giaTriLon = Math.max(
    ...duLieu.filter((d) => !d.khongCoDuLieu).map((d) => d.giaTri),
    moc ?? 0,
    0
  )
  const { tick, max: giaTriToiDa } = tinhTickDep(giaTriLon || 1)

  // Nhãn giá trị trực tiếp — CHỈ ở cột cuối (khoảng đang diễn ra), theo
  // nguyên tắc "label the endpoint... let the axis/tooltip carry the rest".
  const chiSoCotCuoiCoDuLieu = (() => {
    for (let i = duLieu.length - 1; i >= 0; i--) {
      if (!duLieu[i].khongCoDuLieu) return i
    }
    return -1
  })()

  return (
    <div className="bieu-do-cot-boc">
      <div className="bieu-do-cot-khung">
        <div className="bieu-do-cot__truc-y" aria-hidden="true">
          {[...tick].reverse().map((t) => (
            <span key={t} className="bieu-do-cot__tick-so">{dinhDangSo(t)}</span>
          ))}
        </div>

        <div className="bieu-do-cot-vung">
          {tick.map((t) => (
            <div
              key={t}
              className="bieu-do-cot__gridline"
              style={{ bottom: `${(t / giaTriToiDa) * 100}%` }}
              aria-hidden="true"
            />
          ))}

          {moc != null && (
            <div
              className="bieu-do-cot__duong-moc"
              style={{ bottom: `${Math.min((moc / giaTriToiDa) * 100, 100)}%` }}
            >
              <span className="bieu-do-cot__moc-nhan">
                Mốc {dinhDangSo(moc)}{donVi}
              </span>
            </div>
          )}

          <div className="bieu-do-cot">
            {duLieu.map((d, i) => (
              <div className="bieu-do-cot__muc" key={d.nhan}>
                <div className="bieu-do-cot__ranh">
                  {d.khongCoDuLieu ? (
                    <span className="bieu-do-cot__trong" title="Không có dữ liệu">–</span>
                  ) : (
                    <div
                      className="bieu-do-cot__cot-hit"
                      style={{ height: `${Math.max((d.giaTri / giaTriToiDa) * 100, d.giaTri > 0 ? 1.5 : 0)}%` }}
                      tabIndex={0}
                      role="img"
                      aria-label={`${d.nhan}: ${dinhDangSo(d.giaTri)}${donVi}`}
                      onMouseEnter={() => datOHover(i)}
                      onMouseLeave={() => datOHover((h) => (h === i ? null : h))}
                      onFocus={() => datOHover(i)}
                      onBlur={() => datOHover((h) => (h === i ? null : h))}
                    >
                      <div
                        className="bieu-do-cot__cot"
                        style={{ background: mau }}
                      />
                      {i === chiSoCotCuoiCoDuLieu && oHover !== i && (
                        <span className="bieu-do-cot__nhan-gia-tri">
                          {dinhDangSo(d.giaTri)}{donVi}
                        </span>
                      )}
                      {oHover === i && (
                        <div className="bieu-do-cot__tooltip" role="tooltip">
                          <strong>{dinhDangSo(d.giaTri)}{donVi}</strong>
                          <span>{d.nhan}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="bieu-do-cot__nhan">{d.nhan}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {coKhoangThieu && (
        <p className="bieu-do-cot__chu-thich">– : không có lộ trình chạy trong khoảng này</p>
      )}

      {!coDuLieuThat && !coKhoangThieu && (
        <p className="bieu-do-cot__chu-thich">Chưa có dữ liệu trong khoảng này.</p>
      )}

      {/* Bảng dữ liệu — CHỈ dành cho trình đọc màn hình, số liệu không bị
          "khoá sau" thao tác hover/focus (dataviz: "a table view exists"). */}
      <table className="chi-doc-man-hinh" id={idBang}>
        <caption>{nhanChiSo ?? 'Dữ liệu biểu đồ'}</caption>
        <thead>
          <tr><th scope="col">Khoảng</th><th scope="col">Giá trị</th></tr>
        </thead>
        <tbody>
          {duLieu.map((d) => (
            <tr key={d.nhan}>
              <th scope="row">{d.nhan}</th>
              <td>{d.khongCoDuLieu ? 'Không có dữ liệu' : `${dinhDangSo(d.giaTri)}${donVi}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
