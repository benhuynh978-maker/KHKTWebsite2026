/* =========================================================================
   TRANG DASHBOARD — màn hình đầu tiên, 6 khối
   Theo "Kế hoạch trang Dashboard" §2 (bản đồ 6 khối) và §2.1 (thứ tự hiển thị)
   -------------------------------------------------------------------------
   NGUYÊN TẮC CỐT LÕI (§1.2): hub, KHÔNG phải nơi làm việc.

     • Không tính toán logic mới. Mọi con số đọc từ dữ liệu đã có ở nơi khác.
       Ngoại lệ DUY NHẤT: lấy món hạng 1 khớp khung — dùng lại hàm chấm điểm
       đã tồn tại, không phải logic mới.

     • KHÔNG ghi dữ liệu. Không có nút "chọn món", "tick bữa" ở đây —
       các thao tác đó luôn DẪN SANG trang chuyên biệt.

     • Không trùng lặp logic. Mỗi khối chỉ hiển thị lại (rút gọn) dữ liệu mà
       một trang khác đã sở hữu.

   Thứ tự hiển thị lấy theo §2.1 (đề xuất mặc định, tài liệu ghi là "chưa
   được xác nhận riêng" — xem Phần 11 điểm chưa chốt).

   Đổi 09/08/2026 (yêu cầu riêng): Khối 5 (Gợi ý nhanh) đưa lên ĐẦU TIÊN,
   khác thứ tự §2.1 — số "Khối N" trong comment mỗi hàm vẫn giữ theo tài
   liệu gốc, không phải thứ tự hiển thị thật.
   ========================================================================= */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import Khoi from '../components/Khoi.jsx'
import TheMon from '../components/TheMon.jsx'
import VongTron from '../components/VongTron.jsx'
import BieuDoCot from '../components/BieuDoCot.jsx'
import MienTru from '../components/MienTru.jsx'
import ThongDiepAnToan from '../components/ThongDiepAnToan.jsx'
import NhanTrangThai from '../components/NhanTrangThai.jsx'
import TrangThaiRong from '../components/TrangThaiRong.jsx'
import ModalMon from '../components/ModalMon.jsx'
import KhoiGoiYNhanh from '../components/KhoiGoiYNhanh.jsx'

import {
  layLoTrinhDangChay, layMonHomNay, layHoSo, layTomTatDinhDuongHomNay,
  layDeXuatNoiBat, layQuanGoiY, layChiPhi7NgayRutGon,
  layTatCaMonKemQuan, layTatCaQuanKemMon,
} from '../data/api.js'
import { tien, khoangCach, boDauChu, TEN_BUOI } from '../lib/dinhDang.js'
import { monAnToanChoDiUng } from '../lib/diUng.js'

