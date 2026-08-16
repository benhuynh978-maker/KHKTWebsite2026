/* =========================================================================
   "GHI NHẬN ĐÃ ĂN/UỐNG" THẬT — modal tìm/chọn 1 sản phẩm phụ trợ CÓ
   THƯƠNG HIỆU (san_pham_phu_tro, đã duyệt) rồi ghi vào phu_tro_ghi_nhan.
   Thêm 14/08/2026, mở từ khối "Có thể bổ sung thêm" trong KhoiGoiYNhanh.jsx.

   Nổi NGOÀI dải cuộn ngang (.dai-ngang) của khối chat — KHÔNG nhúng dropdown
   trực tiếp vào thẻ món như test/'s widget gốc (index.html, không phải
   chat): .dai-ngang có overflow-x:auto nên overflow-y cũng tự thành auto
   theo spec CSS, sẽ CẮT MẤT bất kỳ dropdown position:absolute nào cố trồi
   ra ngoài cột 168px. Modal (position:fixed, giống ModalMon/BangBinhLuan)
   né hẳn vấn đề đó, không cần cơ chế :has()/margin-reservation của
   test/style.css.

   Luồng: tìm kiếm → chọn 1 sản phẩm → xác nhận → lưu (PHẢI await, id do
   CSDL tự sinh — xem ghi chú đầu data/supabase/khoGhiNhanPhuTro.js). KHÔNG
   có bước "gửi sản phẩm mới" (khác widget gốc của test/) — ngoài phạm vi
   đợt này, chỉ tìm trong sản phẩm đã có sẵn. */

import { useMemo, useState } from 'react'
import { timSanPhamPhuTro, ghiNhanDaAnPhuTro } from '../data/api.js'
import { useDongBangEsc } from '../lib/dongBangEsc.js'
import MienTru from './MienTru.jsx'

export default function GhiNhanPhuTro({ tuKhoaBanDau, diUngDaChon, onDong, onGhiNhanXong }) {
  useDongBangEsc(onDong)
  const [tuKhoa, datTuKhoa] = useState(tuKhoaBanDau ?? '')
  const [spDangXacNhan, datSpDangXacNhan] = useState(null)
  const [dangLuu, datDangLuu] = useState(false)
  const [loi, datLoi] = useState('')
  const [daXong, datDaXong] = useState(false)

  const ketQua = useMemo(() => timSanPhamPhuTro(tuKhoa, diUngDaChon), [tuKhoa, diUngDaChon])

  const xacNhan = async () => {
    datDangLuu(true)
    datLoi('')
    const kq = await ghiNhanDaAnPhuTro(spDangXacNhan)
    datDangLuu(false)
    if (!kq.ok) { datLoi(kq.loi); return }
    datDaXong(true)
    onGhiNhanXong?.()
  }

  return (
    <div className="modal-nen ghi-nhan-phu-tro-nen" onClick={onDong}>
      <div className="modal-mon" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-mon__dong" onClick={onDong} type="button" aria-label="Đóng">✕</button>

        <div className="modal-mon__than">
          <h3 className="modal-mon__ten">Ghi nhận đã ăn/uống</h3>

          {daXong ? (
            <>
              <p className="modal-mon__da-ghi">✓ Đã ghi nhận: {spDangXacNhan.ten}.</p>
              <button className="nut nut--chinh nut--rong" onClick={onDong} type="button">Đóng</button>
            </>
          ) : spDangXacNhan ? (
            <div className="ghi-nhan-phu-tro ghi-nhan-phu-tro__xac-nhan">
              <p>
                Xác nhận đã ăn/uống: {spDangXacNhan.ten} ({spDangXacNhan.khoi_luong}{spDangXacNhan.don_vi})?
              </p>
              {loi && <p className="loi-form">{loi}</p>}
              <button className="nut nut--chinh nut--rong" onClick={xacNhan} type="button" disabled={dangLuu}>
                {dangLuu ? 'Đang ghi nhận...' : 'Xác nhận đã ăn'}
              </button>
              <button
                className="ghi-nhan-phu-tro__huy chu-nhat chu-nho"
                onClick={() => datSpDangXacNhan(null)}
                type="button"
                disabled={dangLuu}
              >
                Quay lại danh sách
              </button>
            </div>
          ) : (
            <div className="ghi-nhan-phu-tro">
              <input
                type="text"
                className="ghi-nhan-phu-tro__o-tim"
                placeholder="Tìm sản phẩm đã ăn/uống..."
                value={tuKhoa}
                onChange={(e) => datTuKhoa(e.target.value)}
                autoFocus
              />
              <div className="ghi-nhan-phu-tro__ds">
                {ketQua.length === 0 ? (
                  <p className="chu-nhat chu-nho">Không tìm thấy sản phẩm phù hợp — thử từ khoá khác.</p>
                ) : (
                  ketQua.map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      className="ghi-nhan-phu-tro__muc"
                      onClick={() => datSpDangXacNhan(sp)}
                    >
                      {sp.ten} ({sp.khoi_luong}{sp.don_vi})
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <MienTru gonGang />
        </div>
      </div>
    </div>
  )
}
