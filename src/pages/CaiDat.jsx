/* =========================================================================
   TRANG CÀI ĐẶT
   Theo "Kế hoạch trang Hồ sơ & Cài đặt" §3.
   ========================================================================= */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Khoi from '../components/Khoi.jsx'
import { layHoSo, xoaToanBoDuLieu } from '../data/api.js'

export default function CaiDat() {
  const hoSo = layHoSo()
  const dieuHuong = useNavigate()

  return (
    <>
      <KhoiDangXuat dieuHuong={dieuHuong} />
      <KhoiDinhDanh maSo={hoSo.ma_6_so} />
      <KhoiQuyenRiengTu hoSo={hoSo} dieuHuong={dieuHuong} />
      <KhoiLienHeHoTro />
    </>
  )
}

/* --- §3.1 Đăng xuất ---------------------------------------------------- */

function KhoiDangXuat({ dieuHuong }) {
  const [daBam, datDaBam] = useState(false)

  // ⚠ Bản demo chưa có màn hình nhập mã 6 số / đăng nhập thật (§3.1: "xoá
  //   phiên đăng nhập hiện tại, quay về màn hình nhập mã 6 số"). Nút này
  //   chỉ mô phỏng — không có phiên đăng nhập thật nào để xoá.
  const dangXuat = () => {
    datDaBam(true)
    setTimeout(() => dieuHuong('/'), 700)
  }

  return (
    <Khoi tieuDe="Tài khoản">
      <button className="nut nut--rong" onClick={dangXuat} type="button" disabled={daBam}>
        {daBam ? 'Đang đăng xuất… (demo)' : 'Đăng xuất'}
      </button>
    </Khoi>
  )
}

/* --- §3.2 Định danh ------------------------------------------------------ */

function KhoiDinhDanh({ maSo }) {
  return (
    <Khoi tieuDe="Định danh">
      <p className="chu-nhat">Mã giả danh của bạn — chỉ xem, không đổi được:</p>
      <p className="ma-dinh-danh">{maSo || '(chưa có — hồ sơ đã bị xoá)'}</p>
    </Khoi>
  )
}

/* --- §3.3 Quyền riêng tư -------------------------------------------------- */

function KhoiQuyenRiengTu({ hoSo, dieuHuong }) {
  const [dangXacNhan, datDangXacNhan] = useState(false)
  const [daXoa, datDaXoa] = useState(false)

  const xacNhanXoa = () => {
    xoaToanBoDuLieu()
    datDangXacNhan(false)
    datDaXoa(true)
  }

  return (
    <Khoi tieuDe="Quyền riêng tư">
      {/* §3.3.1 — trạng thái đơn giản, KHÔNG có nút "xem lại toàn văn". */}
      <p className="chu-nhat">
        Trạng thái:{' '}
        {hoSo.da_dong_y
          ? <>Đã đồng ý — lần gần nhất: {hoSo.ngay_dong_y_gan_nhat}</>
          : <>Chưa đồng ý</>}
      </p>

      {daXoa ? (
        <p className="da-luu-thanh-cong">
          Đã xoá toàn bộ dữ liệu của bạn. Vào Hồ sơ để khai báo lại nếu muốn tiếp tục dùng.
        </p>
      ) : !dangXacNhan ? (
        <button className="nut nut--rong" onClick={() => datDangXacNhan(true)} type="button">
          Rút đồng ý &amp; xoá dữ liệu của tôi
        </button>
      ) : (
        <div className="xac-nhan-xoa">
          <p>
            Bạn có chắc muốn xoá TOÀN BỘ dữ liệu (hồ sơ, lộ trình, lịch sử ăn uống)?
            Không thể hoàn tác.
          </p>
          <div className="hang-nut-doi">
            <button className="nut nut--nguy-hiem" onClick={xacNhanXoa} type="button">
              Xác nhận xoá
            </button>
            <button className="nut" onClick={() => datDangXacNhan(false)} type="button">
              Huỷ
            </button>
          </div>
        </div>
      )}
    </Khoi>
  )
}

/* --- §3.4 Liên hệ hỗ trợ -------------------------------------------------- */