export default function Dashboard() {
  // MỘT modal dùng chung cho MỌI thẻ món trên Dashboard (Khối 1/4/5),
  // giống hệt cơ chế "bấm thẻ món → bảng nổi chi tiết" ở trang
  // "Ăn gì hôm nay" (ModalMon.jsx) — không định nghĩa lại.
  const [monDangXem, datMonDangXem] = useState(null)

  const loTrinh = layLoTrinhDangChay()

  return (
    <>
      {/* ---- TÌM KIẾM NHANH (thêm 02/09/2026, yêu cầu riêng) -----------
          Đưa lên ĐẦU TIÊN (02/09/2026, yêu cầu riêng), trên cả Khối 5. */}
      <KhoiTimKiemNhanh onChonMon={datMonDangXem} />

      {/* ---- KHỐI 5 — GỢI Ý NHANH (đưa lên đầu, xem ghi chú đầu file) --- */}
      <KhoiGoiYNhanh onChonMon={datMonDangXem} />

      {/* ---- KHỐI 1 — LỘ TRÌNH -------------------------------------------
          Khối DUY NHẤT có điều kiện hiện/ẩn toàn phần (§3):
          trống hoàn toàn nếu chưa có lộ trình — không hiện 0%,
          không có gì thay thế vào chỗ đó. */}
      {loTrinh && <KhoiLoTrinh onChonMon={datMonDangXem} />}

      {/* ---- KHỐI 2 — PHÂN TÍCH (luôn hiện) ---------------------------- */}
      <KhoiPhanTich />

      {/* ---- KHỐI 4 — MÓN ĂN ĐỀ XUẤT -----------------------------------
          ẨN 02/09/2026 (yêu cầu riêng) — KHÔNG xoá hàm KhoiMonDeXuat bên
          dưới lẫn trang "Ăn gì hôm nay" mà khối này dẫn tới, chỉ bỏ dòng
          render này. Mở lại: bỏ comment dòng dưới. */}
      {/* <KhoiMonDeXuat onChonMon={datMonDangXem} /> */}

      {/* ---- KHỐI 3 — QUÁN ĂN GỢI Ý ------------------------------------
          ẨN 02/09/2026 (yêu cầu riêng) — cùng cách xử lý với Khối 4 ở
          trên, xem ghi chú ngay phía trên. */}
      {/* <KhoiQuanGoiY /> */}

      {/* R-31 — trang hiển thị dữ liệu dinh dưỡng cá nhân (§1.3) */}
      <MienTru />

      {/* ---- KHỐI 6 — THÔNG ĐIỆP AN TOÀN (luôn ở cuối) ----------------- */}
      <ThongDiepAnToan />

      {monDangXem && (
        <ModalMon mon={monDangXem} onDong={() => datMonDangXem(null)} chiXem />
      )}
    </>
  )
}

/* =========================================================================
   KHỐI 1 — LỘ TRÌNH
   -------------------------------------------------------------------------
   Bố cục viết lại 29/7 theo yêu cầu riêng: "Món hôm nay" giờ là một THẺ
   MÓN giống hệt các thẻ khác trong app (TheMon.jsx — cùng bấm vào để mở
   bảng nổi chi tiết), có chữ BUỔI rõ ràng ở đầu, kèm 2 vòng tròn %năng
   lượng/%đạm CỦA RIÊNG MÓN NÀY so với mốc cả ngày (không phải số gram/kcal
   thô — R-08/§3.2 vẫn áp dụng y hệt, chỉ đổi CÁCH gói số liệu). Vòng tròn
   tổng hợp CẢ NGÀY (HaiVongTron, đã có từ trước) vẫn giữ nguyên bên dưới —
   hai thứ khác phạm vi (một món / cả ngày), không thay thế nhau.
   ========================================================================= */

function KhoiLoTrinh({ onChonMon }) {
  return (
    <Khoi
      tieuDe="Lộ trình hôm nay"
      hanhDong={<Link className="lien-ket" to="/lo-trinh">Xem thêm</Link>}
      nguonTrang="Trang Lộ trình"
    >
      <MonHomNay onChonMon={onChonMon} />
      <HaiVongTron />
    </Khoi>
  )
}

/* ---- Khối 1, Phần A — Món hôm nay (§3.1) ----------------------------- */

function MonHomNay({ onChonMon }) {
  const kq = layMonHomNay()

  // Đã ghi nhận bữa hôm nay → hiện TRẠNG THÁI XÁC NHẬN, không phải gợi ý nữa.
  if (kq.tinh_huong === 'da_ghi_nhan') {
    // mon_id đã ghi nhận có thể không còn tra được (món đổi/xoá khỏi Khu
    // vực 4 sau khi ghi nhận) — không suy đoán, hiện trạng thái trung tính
    // thay vì crash (cùng nguyên tắc null-guard đã dùng ở nhánh chưa ghi
    // nhận bên dưới).
    if (!kq.mon) {
      return (
        <div className="mon-hom-nay mon-hom-nay--da-ghi">
          <p className="chu-nho chu-nhat">Đã ghi nhận bữa {TEN_BUOI[kq.buoi]?.toLowerCase()} hôm nay.</p>
          <NhanTrangThai loai="trong_khung" />
        </div>
      )
    }
    return (
      <TheMonBuoiHomNay
        mon={kq.mon}
        buoi={kq.buoi}
        nhanTrangThai="trong_khung"
        onChonMon={onChonMon}
      />
    )
  }

  if (kq.tinh_huong === 'da_ghi_nhan_ngoai_khung') {
    return (
      <div className="mon-hom-nay mon-hom-nay--da-ghi">
        <div className="day">
          {/* R-08 — đóng khung TRUNG TÍNH, chỉ để ghi nhận.
              Không màu đỏ, không cảnh báo, không "bạn đã phá kế hoạch". */}
          <p className="mon-hom-nay__ten">Ăn ngoài lộ trình</p>
          {kq.mon_tu_ghi && (
            <p className="chu-nho chu-nhat">{kq.mon_tu_ghi}</p>
          )}
        </div>
        <NhanTrangThai loai="ngoai_ke_hoach" />
      </div>
    )
  }

  // Chưa ghi nhận → món hạng 1 khớp khung.
  const { mon, buoi } = kq
  if (!mon) {
    return (
      <TrangThaiRong>
        Chưa có món nào khớp khung bữa {TEN_BUOI[buoi]?.toLowerCase()} hôm nay.
      </TrangThaiRong>
    )
  }

  return <TheMonBuoiHomNay mon={mon} buoi={buoi} onChonMon={onChonMon} />
}

