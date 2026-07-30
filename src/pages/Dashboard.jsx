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
   ========================================================================= */

import { useState } from 'react'
import { Link } from 'react-router-dom'

import Khoi from '../components/Khoi.jsx'
import TheMon from '../components/TheMon.jsx'
import VongTron from '../components/VongTron.jsx'
import BieuDoCot from '../components/BieuDoCot.jsx'
import MienTru from '../components/MienTru.jsx'
import ThongDiepAnToan from '../components/ThongDiepAnToan.jsx'
import NhanTrangThai from '../components/NhanTrangThai.jsx'
import TrangThaiRong from '../components/TrangThaiRong.jsx'
import BangThuNghiem from '../components/BangThuNghiem.jsx'
import ModalMon from '../components/ModalMon.jsx'

import {
  layLoTrinhDangChay, layMonHomNay, layHoSo, layTomTatDinhDuongHomNay,
  layDeXuatNoiBat, layQuanGoiY, layChiPhi7NgayRutGon, goiYNhanh,
} from '../data/api.js'
import { tien, khoangCach, TEN_BUOI } from '../lib/dinhDang.js'

export default function Dashboard() {
  // Chỉ dùng để vẽ lại khi đổi kịch bản ở bảng thử nghiệm — sẽ gỡ cùng nó.
  const [lanVe, datLanVe] = useState(0)

  // DEMO 29/7 — MỘT modal dùng chung cho MỌI thẻ món trên Dashboard (Khối
  // 1/4/5), giống hệt cơ chế "bấm thẻ món → bảng nổi chi tiết" ở trang
  // "Ăn gì hôm nay" (ModalMon.jsx) — không định nghĩa lại.
  const [monDangXem, datMonDangXem] = useState(null)

  const loTrinh = layLoTrinhDangChay()

  return (
    <>
      <BangThuNghiem onDoi={() => datLanVe(lanVe + 1)} />

      {/* ---- KHỐI 1 — LỘ TRÌNH -------------------------------------------
          Khối DUY NHẤT có điều kiện hiện/ẩn toàn phần (§3):
          trống hoàn toàn nếu chưa có lộ trình — không hiện 0%,
          không có gì thay thế vào chỗ đó. */}
      {loTrinh && <KhoiLoTrinh onChonMon={datMonDangXem} />}

      {/* ---- KHỐI 2 — PHÂN TÍCH (luôn hiện) ---------------------------- */}
      <KhoiPhanTich />

      {/* ---- KHỐI 4 — MÓN ĂN ĐỀ XUẤT ----------------------------------- */}
      <KhoiMonDeXuat onChonMon={datMonDangXem} />

      {/* ---- KHỐI 3 — QUÁN ĂN GỢI Ý ------------------------------------ */}
      <KhoiQuanGoiY />

      {/* ---- KHỐI 5 — GỢI Ý NHANH -------------------------------------- */}
      <KhoiGoiYNhanh onChonMon={datMonDangXem} />

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
  const ds = layDeXuatNoiBat(5)

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
        {ds.map((q) => (
          <li className="ds-quan__dong" key={q.id}>
            <div className="day">
              <p className="ds-quan__ten">{q.ten_quan}</p>
              <p className="chu-nho chu-nhat">{q.khoang_gio_hoat_dong}</p>
            </div>
            <span className="chu-nho chu-nhat">{khoangCach(q.khoang_cach_m)}</span>
          </li>
        ))}
      </ul>
    </Khoi>
  )
}

/* =========================================================================
   KHỐI 5 — GỢI Ý NHANH (§6)
   Không có trang "Gợi ý một bữa" riêng trong menu — cơ chế này LUÔN là
   một khối trên Dashboard.

   ⚠ DEMO 29/7: dựng giao diện dạng CHAT thay cho 3 nút khuôn mẫu cố định,
   theo yêu cầu — học sinh gõ tự do thay vì chỉ chọn sẵn. CHƯA CÓ xử lý
   ngôn ngữ thật: gõ gì cũng chỉ tạm trả về cùng một gợi ý mẫu (hàm chấm
   điểm "rẻ nhất" có sẵn), qua một độ trễ giả lập để MINH HOẠ luồng
   "đang xử lý → có kết quả". Ba nút khuôn mẫu cũ vẫn giữ, chỉ đổi cách
   hiển thị kết quả thành một tin nhắn trong đoạn chat thay vì hiện thẳng
   bên dưới — vẫn dùng ĐÚNG hàm goiYNhanh() có sẵn khi bấm nút (không giả).
   Khi dựng tầng hiểu ngôn ngữ thật (sau 31/8), nhớ việc đã ghi ở §11: phải
   sửa câu "đây là chỗ DUY NHẤT dùng LLM" trong tài liệu Kế hoạch trang lộ
   trình thành "một trong hai chỗ dùng LLM".
   ========================================================================= */

