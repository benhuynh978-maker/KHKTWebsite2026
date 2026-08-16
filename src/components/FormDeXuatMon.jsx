/* =========================================================================
   FORM ĐỀ XUẤT QUÁN/MÓN — nút "+" ở trang "Quán ăn gần đây" (12/08/2026).
   -------------------------------------------------------------------------
   LUÔN gộp quán + món trong CÙNG 1 lần gửi (xem khoDeXuatMonQuan.js) —
   không có nhánh "chỉ gửi quán". Bước 1 bắt buộc tìm quán trước (kể cả
   quán đang chờ duyệt) để giảm trùng lặp trước khi cho phép khai "quán
   mới" — xem thảo luận 12/08/2026.

   Ảnh BẮT BUỘC (yêu cầu riêng khi bàn tính năng) — không cho gửi thiếu ảnh.

   Thêm 12/08/2026 (yêu cầu riêng, đợt 2) — so khớp lại field so với dữ
   liệu "thực địa" khảo sát tay, bổ sung field quán CHỈ hỏi khi tạo quán
   MỚI (quán có sẵn giữ nguyên dữ liệu đã có):
     - loại hình + giờ mở/đóng ca 1: BẮT BUỘC — giờ ca 1 ảnh hưởng THẬT tới
       lọc buổi của mọi món thuộc quán (buoiKhopQuan(), khoVi4.js), không
       phải chỉ thiếu thông tin hiển thị.
     - ca 2, ngày nghỉ, SĐT: tuỳ chọn.
   Field món mới: cay (tuỳ chọn) + tick 14 nhóm dị ứng chuẩn kèm giải thích
   (ChonDiUngCoGiaiThich.jsx, tuỳ chọn — không tick gì vẫn gửi được, giữ cơ
   chế an toàn "chưa kiểm" như cũ, xem khoDeXuatMonQuan.js). */

import { useState } from 'react'
import { timQuanTheoTen, guiDeXuatMonQuan } from '../data/supabase/khoDeXuatMonQuan.js'
import ChonDiUngCoGiaiThich from './ChonDiUngCoGiaiThich.jsx'
import { useDongBangEsc } from '../lib/dongBangEsc.js'

const KICH_THUOC_ANH_TOI_DA_MB = 5