/** Thẻ món của buổi hôm nay — thẻ CHUẨN (TheMon) + nhãn buổi + 2 vòng tròn
 *  %năng lượng/%đạm của RIÊNG món này so với mốc cả ngày (kcal_muc_tieu/
 *  dam_muc_tieu ở Hồ sơ). "chế demo trước" theo đúng yêu cầu — số hồ sơ
 *  hiện có sẵn, không cần bịa thêm. */
function TheMonBuoiHomNay({ mon, buoi, nhanTrangThai, onChonMon }) {
  const hoSo = layHoSo()
  const phanTramNangLuong = hoSo.kcal_muc_tieu ? (mon.kcal / hoSo.kcal_muc_tieu) * 100 : 0
  const phanTramDam = hoSo.dam_muc_tieu ? (mon.dam_g / hoSo.dam_muc_tieu) * 100 : 0

  return (
    <div className="the-mon-buoi">
      <div className="the-mon-buoi__dau">
        <span className="the-mon-buoi__nhan-buoi">Bữa {TEN_BUOI[buoi]?.toLowerCase()}</span>
        {nhanTrangThai && <NhanTrangThai loai={nhanTrangThai} />}
      </div>

      <TheMon mon={mon} onChon={onChonMon} />

      <div className="hai-vong hai-vong--nho">
        <div className="hai-vong__hang">
          <VongTron
            chinh
            phanTram={phanTramDam}
            nhan="đạm món này / mốc ngày"
            moTa={(
              <>
                Riêng món ở bữa {TEN_BUOI[buoi]?.toLowerCase()} này có bao nhiêu %
                đạm so với mốc đạm CẢ NGÀY trong hồ sơ của bạn — chưa cộng các bữa
                khác.
              </>
            )}
          />
          <VongTron
            phanTram={phanTramNangLuong}
            nhan="năng lượng món này / mốc ngày"
            moTa={(
              <>
                Riêng món ở bữa {TEN_BUOI[buoi]?.toLowerCase()} này có bao nhiêu %
                năng lượng so với mốc năng lượng CẢ NGÀY trong hồ sơ của bạn — chưa
                cộng các bữa khác.
              </>
            )}
          />
        </div>
      </div>
    </div>
  )
}

/* ---- Khối 1, Phần B — Hai vòng tròn (§3.2) --------------------------- */

