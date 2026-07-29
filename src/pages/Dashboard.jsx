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

import {
  layLoTrinhDangChay, layMonHomNay, layTomTatDinhDuongHomNay,
  layDeXuatNoiBat, layQuanGoiY, layChiPhi7NgayRutGon, goiYNhanh,
} from '../data/api.js'
import { tien, khoangCach, TEN_BUOI } from '../lib/dinhDang.js'

export default function Dashboard() {
  // Chỉ dùng để vẽ lại khi đổi kịch bản ở bảng thử nghiệm — sẽ gỡ cùng nó.
  const [lanVe, datLanVe] = useState(0)

  const loTrinh = layLoTrinhDangChay()

  return (
    <>
      <BangThuNghiem onDoi={() => datLanVe(lanVe + 1)} />

      {/* ---- KHỐI 1 — LỘ TRÌNH -------------------------------------------
          Khối DUY NHẤT có điều kiện hiện/ẩn toàn phần (§3):
          trống hoàn toàn nếu chưa có lộ trình — không hiện 0%,
          không có gì thay thế vào chỗ đó. */}
      {loTrinh && <KhoiLoTrinh />}

      {/* ---- KHỐI 2 — PHÂN TÍCH (luôn hiện) ---------------------------- */}
      <KhoiPhanTich />

      {/* ---- KHỐI 4 — MÓN ĂN ĐỀ XUẤT ----------------------------------- */}
      <KhoiMonDeXuat />

      {/* ---- KHỐI 3 — QUÁN ĂN GỢI Ý ------------------------------------ */}
      <KhoiQuanGoiY />

      {/* ---- KHỐI 5 — GỢI Ý NHANH -------------------------------------- */}
      <KhoiGoiYNhanh />

      {/* R-31 — trang hiển thị dữ liệu dinh dưỡng cá nhân (§1.3) */}
      <MienTru />

      {/* ---- KHỐI 6 — THÔNG ĐIỆP AN TOÀN (luôn ở cuối) ----------------- */}
      <ThongDiepAnToan />
    </>
  )
}

/* =========================================================================
   KHỐI 1 — LỘ TRÌNH
   ========================================================================= */

function KhoiLoTrinh() {
  return (
    <Khoi
      tieuDe="Lộ trình hôm nay"
      hanhDong={<Link className="lien-ket" to="/lo-trinh">Xem thêm</Link>}
    >
      <MonHomNay />
      <HaiVongTron />
    </Khoi>
  )
}

/* ---- Khối 1, Phần A — Món hôm nay (§3.1) ----------------------------- */

function MonHomNay() {
  const kq = layMonHomNay()

  // Đã ghi nhận bữa hôm nay → hiện TRẠNG THÁI XÁC NHẬN, không phải gợi ý nữa.
  if (kq.tinh_huong === 'da_ghi_nhan') {
    return (
      <div className="mon-hom-nay mon-hom-nay--da-ghi">
        <div className="day">
          <p className="mon-hom-nay__ten">{kq.mon?.ten_mon}</p>
          <p className="chu-nho chu-nhat">{kq.mon?.quan?.ten_quan}</p>
        </div>
        <NhanTrangThai loai="trong_khung" />
      </div>
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

  // Chưa ghi nhận → món hạng 1 khớp khung + giá + icon địa chỉ quán.
  const { mon, buoi } = kq
  if (!mon) {
    return (
      <TrangThaiRong>
        Chưa có món nào khớp khung bữa {TEN_BUOI[buoi]?.toLowerCase()} hôm nay.
      </TrangThaiRong>
    )
  }

  const banDo = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${mon.quan.ten_quan} ${mon.quan.dia_chi}`
  )}`

  return (
    <div className="mon-hom-nay">
      <div className="day">
        <p className="khoi__phu">Bữa {TEN_BUOI[buoi]?.toLowerCase()}</p>
        <p className="mon-hom-nay__ten">{mon.ten_mon}</p>
        <p className="chu-nho chu-nhat">
          {mon.quan.ten_quan} · {khoangCach(mon.quan.khoang_cach_m)}
        </p>
      </div>

      <div className="mon-hom-nay__phai">
        <span className="mon-hom-nay__gia">{tien(mon.gia)}</span>
        {/* Icon địa chỉ quán: bấm vào mở Google Maps (§3.1).
            ⚠ Bảng `quan` bản nháp (§8.2 tài liệu "Ăn gì hôm nay") chỉ có
            dia_chi, chưa có lat/lng — nên đây là liên kết tìm kiếm theo
            địa chỉ, chưa phải deep link tới toạ độ GPS như §3.1 mô tả. */}
        <a
          className="mon-hom-nay__ban-do"
          href={banDo}
          target="_blank"
          rel="noreferrer"
          aria-label={`Mở bản đồ tới ${mon.quan.ten_quan}`}
        >
          ⌖
        </a>
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
        <VongTron chinh phanTram={tt.phan_tram_dam} nhan="đạm hôm nay (theo lộ trình)" />

        {/* Nhãn dùng chữ "năng lượng", KHÔNG dùng chữ "calo" (§3.2). */}
        <VongTron phanTram={tt.phan_tram_nang_luong} nhan="năng lượng (theo lộ trình)" />
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
      tieuDe="Chi phí 7 ngày qua"
      phu="Tổng mỗi ngày · nghìn đồng"
      hanhDong={<Link className="lien-ket" to="/phan-tich">Xem chi tiết</Link>}
    >
      <BieuDoCot
        duLieu={duLieu.map((d) => ({ nhan: d.nhan, giaTri: Math.round(d.chiPhi / 1000) }))}
        donVi="k"
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

function KhoiMonDeXuat() {
  const ds = layDeXuatNoiBat(5)

  return (
    <Khoi
      tieuDe="Món ăn đề xuất"
      phu="Được chọn nhiều nhất 7 ngày qua"
      hanhDong={<Link className="lien-ket" to="/an-gi-hom-nay">Xem tất cả</Link>}
    >
      {ds.length === 0 ? (
        <TrangThaiRong>Chưa có dữ liệu 7 ngày qua.</TrangThaiRong>
      ) : (
        // Dải cuộn ngang, không tự xuống hàng ("Ăn gì hôm nay" §2.1)
        <div className="dai-ngang">
          {ds.map((m) => <TheMon key={m.id} mon={m} />)}
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

function KhoiGoiYNhanh() {
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
                      {t.ketQua.map((m) => <TheMon key={m.id} mon={m} />)}
                    </div>
                    {/* §1.2 — Dashboard KHÔNG ghi dữ liệu, không có nút
                        "chọn món"/"tick bữa" ở đây. */}
                    <p className="chu-be chu-nhat goi-y__dan-loi">
                      Bấm vào món để xem chi tiết và xác nhận ở trang Ăn gì hôm nay.
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
