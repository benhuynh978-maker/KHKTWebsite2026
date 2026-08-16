/* =========================================================================
   GÁN MÃ DINH DƯỠNG TỰ ĐỘNG (15/08/2026) — phân loại tên món học sinh gửi
   vào ĐÚNG 1 mã có sẵn trong dinh_duong_mon_an, hoặc null nếu không món nào
   đủ giống. Dùng chung cho relay local (server.js) lẫn Netlify Function —
   cùng khuôn với chat.js/heThongPrompt.js, nhưng prompt/logic RIÊNG (không
   dùng chung heThongPrompt.js/toolSchema.js) vì đây là phân loại đóng 1 lần,
   không phải hội thoại nhiều lượt.

   CHỈ trả gợi ý (maDinhDuong/lyDo) — KHÔNG tự ghi Supabase. Việc ghi
   mon_an.ma_dinh_duong vẫn do client làm trong cùng lần insert như cũ
   (khoDeXuatMonQuan.js), món vẫn kẹt trang_thai_duyet='cho_duyet' chờ người
   duyệt tay qua Table Editor — mã gợi ý sai (nếu có) không bao giờ tự lộ ra
   công khai trước khi có người xem qua.

   Luôn kiểm tra mã Gemini trả về có THẬT SỰ nằm trong danh sách đã gửi hay
   không trước khi tin — chặn trường hợp model "bịa" 1 mã không tồn tại. */

import { heThongPromptGanMa } from './ganMaDinhDuongPrompt.js'

const SUPABASE_URL = 'https://hkwotpiaujevorjjgeoc.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-7nX2-zGndSOCJ4ocsVzLQ_ZIeXjHzA'

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    ma_dinh_duong: {
      type: 'STRING',
      nullable: true,
      description: 'Đúng 1 mã trong danh sách được cung cấp, hoặc null nếu không món nào đủ giống.',
    },
    ly_do: { type: 'STRING', description: 'Giải thích ngắn gọn (1 câu) vì sao chọn mã đó, hoặc vì sao không có mã nào phù hợp.' },
  },
  required: ['ma_dinh_duong', 'ly_do'],
}

async function layDanhSachMaDinhDuong() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/dinh_duong_mon_an?select=ma_dinh_duong,ten_mon_an&order=ma_dinh_duong.asc`,
    { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: 'application/json' } },
  )
  if (!res.ok) throw new Error(`Không lấy được danh sách mã dinh dưỡng (${res.status}).`)
  return res.json()
}

/** Phân loại 1 món vào đúng 1 mã dinh dưỡng có sẵn (hoặc null).
 *  Trả { ok:true, maDinhDuong, lyDo } hoặc { ok:false, loi } — KHÔNG BAO
 *  GIỜ ném lỗi ra ngoài (try/catch bọc TOÀN BỘ thân hàm, thêm 15/08/2026).
 *  Trước đó 2 chỗ dùng danhSach (map lúc dựng prompt, some lúc kiểm mã trả
 *  về) nằm ngoài mọi try/catch — nếu Supabase trả 200 nhưng nội dung không
 *  đúng dạng mảng như kỳ vọng, .map/.some ném lỗi không ai bắt. Ở server.js
 *  (dev cục bộ, Node http thuần, không có handler unhandledRejection) một
 *  lỗi ném ra mà không bị bắt sẽ làm SẬP CẢ TIẾN TRÌNH server, kéo theo cả
 *  /api/chat ngừng hoạt động tới khi khởi động lại tay — không chỉ 1 lượt
 *  gọi bị lỗi. Bọc ở đây (nguồn dùng chung) sửa 1 lần cho cả server.js lẫn
 *  Netlify Function, thay vì phải lặp lại try/catch ở từng route gọi vào. */
export async function phanLoaiMaDinhDuong({ tenMon, moTa, apiKey, model }) {
  try {
    if (!apiKey) return { ok: false, loi: 'Thiếu GEMINI_API_KEY.' }
    if (!tenMon?.trim()) return { ok: false, loi: 'Thiếu tên món.' }

    const danhSach = await layDanhSachMaDinhDuong()
    if (!Array.isArray(danhSach)) {
      return { ok: false, loi: 'Supabase trả về danh sách mã dinh dưỡng không đúng định dạng.' }
    }

    const danhSachText = danhSach.map((d) => `${d.ma_dinh_duong}: ${d.ten_mon_an}`).join('\n')
    const noiDungMon = `Tên món: ${tenMon.trim()}${moTa?.trim() ? `\nMô tả: ${moTa.trim()}` : ''}`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: heThongPromptGanMa(danhSachText) }] },
        contents: [{ role: 'user', parts: [{ text: noiDungMon }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA },
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(`Gemini trả lỗi ${res.status}: ${JSON.stringify(json).slice(0, 500)}`)

    let ketQua
    try {
      const vanBan = json.candidates?.[0]?.content?.parts?.[0]?.text
      ketQua = JSON.parse(vanBan)
    } catch {
      return { ok: false, loi: 'Gemini trả về không đúng định dạng JSON.' }
    }

    const maHopLe = ketQua.ma_dinh_duong && danhSach.some((d) => d.ma_dinh_duong === ketQua.ma_dinh_duong)
    return { ok: true, maDinhDuong: maHopLe ? ketQua.ma_dinh_duong : null, lyDo: ketQua.ly_do ?? '' }
  } catch (e) {
    return { ok: false, loi: e.message ?? String(e) }
  }
}
