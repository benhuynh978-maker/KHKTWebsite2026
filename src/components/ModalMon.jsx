/* =========================================================================
   MODAL CHI TIẾT MÓN — dùng chung ở 2 trang
   -------------------------------------------------------------------------
   "Ăn gì hôm nay" §5–6, và "Quán ăn gần đây" §3: "Dùng lại y hệt cơ chế đã
   chốt ở tài liệu Kế hoạch trang Ăn gì hôm nay, KHÔNG định nghĩa lại."

   NHỮNG ĐIỀU COMPONENT NÀY CỐ Ý LÀM ĐÚNG THEO TÀI LIỆU (đừng đổi khi không
   có quyết định mới):

   • Danh sách "thanh_phan_di_ung" hiển thị ở đây là NHÃN CHUNG, TĨNH —
     giống nhãn thành phần trên bao bì. KHÔNG so khớp với dị ứng đã khai
     của học sinh đang xem, KHÔNG tô cảnh báo cá nhân hoá tại đây.
     (§5.2: "không phải cảnh báo cá nhân hoá riêng theo từng học sinh xem.
     Việc so khớp... là việc của bộ lọc 'An toàn dị ứng', không phải của
     modal.") Việc này từng được nêu là một lỗ hổng an toàn tiềm ẩn khi bàn
     thiết kế hệ thống — nhóm đã quyết định giữ đúng tài liệu, không tự vá
     ở tầng giao diện.

   • R-31 luôn có mặt ở đây (§5.3) vì đây là nơi hiện số dinh dưỡng thật.

   • Nút "Đã ăn món này" chỉ nằm trong modal (§6.1). Không có bước huỷ/
     hoàn tác ngay tại trang (§6.2) — muốn xoá phải qua trang Lịch sử.

   ⚠ Thêm 29/7 — prop `chiXem`: Dashboard giờ cũng bấm thẻ món mở được
     modal này (yêu cầu riêng), nhưng Dashboard §1.2 CẤM ghi dữ liệu ("mọi
     thao tác chọn/tick bữa luôn DẪN SANG trang chuyên biệt"). `chiXem`
     thay nút "Đã ăn món này" bằng một liên kết dẫn sang đúng trang có
     thao tác đó — vẫn MỘT modal duy nhất, không tạo bản sao.

   ⚠ Thêm 29/7 — bình luận & đánh giá 5 sao (yêu cầu riêng, xem thêm
     mock/binhLuan.js): dòng "Xem bình luận" đứng ngay TRƯỚC nút "Đã ăn
     món này", chỉ hiện số lượng — nội dung từng bình luận CHỈ hiện ở bảng
     nổi riêng (BangBinhLuan.jsx) khi bấm vào. Bảng nổi đó render NGOÀI
     .modal-nen của chính modal này (xem JSX bên dưới) — nếu lồng bên
     trong, bấm ra ngoài bảng bình luận sẽ nổi bọt (bubble) lên onClick
     đóng modal chi tiết luôn, đóng nhầm cả hai lớp cùng lúc.

     Ô sao cạnh giá món (DanhGiaSao.jsx) CHỈ ĐỌC — hiện điểm trung bình.
     Ô TỰ CHỌN sao để gửi (ChonSao.jsx) nằm trong BangBinhLuan.jsx, đi
     cùng khung viết bình luận — giống cách Shopee/Tiki/Google Play đặt
     "Viết đánh giá". ModalMon chỉ ĐỌC LẠI kết quả khi đóng bảng bình luận
     (đóng-thì-nạp-lại, xem dongBangBinhLuan bên dưới), không tự gửi sao. */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tien, khoangCach } from '../lib/dinhDang.js'
import { useDongBangEsc } from '../lib/dongBangEsc.js'
import { ghiNhanDaAnTuChon, tenNhomDiUng, layBinhLuan, layDanhGia } from '../data/api.js'
import MienTru from './MienTru.jsx'
import DanhGiaSao from './DanhGiaSao.jsx'
import BangBinhLuan from './BangBinhLuan.jsx'
import BaoCaoVanDe from './BaoCaoVanDe.jsx'

// Link Google Maps — thêm 02/09/2026, yêu cầu riêng. Không dùng
// target="_blank" trên điện thoại: đó là window.open(), kém tin cậy hơn
// điều hướng thường trong việc để hệ điều hành tự bật ĐÚNG app Google Maps
// (Universal Links/App Links), đặc biệt trên iOS Safari — có lúc chỉ mở
// trang web Maps trong tab thay vì app thật. Desktop thì ngược lại, luôn
// muốn tab mới để không mất chỗ đang xem. Phân biệt bằng cùng kỹ thuật đã
// dùng ở ThongTinGoiY.jsx (matchMedia('(hover: hover)') — máy có chuột
// thật mới coi là desktop, không suy đoán qua User-Agent).
const CO_CHUOT_THAT = typeof window !== 'undefined'
  && window.matchMedia('(hover: hover)').matches