const NUT_GOI_Y = [
  { ma: 're_nhat',   nhan: 'Rẻ nhất' },
  { ma: 'nhieu_dam', nhan: 'Nhiều đạm' },
  { ma: 'gan_nhat',  nhan: 'Gần nhất' },
]

function KhoiGoiYNhanh({ onChonMon }) {
  const [tinNhan, datTinNhan] = useState([])
  const [dangGo, datDangGo] = useState('')

  const guiYeuCau = (noiDungHienThi, ma) => {
    const idAi = `ai-${Date.now()}`
    datTinNhan((ds) => [
      ...ds,
      { id: `nd-${Date.now()}`, vaiTro: 'nguoi_dung', noiDung: noiDungHienThi },
      { id: idAi, vaiTro: 'ai', dangXuLy: true },
    ])
    datDangGo('')

    // Độ trễ giả lập + kết quả mẫu — xem ghi chú DEMO ở đầu file.
    setTimeout(() => {
      const ketQua = goiYNhanh(ma ?? 're_nhat')
      datTinNhan((ds) => ds.map((t) => (t.id === idAi ? { ...t, dangXuLy: false, ketQua } : t)))
    }, 900 + Math.random() * 500)
  }

  const guiTuDo = (e) => {
    e.preventDefault()
    const vanBan = dangGo.trim()
    if (!vanBan) return
    guiYeuCau(vanBan, null)
  }

  return (
    <Khoi tieuDe="Gợi ý nhanh" phu="Chat để tìm nhanh một bữa, không cần lộ trình">
      <div className="nut-goi-y">
        {NUT_GOI_Y.map((n) => (
          <button
            key={n.ma}
            type="button"
            className="nut"
            onClick={() => guiYeuCau(n.nhan, n.ma)}
          >
            {n.nhan}
          </button>
        ))}
      </div>

      {tinNhan.length > 0 && (
        <div className="chat-goi-y">
          {tinNhan.map((t) =>
            t.vaiTro === 'nguoi_dung' ? (
              <div className="chat-bong chat-bong--nguoi-dung" key={t.id}>{t.noiDung}</div>
            ) : (
              <div className="chat-bong chat-bong--ai" key={t.id}>
                {t.dangXuLy ? (
                  <span className="chat-dang-xu-ly">
                    <span className="chat-xoay" aria-hidden="true">⟳</span>
                    AI đang tìm gợi ý phù hợp...
                  </span>
                ) : (
                  <>
                    <p className="chu-nho chu-nhat">Gợi ý cho bạn:</p>
                    <div className="dai-ngang dai-ngang--tren">
                      {t.ketQua.map((m) => <TheMon key={m.id} mon={m} onChon={onChonMon} />)}
                    </div>
                    {/* §1.2 — Dashboard KHÔNG ghi dữ liệu, không có nút
                        "chọn món"/"tick bữa" ở đây. */}
                    <p className="chu-be chu-nhat goi-y__dan-loi">
                      Bấm vào món để xem chi tiết.
                    </p>
                  </>
                )}
              </div>
            )
          )}
        </div>
      )}

      <form className="chat-nhap" onSubmit={guiTuDo}>
        <input
          type="text"
          className="chat-nhap__o"
          placeholder="Gõ yêu cầu của bạn... (demo, chưa hiểu ngôn ngữ thật)"
          value={dangGo}
          onChange={(e) => datDangGo(e.target.value)}
        />
        <button className="nut nut--chinh" type="submit" disabled={!dangGo.trim()}>Gửi</button>
      </form>
    </Khoi>
  )
}
