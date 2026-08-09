/* =========================================================================
   NETLIFY FUNCTION — bản deploy thật của chat-server/server.js (07/08/2026,
   Pha 1). Y HỆT logic relay (giấu key, không có logic chấm điểm/lọc món —
   tool thật vẫn chạy ở client) — chỉ đổi khuôn từ http.createServer sang
   export mặc định kiểu Netlify Functions v2 (Request/Response chuẩn Web
   Fetch API). server.js VẪN GIỮ NGUYÊN, dùng cho dev cục bộ qua `npm run
   dev` (xem KhoiGoiYNhanh.jsx: DIA_CHI_SERVER_CHAT chọn theo
   import.meta.env.DEV). Key thật lấy từ Site settings → Environment
   variables trên Netlify dashboard (KHÔNG phải file .env — file đó chỉ
   dùng cho máy cục bộ). */

import { heThongPrompt } from '../../chat-server/heThongPrompt.js'
import { danhSachTool } from '../../chat-server/toolSchema.js'

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest'

function guiJson(maTrangThai, doiTuong) {
  return new Response(JSON.stringify(doiTuong), {
    status: maTrangThai,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

async function goiGemini(contents, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: heThongPrompt }] },
      contents,
      tools: [{ functionDeclarations: danhSachTool }],
    }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(`Gemini trả lỗi ${res.status}: ${JSON.stringify(json).slice(0, 500)}`)
  }
  return json
}

export default async (req) => {
  if (req.method !== 'POST') {
    return guiJson(405, { loi: 'Chỉ nhận POST.' })
  }

  const apiKey = process.env.GEMINI_API_KEY || ''
  if (!apiKey) {
    return guiJson(500, { loi: 'Server chưa cấu hình GEMINI_API_KEY — thêm ở Site settings → Environment variables trên Netlify.' })
  }

  let than
  try {
    than = await req.json()
  } catch {
    return guiJson(400, { loi: 'Nội dung gửi lên không đúng định dạng JSON.' })
  }

  if (!Array.isArray(than.contents)) {
    return guiJson(400, { loi: 'Thiếu "contents" (mảng lịch sử hội thoại đúng định dạng Gemini).' })
  }

  try {
    const ketQua = await goiGemini(than.contents, apiKey)
    return guiJson(200, ketQua)
  } catch (err) {
    return guiJson(502, { loi: `Không gọi được Gemini: ${err.message}` })
  }
}

export const config = { path: '/api/chat' }