// Ghép tên quán + địa chỉ (không chỉ địa chỉ) — Google Maps tra đúng hơn
// khi địa chỉ khảo sát chưa đủ chi tiết (thiếu số nhà, tên hẻm...).
function urlGoogleMaps(quan) {
  const tuKhoa = [quan?.ten_quan, quan?.dia_chi].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tuKhoa)}`
}

// Dữ liệu Supabase thật hiện chưa có cột sai_so_* nào được nhập (toàn null)
// — ẩn hẳn cụm "(±...)" khi thiếu, không hiện "(±)" rỗng trông như số liệu.
function BienSaiSo({ giaTri }) {
  if (giaTri == null) return null
  return <span className="chu-be chu-nhat"> (±{giaTri})</span>
}

export default function ModalMon({ mon, onDong, onDaGhiNhan, chiXem }) {
  useDongBangEsc(onDong)
  const [trangThai, datTrangThai] = useState('xem') // xem | da_ghi | bi_chan
  const [thongDiepChan, datThongDiepChan] = useState('')
  const [hienBinhLuan, datHienBinhLuan] = useState(false)
  const [hienBaoCao, datHienBaoCao] = useState(false)

  const [soBinhLuan, datSoBinhLuan] = useState(0)
  const [danhGia, datDanhGia] = useState(null)

  // Modal luôn mount MỚI cho mỗi món (đóng rồi mở lại từ thẻ khác) — tải
  // 1 lần khi mount, không cần đồng bộ lại khi prop mon đổi giữa chừng.
  useEffect(() => {
    if (!mon) return
    let huy = false
    layBinhLuan(mon.id).then((ds) => { if (!huy) datSoBinhLuan(ds.length) })
    layDanhGia(mon.id).then((dg) => { if (!huy) datDanhGia(dg) })
    return () => { huy = true }
  }, [mon])

  if (!mon) return null
  const { quan } = mon

  // Bảng bình luận vừa đóng là lúc duy nhất số bình luận/sao có thể đã
  // đổi (người dùng gửi bên trong đó) — nạp lại một lần ở đây thay vì dò
  // đồng bộ theo từng hành động, đơn giản hơn mà vẫn đúng.
  const dongBangBinhLuan = async () => {
    datHienBinhLuan(false)
    const ds = await layBinhLuan(mon.id)
    datSoBinhLuan(ds.length)
    datDanhGia(await layDanhGia(mon.id))
  }

  const xacNhanDaAn = () => {
    const kq = ghiNhanDaAnTuChon(mon)
    if (!kq.choPhep) {
      datThongDiepChan(kq.thongDiep)
      datTrangThai('bi_chan')
      return
    }
    datTrangThai('da_ghi')
    onDaGhiNhan?.()
  }

  return (
    <>
      <div className="modal-nen" onClick={onDong}>
        <div className="modal-mon" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <button className="modal-mon__dong" onClick={onDong} type="button" aria-label="Đóng">
            ✕
          </button>

          <div className="modal-mon__anh" aria-hidden="true">
            {mon.anh_url
              ? <img src={mon.anh_url} alt="" />
              : <span>Ảnh món</span>}
          </div>

          <div className="modal-mon__than">
            <div>
              <h3 className="modal-mon__ten">{mon.ten_mon}</h3>
              <p className="chu-nhat">
                {quan?.ten_quan} · {khoangCach(quan?.khoang_cach_m)}
              </p>
              {/* Địa chỉ/SĐT/Maps/ShopeeFood/GrabFood — đổi 02/09/2026 (yêu
                  cầu riêng): LUÔN hiện đủ 5 dòng nhãn, giá trị thiếu thì
                  hiện "Chưa có" thay vì ẩn hẳn dòng đó (khác quy ước cũ từ
                  15/08/2026 — đã đổi theo quyết định mới, đồng bộ cho cả 5
                  mục). ShopeeFood/GrabFood ở CẤP MÓN (mon.link_*, không
                  phải quan.link_*) — xem sql/21-them-link-giao-do-an-mon.sql. */}
              <div className="modal-mon__thong-tin-quan">
                <p className="chu-nho">
                  <span className="chu-nhat">Địa chỉ: </span>
                  {quan?.dia_chi || 'Chưa có'}
                </p>
                <p className="chu-nho">
                  <span className="chu-nhat">Điện thoại: </span>
                  {quan?.so_dien_thoai || 'Chưa có'}
                </p>
                <p className="chu-nho">
                  <span className="chu-nhat">Google Maps: </span>
                  {quan?.dia_chi ? (
                    <a
                      className="lien-ket"
                      href={urlGoogleMaps(quan)}
                      {...(CO_CHUOT_THAT ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      Mở Google Maps
                    </a>
                  ) : 'Chưa có'}
                </p>
                <p className="chu-nho">
                  <span className="chu-nhat">ShopeeFood: </span>
                  {mon.link_shopee_food ? (
                    <a className="lien-ket" href={mon.link_shopee_food} target="_blank" rel="noopener noreferrer">
                      Đặt trên ShopeeFood
                    </a>
                  ) : 'Chưa có'}
                </p>
                <p className="chu-nho">
                  <span className="chu-nhat">GrabFood: </span>
                  {mon.link_grab_food ? (
                    <a className="lien-ket" href={mon.link_grab_food} target="_blank" rel="noopener noreferrer">
                      Đặt trên GrabFood
                    </a>
                  ) : 'Chưa có'}
                </p>
              </div>
            </div>

            <div className="modal-mon__gia-hang">
              <p className="modal-mon__gia">{tien(mon.gia)}</p>
              <DanhGiaSao
                trungBinh={danhGia?.trung_binh ?? null}
                soLuot={danhGia?.so_luot ?? 0}
              />
            </div>

            {/* Dinh dưỡng chi tiết — mỗi số kèm biên sai số riêng (R-04). */}
            <dl className="modal-mon__dinh-duong">
              <div>
                <dt>Năng lượng</dt>
                <dd>{mon.kcal} kcal<BienSaiSo giaTri={mon.sai_so_kcal} /></dd>
              </div>
              <div>
                <dt>Đạm</dt>
                <dd>{mon.dam_g} g<BienSaiSo giaTri={mon.sai_so_dam} /></dd>
              </div>
              <div>
                <dt>Glucid</dt>
                <dd>{mon.glucid_g} g<BienSaiSo giaTri={mon.sai_so_glucid} /></dd>
              </div>
              <div>
                <dt>Lipid</dt>
                <dd>{mon.lipid_g} g<BienSaiSo giaTri={mon.sai_so_lipid} /></dd>
              </div>
              <div>
                <dt>Canxi</dt>
                <dd>{mon.canxi_mg} mg<BienSaiSo giaTri={mon.sai_so_canxi} /></dd>
              </div>
              <div>
                <dt>Sắt</dt>
                <dd>{mon.sat_mg} mg<BienSaiSo giaTri={mon.sai_so_sat} /></dd>
              </div>
              <div>
                <dt>Kẽm</dt>
                <dd>{mon.kem_mg} mg<BienSaiSo giaTri={mon.sai_so_kem} /></dd>
              </div>
            </dl>

            {Array.isArray(mon.thanh_phan_di_ung) && mon.thanh_phan_di_ung.length > 0 && (
              <p className="modal-mon__thanh-phan">
                <span className="chu-nhat">Thành phần có thể gây dị ứng: </span>
                {mon.thanh_phan_di_ung.map(tenNhomDiUng).join(', ')}
              </p>
            )}
            {!Array.isArray(mon.thanh_phan_di_ung) && (
              <p className="modal-mon__thanh-phan chu-nhat">
                Món này CHƯA được kiểm tra thành phần dị ứng — hỏi trực tiếp quán trước khi ăn nếu bạn có dị ứng.
              </p>
            )}

            <MienTru gonGang />

            <button
              type="button"
              className="mon-binh-luan"
              onClick={() => datHienBinhLuan(true)}
            >
              💬 <strong>{soBinhLuan}</strong> bình luận
              <span className="mon-binh-luan__xem">· Xem bình luận</span>
            </button>

            <button
              type="button"
              className="lien-ket bao-cao-van-de-nut"
              onClick={() => datHienBaoCao(true)}
            >
              🚩 Báo cáo vấn đề với món này
            </button>

            <div className="modal-mon__hanh-dong">
              {trangThai === 'xem' && chiXem && (
                <Link className="nut nut--chinh nut--rong" to="/an-gi-hom-nay" onClick={onDong}>
                  Xem & xác nhận ở trang Ăn gì hôm nay
                </Link>
              )}
              {trangThai === 'xem' && !chiXem && (
                <button className="nut nut--chinh nut--rong" onClick={xacNhanDaAn} type="button">
                  Đã ăn món này
                </button>
              )}
              {trangThai === 'da_ghi' && (
                <p className="modal-mon__da-ghi">✓ Đã ghi nhận. Cảm ơn bạn!</p>
              )}
              {trangThai === 'bi_chan' && (
                <p className="modal-mon__bi-chan">{thongDiepChan}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {hienBinhLuan && (
        <BangBinhLuan mon={mon} onDong={dongBangBinhLuan} />
      )}

      {hienBaoCao && (
        <BaoCaoVanDe
          moTaGoiY={`Món "${mon.ten_mon}" tại quán "${quan?.ten_quan ?? '(không rõ quán)'}": `}
          onDong={() => datHienBaoCao(false)}
        />
      )}
    </>
  )
}