function HaiVongTron() {
  const tt = layTomTatDinhDuongHomNay()
  if (!tt) return null

  return (
    <div className="hai-vong">
      <div className="hai-vong__hang">
        {/* Đạm là vòng CHÍNH (to hơn), năng lượng là vòng PHỤ (nhỏ hơn).
            Nhãn ghi rõ "(theo lộ trình)": vì MVP lộ trình chỉ quản lý
            trưa + tối, mốc này chỉ là MỘT PHẦN nhu cầu cả ngày. Không ghi
            trống "đạm hôm nay" — tránh học sinh hiểu lầm đã đủ cả ngày.
            (§3.2, khung "Lưu ý nhãn hiển thị") */}
        <VongTron
          chinh
          phanTram={tt.phan_tram_dam}
          nhan="đạm hôm nay (theo lộ trình)"
          moTaLen
          moTa={(
            <>
              Cộng dồn đạm của MỌI bữa đã ghi nhận hôm nay theo lộ trình, so với
              mốc đạm cả ngày. Lộ trình hiện chỉ quản lý bữa trưa và tối, nên đây
              là một phần nhu cầu cả ngày, chưa phải toàn bộ.
            </>
          )}
        />

        {/* Nhãn dùng chữ "năng lượng", KHÔNG dùng chữ "calo" (§3.2). */}
        <VongTron
          phanTram={tt.phan_tram_nang_luong}
          nhan="năng lượng (theo lộ trình)"
          moTaLen
          moTa={(
            <>
              Cộng dồn năng lượng của MỌI bữa đã ghi nhận hôm nay theo lộ trình, so
              với mốc năng lượng cả ngày. Lộ trình hiện chỉ quản lý bữa trưa và
              tối, nên đây là một phần nhu cầu cả ngày, chưa phải toàn bộ.
            </>
          )}
        />
      </div>

      {/* Chú thích bắt buộc khi có bữa ăn ngoài lộ trình (§3.2, khung
          "Lỗ đã phát hiện — bắt buộc xử lý"): bữa đó có mon_id NULL nên
          kcal/đạm cũng NULL, không đóng góp vào tử số dù thực tế có ăn.
          Không sửa cơ chế ghi nhận, chỉ khai đúng bản chất con số. */}
      {tt.so_bua_chua_tinh > 0 && (
        <p className="hai-vong__chu-thich">
          chưa tính {tt.so_bua_chua_tinh} bữa ăn ngoài lộ trình
        </p>
      )}
    </div>
  )
}

/* =========================================================================
   TÌM KIẾM NHANH (thêm 02/09/2026, yêu cầu riêng) — thay cho việc phải
   sang "Ăn gì hôm nay"/"Quán ăn gần đây" chỉ để tra 1 món/quán. Logic lọc
   Y HỆT 2 trang đó (không phát minh công thức mới):
     - Món: layTatCaMonKemQuan() + khớp ten_mon HOẶC ten_quan (boDauChu,
       không phân biệt dấu) + an toàn dị ứng theo hồ sơ — xem
       pages/AnGiHomNay.jsx:monKhopLoc.
     - Quán: layTatCaQuanKemMon() + khớp ten_quan — xem
       pages/QuanAnGanDay.jsx:dsHienThi.
   CỐ Ý không mang theo bộ lọc buổi/giá/khoảng cách của 2 trang gốc (yêu
   cầu riêng: "chỉ ô nhập từ khoá cho gọn/nhanh") — dị ứng vẫn luôn lọc
   NGẦM vì đó là an toàn, không phải một tuỳ chọn bộ lọc UI để lược bớt.
   Rỗng từ khoá thì không hiện gì (tránh tràn Dashboard ngay lúc mới vào).
   Giới hạn 6 món/4 quán — cùng cỡ giới hạn đã dùng ở các khối rút gọn
   khác của Dashboard trước đây (Khối 4/3). Bấm món mở ĐÚNG modal dùng
   chung của Dashboard (onChonMon) — không tạo modal riêng. Thẻ quán dùng
   lại nguyên cách hiển thị của KhoiQuanGoiY (nay đã ẩn) — không có hành
   động bấm, đúng nguyên tắc §1.2 "Dashboard không ghi dữ liệu". */

const GIOI_HAN_MON_KHOP = 6
const GIOI_HAN_QUAN_KHOP = 4

