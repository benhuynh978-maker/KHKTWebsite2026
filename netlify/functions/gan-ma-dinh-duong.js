/* =========================================================================
   NETLIFY FUNCTION — gán mã dinh dưỡng tự động cho món học sinh gửi
   (15/08/2026). Cùng khuôn chat.js (Netlify Functions v2, Web Fetch API)
   nhưng logic/prompt RIÊNG — xem chat-server/ganMaDinhDuong.js. Dùng cho
   dev cục bộ qua chat-server/server.js (route thêm cùng file), bản deploy
   thật dùng file này. Key thật lấy từ Site settings → Environment variables
   trên Netlify (không phải file .env — file đó chỉ dùng cho máy cục bộ). */

import { phanLoaiMaDinhDuong } from '../../chat-server/ganMaDinhDuong.js'

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest'

function guiJson(maTrangThai, doiTuong) {
  return new Response(JSON.stringify(doiTuong), {
    status: maTrangThai,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export default async (req) => {
  if (req.method !== 'POST') return guiJson(405, { loi: 'Chỉ nhận POST.' })

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

  const ketQua = await phanLoaiMaDinhDuong({ tenMon: than.tenMon, moTa: than.moTa, apiKey, model: GEMINI_MODEL })
  if (!ketQua.ok) return guiJson(502, { loi: ketQua.loi })
  return guiJson(200, { maDinhDuong: ketQua.maDinhDuong, lyDo: ketQua.lyDo })
}

export const config = { path: '/api/gan-ma-dinh-duong' }
