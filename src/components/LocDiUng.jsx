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
     tài liệu nêu rõ. Ban đầu đặt mặc định "không lọc" ở đây để đối xứng
     với 3 bộ lọc còn lại (đều mặc định không áp dụng).

     Sửa 29/7 (yêu cầu trực tiếp, đi khác quyết định cũ ở trên — tài liệu
     cho phép "quyết định khi dựng thật"): đổi mặc định thành "Theo hồ sơ
     của tôi". Đây là trang vẫn cho xác nhận ăn ngay tại chỗ — mặc định an
     toàn hơn thắng nguyên tắc đối xứng với 3 lọc sở thích còn lại (giá/
     khoảng cách/buổi bán), học sinh vẫn có thể tự đổi qua "Lọc" bất cứ
     lúc nào. Đặt default state ở AnGiHomNay.jsx/QuanAnGanDay.jsx, không
     đổi gì trong component này.

   -------------------------------------------------------------------------
   CẬP NHẬT (theo yêu cầu trực tiếp, không thuộc tài liệu kế hoạch):
   Nút "Không lọc" cũ là ngõ cụt — học sinh không lọc-thêm được dị ứng
   ngoài hồ sơ, cũng không bớt được một vài dị ứng trong hồ sơ cho lần
   duyệt này. Đổi nút đó thành "Lọc": bấm vào sẽ mở khung tick-box gồm
   14 nhóm dị ứng (mặc định tick sẵn theo hồ sơ để học sinh thêm/bớt) +
   một ô "Không lọc" nằm chung khung. Tick "Không lọc" sẽ khoá (disabled)
   14 ô còn lại — không cho chọn thêm trong lúc đang ở trạng thái này.
   ========================================================================= */

import { layNhomDiUng } from '../data/api.js'

export default function LocDiUng({ giaTri, onDoi }) {
  const { cheDo, dsChon, khongLoc } = giaTri

  const doiCheDo = (cheDoMoi) => onDoi({ ...giaTri, cheDo: cheDoMoi })

  const doiDiUngChon = (ma) => {
    const dsMoi = dsChon.includes(ma) ? dsChon.filter((d) => d !== ma) : [...dsChon, ma]
    onDoi({ ...giaTri, dsChon: dsMoi })
  }

  const doiKhongLoc = (e) => onDoi({ ...giaTri, khongLoc: e.target.checked })

  return (
    <div className="loc-di-ung">
      <div className="loc-di-ung__nut-nhom" role="radiogroup" aria-label="Bộ lọc an toàn dị ứng">
        <button
          type="button"
          className={`loc-di-ung__nut${cheDo === 'theo_ho_so' ? ' loc-di-ung__nut--dang-bat' : ''}`}
          onClick={() => doiCheDo('theo_ho_so')}
        >
          ⚠ Theo hồ sơ của tôi
        </button>
        <button
          type="button"
          className={`loc-di-ung__nut${cheDo === 'tuy_chinh' ? ' loc-di-ung__nut--dang-bat' : ''}`}
          onClick={() => doiCheDo('tuy_chinh')}
        >
          Lọc
        </button>
      </div>

      {cheDo === 'theo_ho_so' && (
        <p className="loc-di-ung__trang-thai">Đang lọc theo hồ sơ của tôi</p>
      )}

      {cheDo === 'tuy_chinh' && (
        <div className="loc-di-ung__khung">
          <div className="chon-di-ung">
            {layNhomDiUng().map((n) => (
              <label
                key={n.ma}
                className={`chon-di-ung__muc${khongLoc ? ' chon-di-ung__muc--khoa' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={dsChon.includes(n.ma)}
                  disabled={khongLoc}
                  onChange={() => doiDiUngChon(n.ma)}
                />
                <span>{n.ten}</span>
              </label>
            ))}

            <label className="chon-di-ung__muc chon-di-ung__muc--khong-loc">
              <input type="checkbox" checked={khongLoc} onChange={doiKhongLoc} />
              <span>Không lọc</span>
            </label>
          </div>

          <p className="loc-di-ung__trang-thai">
            {khongLoc
              ? 'Không lọc — hiển thị tất cả'
              : dsChon.length > 0
                ? `Đang lọc ${dsChon.length} nhóm dị ứng đã chọn`
                : 'Chưa chọn nhóm dị ứng nào — chưa lọc'}
          </p>
        </div>
      )}
    </div>
  )
}