export default function FormDeXuatMon({ onDong }) {
  useDongBangEsc(onDong)
  const [tuKhoaQuan, datTuKhoaQuan] = useState('')
  const [dangTimQuan, datDangTimQuan] = useState(false)
  const [ketQuaTimQuan, datKetQuaTimQuan] = useState(null) // null = chưa tìm, [] = tìm rồi nhưng rỗng
  const [quanDaChon, datQuanDaChon] = useState(null) // { ma_quan, ten_quan } | null
  const [laQuanMoi, datLaQuanMoi] = useState(false)
  const [tenQuanMoi, datTenQuanMoi] = useState('')
  const [diaChiMoi, datDiaChiMoi] = useState('')
  const [loaiHinhMoi, datLoaiHinhMoi] = useState('')
  const [gioMo1, datGioMo1] = useState('')
  const [gioDong1, datGioDong1] = useState('')
  const [gioMo2, datGioMo2] = useState('')
  const [gioDong2, datGioDong2] = useState('')
  const [ngayNghiMoi, datNgayNghiMoi] = useState('')
  const [sdtMoi, datSdtMoi] = useState('')

  const [tenMon, datTenMon] = useState('')
  const [gia, datGia] = useState('')
  const [anhFile, datAnhFile] = useState(null)
  const [moTa, datMoTa] = useState('')
  const [cay, datCay] = useState(false)
  const [dsDiUngChon, datDsDiUngChon] = useState([])

  const [dangGui, datDangGui] = useState(false)
  const [loi, datLoi] = useState('')
  const [daGui, datDaGui] = useState(false)

  const daChonQuanHayQuanMoi = !!quanDaChon || laQuanMoi

  const timQuan = async () => {
    if (!tuKhoaQuan.trim()) return
    datLoi('')
    datDangTimQuan(true)
    const kq = await timQuanTheoTen(tuKhoaQuan)
    datDangTimQuan(false)
    if (!kq.ok) { datLoi(kq.loi); return }
    datKetQuaTimQuan(kq.danhSach)
  }

  const chonQuan = (q) => {
    datQuanDaChon(q)
    datLaQuanMoi(false)
    datKetQuaTimQuan(null)
  }

  const doiAnh = (e) => {
    const file = e.target.files?.[0]
    if (!file) { datAnhFile(null); return }
    if (file.size > KICH_THUOC_ANH_TOI_DA_MB * 1024 * 1024) {
      datLoi(`Ảnh không được lớn hơn ${KICH_THUOC_ANH_TOI_DA_MB}MB.`)
      e.target.value = ''
      datAnhFile(null)
      return
    }
    datLoi('')
    datAnhFile(file)
  }

  const gui = async () => {
    if (!daChonQuanHayQuanMoi) { datLoi('Chọn quán có sẵn hoặc báo "quán mới" trước đã.'); return }
    if (laQuanMoi && !tenQuanMoi.trim()) { datLoi('Nhập tên quán mới.'); return }
    if (laQuanMoi && !diaChiMoi.trim()) { datLoi('Nhập địa chỉ quán mới.'); return }
    if (laQuanMoi && !loaiHinhMoi) { datLoi('Chọn loại hình quán (căng tin hay quán ngoài).'); return }
    if (laQuanMoi && (!gioMo1 || !gioDong1)) { datLoi('Nhập giờ mở và giờ đóng ca 1 của quán.'); return }
    if (!tenMon.trim()) { datLoi('Nhập tên món.'); return }
    if (!anhFile) { datLoi('Cần đăng kèm ảnh món.'); return }

    datLoi('')
    datDangGui(true)
    const kq = await guiDeXuatMonQuan({
      quanCoSan: quanDaChon?.ma_quan ?? null,
      quanMoi: laQuanMoi ? {
        ten_quan: tenQuanMoi, dia_chi: diaChiMoi, loai_hinh: loaiHinhMoi,
        gio_mo_1: gioMo1, gio_dong_1: gioDong1, gio_mo_2: gioMo2, gio_dong_2: gioDong2,
        ngay_nghi: ngayNghiMoi, so_dien_thoai: sdtMoi,
      } : null,
      tenMon,
      giaNghinDong: gia !== '' ? Number(gia) : null,
      anhFile,
      moTa,
      cay,
      thanhPhanDiUng: dsDiUngChon,
    })
    datDangGui(false)
    if (!kq.ok) { datLoi(kq.loi); return }
    datDaGui(true)
  }

  return (
    <div className="modal-nen" onClick={onDong}>
      <div className="modal-mon" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-mon__dong" onClick={onDong} type="button" aria-label="Đóng">✕</button>

        <div className="modal-mon__than">
          <h3 className="modal-mon__ten">Đề xuất quán/món mới</h3>

          {daGui ? (
            <p className="da-luu-thanh-cong">Đã gửi, đang chờ duyệt. Cảm ơn bạn!</p>
          ) : (
            <>
              <p className="chu-be chu-nhat">
                Gửi ẩn danh — nhóm duyệt xong món mới hiện cho các bạn khác. Chỉ áp dụng cho quán trong khu vực trường bạn.
              </p>

              {!daChonQuanHayQuanMoi && (
                <div className="truong-form">
                  <span className="truong-form__nhan">Tên quán</span>
                  <input
                    type="text" value={tuKhoaQuan}
                    onChange={(e) => datTuKhoaQuan(e.target.value)}
                    placeholder="Gõ tên quán để tìm..."
                  />
                  <button className="nut nut--rong" type="button" onClick={timQuan} disabled={dangTimQuan}>
                    {dangTimQuan ? 'Đang tìm…' : 'Tìm quán'}
                  </button>

                  {ketQuaTimQuan !== null && ketQuaTimQuan.length > 0 && (
                    <div className="ket-qua-tim-quan">
                      <p className="ket-qua-tim-quan__nhan chu-be chu-nhat">Chọn đúng quán của bạn:</p>
                      <ul className="ket-qua-tim-quan__ds">
                        {ketQuaTimQuan.map((q) => (
                          <li key={q.ma_quan}>
                            <button
                              className="ket-qua-tim-quan__dong"
                              type="button"
                              onClick={() => chonQuan(q)}
                            >
                              {q.ten_quan}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ketQuaTimQuan !== null && ketQuaTimQuan.length === 0 && (
                    <p className="chu-be chu-nhat">Không tìm thấy quán nào khớp.</p>
                  )}

                  <button className="nut" type="button" onClick={() => datLaQuanMoi(true)}>
                    Không tìm thấy, đây là quán mới
                  </button>
                </div>
              )}

              {quanDaChon && (
                <p className="chu-nhat">
                  Quán: <strong>{quanDaChon.ten_quan}</strong>{' '}
                  <button className="nut nut--rong" type="button" onClick={() => datQuanDaChon(null)}>Đổi</button>
                </p>
              )}

              {laQuanMoi && (
                <>
                  <label className="truong-form">
                    <span className="truong-form__nhan">Tên quán mới</span>
                    <input type="text" value={tenQuanMoi} onChange={(e) => datTenQuanMoi(e.target.value)} />
                  </label>
                  <label className="truong-form">
                    <span className="truong-form__nhan">Địa chỉ</span>
                    <input type="text" value={diaChiMoi} onChange={(e) => datDiaChiMoi(e.target.value)} />
                  </label>
                  <label className="truong-form">
                    <span className="truong-form__nhan">Loại hình</span>
                    <select value={loaiHinhMoi} onChange={(e) => datLoaiHinhMoi(e.target.value)}>
                      <option value="">— Chọn loại hình —</option>
                      <option value="cang_tin">Căng tin (trong trường)</option>
                      <option value="quan_ngoai">Quán ngoài</option>
                    </select>
                  </label>

                  <div className="truong-form">
                    <span className="truong-form__nhan">Giờ mở – đóng (ca 1)</span>
                    <div className="cap-gio">
                      <input type="time" value={gioMo1} onChange={(e) => datGioMo1(e.target.value)} />
                      <span>–</span>
                      <input type="time" value={gioDong1} onChange={(e) => datGioDong1(e.target.value)} />
                    </div>
                  </div>
                  <div className="truong-form">
                    <span className="truong-form__nhan">Giờ mở – đóng (ca 2, tuỳ chọn)</span>
                    <div className="cap-gio">
                      <input type="time" value={gioMo2} onChange={(e) => datGioMo2(e.target.value)} />
                      <span>–</span>
                      <input type="time" value={gioDong2} onChange={(e) => datGioDong2(e.target.value)} />
                    </div>
                  </div>

                  <label className="truong-form">
                    <span className="truong-form__nhan">Ngày nghỉ (tuỳ chọn)</span>
                    <input
                      type="text" value={ngayNghiMoi}
                      onChange={(e) => datNgayNghiMoi(e.target.value)}
                      placeholder="VD: Thứ 2"
                    />
                  </label>
                  <label className="truong-form">
                    <span className="truong-form__nhan">Số điện thoại quán (tuỳ chọn)</span>
                    <input type="text" value={sdtMoi} onChange={(e) => datSdtMoi(e.target.value)} />
                  </label>

                  <button className="nut nut--rong" type="button" onClick={() => datLaQuanMoi(false)}>
                    Quay lại tìm quán
                  </button>
                </>
              )}

              {daChonQuanHayQuanMoi && (
                <>
                  <label className="truong-form">
                    <span className="truong-form__nhan">Tên món</span>
                    <input type="text" value={tenMon} onChange={(e) => datTenMon(e.target.value)} />
                  </label>
                  <label className="truong-form">
                    <span className="truong-form__nhan">Giá (nghìn đồng)</span>
                    <input
                      type="number" min={0} value={gia}
                      onChange={(e) => datGia(e.target.value)}
                      placeholder="VD: 25 nghĩa là 25.000đ"
                    />
                  </label>
                  <label className="truong-form">
                    <span className="truong-form__nhan">Ảnh món</span>
                    <input type="file" accept="image/*" onChange={doiAnh} />
                  </label>
                  <label className="truong-form">
                    <span className="truong-form__nhan">Mô tả ngắn (tuỳ chọn)</span>
                    <textarea value={moTa} onChange={(e) => datMoTa(e.target.value)} rows={2} />
                  </label>

                  <div className="truong-form">
                    <label className="chon-di-ung__muc">
                      <input type="checkbox" checked={cay} onChange={(e) => datCay(e.target.checked)} />
                      <span>Món này cay</span>
                    </label>
                  </div>

                  <div className="truong-form">
                    <span className="truong-form__nhan">Thành phần dị ứng có trong món (tuỳ chọn)</span>
                    <p className="chu-be chu-nhat">
                      Tick những gì bạn biết chắc có trong món — không chắc thì bấm "i" cạnh mỗi mục để xem giải thích dễ hiểu. Không tick gì vẫn gửi được bình thường.
                    </p>
                    <ChonDiUngCoGiaiThich dsChon={dsDiUngChon} onDoi={datDsDiUngChon} />
                  </div>
                </>
              )}

              {loi && <p className="loi-form">{loi}</p>}

              {daChonQuanHayQuanMoi && (
                <button className="nut nut--chinh nut--rong" type="button" onClick={gui} disabled={dangGui}>
                  {dangGui ? 'Đang gửi…' : 'Gửi đề xuất'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