function KhoiTimKiemNhanh({ onChonMon }) {
  const hoSo = layHoSo()
  const [tuKhoa, datTuKhoa] = useState('')
  const daGoTuKhoa = tuKhoa.trim().length > 0

  const monKhop = useMemo(() => {
    const tk = boDauChu(tuKhoa.trim())
    if (!tk) return []
    return layTatCaMonKemQuan()
      .filter((m) => {
        if (!boDauChu(m.ten_mon).includes(tk) && !boDauChu(m.quan.ten_quan).includes(tk)) return false
        if (!monAnToanChoDiUng(m, hoSo.di_ung)) return false
        return true
      })
      .slice(0, GIOI_HAN_MON_KHOP)
  }, [tuKhoa, hoSo])

  const quanKhop = useMemo(() => {
    const tk = boDauChu(tuKhoa.trim())
    if (!tk) return []
    return layTatCaQuanKemMon()
      .filter((q) => boDauChu(q.ten_quan).includes(tk))
      .slice(0, GIOI_HAN_QUAN_KHOP)
  }, [tuKhoa])

  return (
    <Khoi tieuDe="Tìm nhanh món & quán">
      <input
        className="o-tim-kiem"
        type="search"
        placeholder="Tìm theo tên món hoặc tên quán..."
        value={tuKhoa}
        onChange={(e) => datTuKhoa(e.target.value)}
      />

      {daGoTuKhoa && (
        <>
          <p className="muc-tieu-khoa__tieu-de">Món khớp</p>
          {monKhop.length === 0 ? (
            <TrangThaiRong>Không có món nào khớp.</TrangThaiRong>
          ) : (
            <div className="dai-ngang">
              {monKhop.map((m) => <TheMon key={m.id} mon={m} onChon={onChonMon} />)}
            </div>
          )}

          <p className="muc-tieu-khoa__tieu-de">Quán khớp</p>
          {quanKhop.length === 0 ? (
            <TrangThaiRong>Không có quán nào khớp.</TrangThaiRong>
          ) : (
            <ul className="ds-quan">
              {quanKhop.map((q) => {
                const diaChiSdt = [q.dia_chi, q.so_dien_thoai ? `📞 ${q.so_dien_thoai}` : null]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <li className="ds-quan__dong" key={q.id}>
                    <div className="ds-quan__hang-tren">
                      <div className="day">
                        <p className="ds-quan__ten">{q.ten_quan}</p>
                        <p className="chu-nho chu-nhat">{q.khoang_gio_hoat_dong}</p>
                      </div>
                      <span className="chu-nho chu-nhat">{khoangCach(q.khoang_cach_m)}</span>
                    </div>
                    {diaChiSdt && <p className="chu-be chu-nhat ds-quan__phu">{diaChiSdt}</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </Khoi>
  )
}

/* =========================================================================
   KHỐI 2 — PHÂN TÍCH (luôn hiện, không phụ thuộc lộ trình)
   §4: bản rút gọn của trang Phân tích đầy đủ — biểu đồ CỘT, KHÔNG phần trăm.
       Bản rút gọn KHÔNG có đường mốc tham chiếu (mục "Tổng quan").
       Nguồn: Khu vực 5 (đã tổng hợp Khu vực 2 + 3), không đọc thẳng 2/3.
   ⚠ Trang Phân tích đầy đủ CHƯA CÓ TÀI LIỆU THIẾT KẾ — xem ghi chú ở đầu
     src/lib/xepKhoangThoiGian.js. Khối này dùng lại ĐÚNG hàm
     layChiPhi7NgayRutGon() mà trang Phân tích đầy đủ cũng gọi (mục
     "Tổng quan", tab "Ngày") — không có bản sao dữ liệu riêng.
   ========================================================================= */

function KhoiPhanTich() {
  const duLieu = layChiPhi7NgayRutGon()

  return (
    <Khoi
      tieuDe="Chi tiêu 7 ngày qua"
      phu="Tổng mỗi ngày · nghìn đồng"
      hanhDong={<Link className="lien-ket" to="/phan-tich">Xem chi tiết</Link>}
      nguonTrang="Trang Phân tích"
    >
      <BieuDoCot
        duLieu={duLieu.map((d) => ({ nhan: d.nhan, giaTri: Math.round(d.chiPhi / 1000) }))}
        donVi="k"
        mau="var(--mau-bd-chi-tieu)"
        nhanChiSo="Chi tiêu 7 ngày qua"
      />
    </Khoi>
  )
}

/* =========================================================================
   KHỐI 4 — MÓN ĂN ĐỀ XUẤT
   §5.2: bản rút gọn của trang "Ăn gì hôm nay", lấy từ ĐÚNG mục
   "Đề xuất nổi bật" (Khu A), KHÔNG lấy từ phần Duyệt toàn bộ.
   Khác "Món hôm nay" ở Khối 1: khối này KHÔNG phụ thuộc lộ trình,
   luôn hiện, mang tính khám phá chung.
   ========================================================================= */

function KhoiMonDeXuat({ onChonMon }) {
  const [ds, datDs] = useState([])

  // Đề xuất nổi bật đọc bảng Supabase ẩn danh thật (ASYNC từ 05/08/2026) —
  // xem ghi chú ở api.js layDeXuatNoiBat.
  useEffect(() => {
    let huy = false
    layDeXuatNoiBat(5).then((kq) => { if (!huy) datDs(kq) })
    return () => { huy = true }
  }, [])

  return (
    <Khoi
      tieuDe="Món ăn đề xuất"
      phu="Được chọn nhiều nhất 7 ngày qua"
      hanhDong={<Link className="lien-ket" to="/an-gi-hom-nay">Xem tất cả</Link>}
      nguonTrang="Trang Ăn gì hôm nay"
    >
      {ds.length === 0 ? (
        <TrangThaiRong>Chưa có dữ liệu 7 ngày qua.</TrangThaiRong>
      ) : (
        // Dải cuộn ngang, không tự xuống hàng ("Ăn gì hôm nay" §2.1)
        <div className="dai-ngang">
          {ds.map((m) => <TheMon key={m.id} mon={m} onChon={onChonMon} />)}
        </div>
      )}
    </Khoi>
  )
}

/* =========================================================================
   KHỐI 3 — QUÁN ĂN GỢI Ý
   §5.1: bản rút gọn của trang "Quán ăn gần đây". Luôn hiện.
   ========================================================================= */

function KhoiQuanGoiY() {
  const ds = layQuanGoiY(4)

  return (
    <Khoi
      tieuDe="Quán ăn gợi ý"
      hanhDong={<Link className="lien-ket" to="/quan-an-gan-day">Xem tất cả</Link>}
      nguonTrang="Trang Quán ăn gần đây"
    >
      <ul className="ds-quan">
        {ds.map((q) => {
          // Địa chỉ/SĐT — 15/08/2026, yêu cầu riêng. Dòng phụ nhỏ gọn thêm
          // dưới dòng chính, ẩn hẳn nếu cả 2 đều trống — KHÔNG đổi
          // layQuanGoiY() hay thứ tự quán hiện ra (chỉ thêm thông tin).
          const diaChiSdt = [q.dia_chi, q.so_dien_thoai ? `📞 ${q.so_dien_thoai}` : null]
            .filter(Boolean)
            .join(' · ')
          return (
            <li className="ds-quan__dong" key={q.id}>
              <div className="ds-quan__hang-tren">
                <div className="day">
                  <p className="ds-quan__ten">{q.ten_quan}</p>
                  <p className="chu-nho chu-nhat">{q.khoang_gio_hoat_dong}</p>
                </div>
                <span className="chu-nho chu-nhat">{khoangCach(q.khoang_cach_m)}</span>
              </div>
              {diaChiSdt && <p className="chu-be chu-nhat ds-quan__phu">{diaChiSdt}</p>}
            </li>
          )
        })}
      </ul>
    </Khoi>
  )
}

/* =========================================================================
   KHỐI 5 — GỢI Ý NHANH (§6)
   Không có trang "Gợi ý một bữa" riêng trong menu — cơ chế này LUÔN là
   một khối trên Dashboard.

   Từ 07/08/2026 (Pha 1): chat AI THẬT (Gemini, port từ test/) — tách ra
   `components/KhoiGoiYNhanh.jsx`, xem file đó + NHAT-KY-AI.md "Pha 1" để
   biết chi tiết. Bản DEMO cũ (setTimeout + goiYNhanh() cố định) đã xoá.
   ========================================================================= */
