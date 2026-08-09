/* =========================================================================
   RELAY LOCAL DEV — port từ test/chat-server/server.js (07/08/2026, Pha 1).
   Backend NHỎ NHẤT có thể, chỉ giữ GEMINI_API_KEY và nói chuyện với Gemini
   thay client. KHÔNG đụng Supabase, KHÔNG có logic chấm điểm/lọc món — tool
   THẬT chạy ở client (KhoiGoiYNhanh.jsx), server chỉ relay + giấu key,
   tránh 2 bản logic song song. Không dùng framework ngoài (http/fetch có
   sẵn từ Node) — zero dependency cho dễ chạy.

   Chạy: `node chat-server/server.js` (cần copy .env.example -> .env, điền
   GEMINI_API_KEY trước). Chỉ dùng khi `npm run dev` (Vite) — bản deploy
   thật dùng netlify/functions/chat.js (dùng chung prompt/tool-schema này). */

import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { heThongPrompt } from './heThongPrompt.js'
import { danhSachTool } from './toolSchema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

try {
  process.loadEnvFile(path.join(__dirname, '.env'))
} catch {
  console.warn('[canh-bao] Chưa có file .env (xem .env.example) — server vẫn chạy nhưng /api/chat sẽ báo lỗi thiếu khoá.')
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest'
const CONG = Number(process.env.PORT) || 8787

function ghiCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function guiJson(res, maTrangThai, doiTuong) {
  res.writeHead(maTrangThai, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(doiTuong))
}

function docThanJson(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => { raw += chunk })
    req.on('end', () => {
      if (!raw) { resolve({}); return }
      try { resolve(JSON.parse(raw)) }
      catch (err) { reject(err) }
    })
    req.on('error', reject)
  })
}

async function goiGemini(contents) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
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

const server = http.createServer(async (req, res) => {
  ghiCors(res)

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  if (req.url !== '/api/chat') {
    guiJson(res, 404, { loi: 'Không tìm thấy đường dẫn — chỉ có POST /api/chat.' })
    return
  }
  if (req.method !== 'POST') {
    guiJson(res, 405, { loi: 'Chỉ nhận POST.' })
    return
  }
  if (!GEMINI_API_KEY) {
    guiJson(res, 500, { loi: 'Server chưa cấu hình GEMINI_API_KEY — copy .env.example thành .env rồi điền khoá.' })
    return
  }

  let than
  try {
    than = await docThanJson(req)
  } catch {
    guiJson(res, 400, { loi: 'Nội dung gửi lên không đúng định dạng JSON.' })
    return
  }

  if (!Array.isArray(than.contents)) {
    guiJson(res, 400, { loi: 'Thiếu "contents" (mảng lịch sử hội thoại đúng định dạng Gemini).' })
    return
  }

  try {
    const ketQua = await goiGemini(than.contents)
    guiJson(res, 200, ketQua)
  } catch (err) {
    console.error(err)
    guiJson(res, 502, { loi: `Không gọi được Gemini: ${err.message}` })
  }
})

server.listen(CONG, () => {
  console.log(`[chat-server] Đang chạy tại http://localhost:${CONG} — model ${GEMINI_MODEL}`)
})
