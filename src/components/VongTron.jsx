/* =========================================================================
   VÒNG TRÒN PHẦN TRĂM — Khối 1, Phần B của Dashboard
   Nguyên tắc hiển thị theo "Kế hoạch trang Dashboard" §3.2, có căn cứ
   nghiên cứu ở §8 (4 vòng nghiên cứu về hiển thị số cho tuổi vị thành niên).
   -------------------------------------------------------------------------
   NHỮNG ĐIỀU COMPONENT NÀY CỐ Ý KHÔNG LÀM — đừng thêm vào sau:

   1. CHỈ nhận `phanTram`. Không nhận gram, không nhận kcal.
      §3.2: "Chỉ hiện phần trăm — KHÔNG hiện số gram/kcal thô, dù chỉ là
      chữ nhỏ phụ." Ép ở chữ ký hàm thì không ai lỡ tay truyền số thô vào.

   2. KHÔNG có ngưỡng đổi màu, KHÔNG có prop cảnh báo.
      §3.2: "KHÔNG có cảnh báo, màu đỏ, hay thông điệp ở BẤT KỲ mức phần
      trăm nào." Nghiên cứu vòng 1–3 (§8) cho thấy cảnh báo hạn mức tạo ám
      ảnh với đồ ăn và kích hoạt tư duy trắng-đen ở lứa tuổi này.

   3. Khung ngôn ngữ "ĐÃ ĐẠT ĐƯỢC", không phải "còn lại / còn thiếu".
      Nhãn truyền vào phải theo mẫu "đạm hôm nay", không phải "còn thiếu đạm".

   4. Làm tròn số nguyên khi HIỂN THỊ; số truyền vào giữ nguyên độ chính xác.
   ========================================================================= */

export default function VongTron({ phanTram, nhan, chinh = false }) {
  const kichThuoc = chinh ? 132 : 104
  const doDay = chinh ? 12 : 10
  const banKinh = (kichThuoc - doDay) / 2
  const chuVi = 2 * Math.PI * banKinh

  // Cung tròn không vẽ quá một vòng được — nhưng SỐ hiển thị luôn là số thật,
  // không cắt bớt. Vẽ và khai báo là hai việc khác nhau.
  const tiLeVe = Math.min(Math.max(phanTram, 0), 100) / 100
  const soHienThi = Math.round(phanTram)

  return (
    <div className={`vong-tron${chinh ? ' vong-tron--chinh' : ''}`}>
      <svg width={kichThuoc} height={kichThuoc} role="img"
           aria-label={`${nhan}: ${soHienThi} phần trăm`}>
        <circle
          cx={kichThuoc / 2} cy={kichThuoc / 2} r={banKinh}
          fill="none" strokeWidth={doDay}
          className="vong-tron__ray"
        />
        <circle
          cx={kichThuoc / 2} cy={kichThuoc / 2} r={banKinh}
          fill="none" strokeWidth={doDay} strokeLinecap="round"
          strokeDasharray={chuVi}
          strokeDashoffset={chuVi * (1 - tiLeVe)}
          transform={`rotate(-90 ${kichThuoc / 2} ${kichThuoc / 2})`}
          className="vong-tron__cung"
        />
        <text
          x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
          className="vong-tron__so"
        >
          {soHienThi}%
        </text>
      </svg>
      <span className="vong-tron__nhan">{nhan}</span>
    </div>
  )
}