const NHOM_A = [
  { tinh_huong: 'Không đăng nhập được', huong_dan: 'Kiểm tra lại mã 6 số; nếu vẫn lỗi, gửi phản hồi bên dưới.' },
  { tinh_huong: 'Lộ trình báo "không tạo được"', huong_dan: 'Ngân sách chưa đủ sàn dinh dưỡng tối thiểu — hệ thống đã báo mức cần thiết, nâng ngân sách hoặc giảm buổi.' },
  { tinh_huong: 'Món gợi ý không hợp khẩu vị', huong_dan: 'Bấm "Món khác" để xem thêm, hoặc "Ăn ngoài lộ trình" nếu muốn ăn món khác hẳn.' },
  { tinh_huong: 'Dashboard không hiện vòng tròn đạm/năng lượng', huong_dan: 'Bình thường — chỉ hiện khi đang có lộ trình chạy; chưa tạo lộ trình thì trống.' },
  { tinh_huong: 'Bấm nhầm "Ăn ngoài lộ trình"', huong_dan: 'Vào Lịch sử, xoá đúng dòng đó, quay lại lộ trình chọn lại món.' },
  { tinh_huong: 'Muốn xoá dữ liệu', huong_dan: 'Ở ngay trên — mục "Rút đồng ý & xoá dữ liệu của tôi".' },
  { tinh_huong: 'Ai xem được dữ liệu của tôi', huong_dan: 'Nhóm thực hiện dự án, giáo viên hướng dẫn, và nhà trường — trong giai đoạn thử nghiệm.' },
]

const NHOM_B = [
  { tinh_huong: 'Số dinh dưỡng (kcal/đạm...) hiển thị có vẻ sai', huong_dan: 'Cảm ơn bạn phát hiện! Gửi tên món + nơi bạn thấy sai, nhóm sẽ kiểm tra lại.' },
  { tinh_huong: 'Mã 6 số của tôi bị người khác biết', huong_dan: 'Gửi phản hồi ngay, nhóm sẽ cấp mã mới cho bạn.' },
  { tinh_huong: 'Đã yêu cầu xoá nhưng vẫn thấy dữ liệu cũ', huong_dan: 'Thao tác xoá xử lý trong vòng 24 giờ. Nếu quá thời gian đó vẫn còn, gửi phản hồi.' },
  { tinh_huong: 'Muốn góp ý cải thiện app', huong_dan: 'Rất hoan nghênh — gửi qua form phản hồi, ghi rõ đây là góp ý (không phải lỗi).' },
]

function KhoiLienHeHoTro() {
  const [moTa, datMoTa] = useState('')
  const [maSoTuyChon, datMaSoTuyChon] = useState('')
  const [daGui, datDaGui] = useState(false)

  const gui = () => {
    if (!moTa.trim()) return
    // ⚠ Chưa nối backend — bản demo chỉ hiện trạng thái đã gửi, chưa thật
    //   sự lưu/chuyển tiếp phản hồi đi đâu.
    datDaGui(true)
    datMoTa('')
  }

  return (
    <Khoi tieuDe="Liên hệ hỗ trợ">
      <div className="bang-ho-tro">
        {NHOM_A.map((d) => (
          <div className="bang-ho-tro__dong" key={d.tinh_huong}>
            <p className="bang-ho-tro__tinh-huong">{d.tinh_huong}</p>
            <p className="chu-nhat chu-nho">{d.huong_dan}</p>
          </div>
        ))}
      </div>

      <p className="bang-ho-tro__nhom-tieu-de">Cần gửi phản hồi cho nhóm</p>
      <div className="bang-ho-tro">
        {NHOM_B.map((d) => (
          <div className="bang-ho-tro__dong" key={d.tinh_huong}>
            <p className="bang-ho-tro__tinh-huong">{d.tinh_huong}</p>
            <p className="chu-nhat chu-nho">{d.huong_dan}</p>
          </div>
        ))}
      </div>

      {/* Nhóm C — an toàn sức khoẻ, tách riêng, nổi bật. */}
      <div className="canh-bao-benh-ly bang-ho-tro__nhom-c">
        <p className="bang-ho-tro__tinh-huong">
          ⚠ Hệ thống gợi ý món có chứa dị ứng tôi đã khai báo
        </p>
        <p className="chu-nho">
          KHÔNG ăn món đó. Kiểm tra lại mục dị ứng trong Hồ sơ đã lưu đúng chưa.
          Đây là lỗi nghiêm trọng — báo ngay cho nhóm qua form bên dưới.
        </p>
      </div>

      <div className="form-phan-hoi">
        <textarea
          rows={3}
          placeholder="Mô tả vấn đề bạn gặp phải..."
          value={moTa}
          onChange={(e) => datMoTa(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mã 6 số (tuỳ chọn, để nhóm phản hồi lại)"
          value={maSoTuyChon}
          onChange={(e) => datMaSoTuyChon(e.target.value)}
        />
        <button className="nut nut--chinh nut--rong" onClick={gui} type="button">
          Gửi phản hồi
        </button>
        {daGui && <p className="da-luu-thanh-cong">Đã gửi. Cảm ơn bạn!</p>}
      </div>

      <p className="chu-nho chu-nhat lien-he-thong-tin">
        Email nhóm nghiên cứu: benhuynh978@gmail.com · Thời gian phản hồi dự kiến: trung bình 24 giờ.
        Không thu số điện thoại (R-26) — mã 6 số (tuỳ chọn) đã đủ để nhóm tra cứu và phản hồi.
      </p>
    </Khoi>
  )
}
