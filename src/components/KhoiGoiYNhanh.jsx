/* =========================================================================
   KHỐI 5 — GỢI Ý NHANH, CHAT AI THẬT (Pha 1, 07/08/2026)
   -------------------------------------------------------------------------
   Tách ra từ Dashboard.jsx — trước đó là bản DEMO (setTimeout + goiYNhanh()
   cố định "rẻ nhất", gõ gì cũng ra cùng 1 kết quả). Nay nối Gemini thật qua
   relay riêng của Website/ (chat-server/server.js lúc `npm run dev`,
   netlify/functions/chat.js lúc deploy — port từ test/dieu-phoi-chat.js,
   xem NHAT-KY-AI.md 07/08/2026 "Pha 1").

   Kiến trúc giữ nguyên như test/: TOOL CHẠY Ở CLIENT (api.js:timMonChat/
   traCuuMonTheoTen/traCuuQuan, dùng engine Pha 0), server chỉ relay + giấu
   key — không có bản sao logic chấm điểm nào ở server.

   ⚠ Không tự đọc hồ sơ đã lưu — chính sách giữ nguyên từ test/ (xem ghi
   chú ở api.js). Không lưu localStorage — đổi trang/tải lại trang là hội
   thoại mới (đúng triết lý §1.2 Dashboard: hub, không phải nơi giữ trạng
   thái lâu dài).
   ========================================================================= */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Khoi from './Khoi.jsx'
import TheMon from './TheMon.jsx'
import MienTru from './MienTru.jsx'
import GhiNhanPhuTro from './GhiNhanPhuTro.jsx'
import ThongTinGoiY from './ThongTinGoiY.jsx'
import { timMonChat, traCuuMonTheoTen, traCuuQuan } from '../data/api.js'
import { THOI_GIAN_CHO_TOI_DA_MS } from '../data/supabase/client.js'

const DIA_CHI_API_CHAT = import.meta.env.DEV ? 'http://localhost:8787/api/chat' : '/api/chat'
const GIOI_HAN_VONG_GOI_TOOL = 3

const NUT_GOI_Y = [
  { ma: 'goi_y', nhan: 'Gợi ý nhanh' },
  { ma: 're_nhat', nhan: 'Rẻ nhất' },
  { ma: 'nhieu_dam', nhan: 'Nhiều đạm' },
  { ma: 'nhieu_canxi', nhan: 'Nhiều canxi' },
  { ma: 'nhieu_sat', nhan: 'Nhiều sắt' },
  { ma: 'nhieu_kem', nhan: 'Nhiều kẽm' },
]

const NOI_DUNG_CHIP = {
  goi_y: 'Gợi ý cho mình một món ăn.',
  re_nhat: 'Món nào rẻ nhất?',
  nhieu_dam: 'Gợi ý món nhiều đạm.',
  nhieu_canxi: 'Gợi ý món nhiều canxi.',
  nhieu_sat: 'Gợi ý món nhiều sắt.',
  nhieu_kem: 'Gợi ý món nhiều kẽm.',
}

/** Gemini hay trả lời kèm markdown **đậm** (tên món, nhãn giá...) — khung
 *  chat trước đây hiện nguyên dấu ** cho học sinh xem (15/08/2026, phát
 *  hiện lúc kiểm giao diện mobile). Chỉ xử lý đúng **đậm**, không cần cả
 *  thư viện markdown cho 1 kiểu định dạng duy nhất Gemini hay dùng. */
function chuCoDam(dong) {
  return dong.split(/(\*\*[^*]+\*\*)/g).map((doan, i) => (
    doan.startsWith('**') && doan.endsWith('**')
      ? <strong key={i}>{doan.slice(2, -2)}</strong>
      : doan
  ))
}

/* Đòi PHẢI có khoảng trắng sau dấu, nhờ vậy "**Món ăn**" (in đậm) không bị
   nhận nhầm là gạch đầu dòng. */
const DAU_GACH_DAU_DONG = /^\s*[-*•]\s+/

/** Cả câu trả lời trước đây nhét vào MỘT thẻ <p> nên mọi dấu xuống dòng của
 *  Gemini bị nuốt: danh sách 4 mục dồn thành một đoạn dài, dấu "-"/"*" nằm
 *  lửng giữa câu. Dựng lại theo từng dòng — gom dòng gạch đầu dòng liên tiếp
 *  thành <ul> thật, phần còn lại thành đoạn riêng. */
function dungVanBanAI(vanBan) {
  if (!vanBan) return vanBan

  const khoi = []
  let dsDangGom = null
  const chotDs = () => { if (dsDangGom) { khoi.push(dsDangGom); dsDangGom = null } }

  vanBan.split('\n').map((d) => d.trim()).filter(Boolean).forEach((d, i) => {
    if (DAU_GACH_DAU_DONG.test(d)) {
      if (!dsDangGom) dsDangGom = { loai: 'ds', id: i, muc: [] }
      dsDangGom.muc.push({ id: i, chu: d.replace(DAU_GACH_DAU_DONG, '') })
    } else {
      chotDs()
      khoi.push({ loai: 'doan', id: i, chu: d })
    }
  })
  chotDs()

  return khoi.map((k) => (
    k.loai === 'ds'
      ? <ul className="chat-ds" key={`ds-${k.id}`}>{k.muc.map((m) => <li key={m.id}>{chuCoDam(m.chu)}</li>)}</ul>
      : <p className="chat-doan" key={`doan-${k.id}`}>{chuCoDam(k.chu)}</p>
  ))
}

async function goiServerChat(contents) {
  const dieuKhien = new AbortController()
  const idHetGio = setTimeout(() => dieuKhien.abort(), THOI_GIAN_CHO_TOI_DA_MS)
  try {
    const res = await fetch(DIA_CHI_API_CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
      signal: dieuKhien.signal,
    })
    clearTimeout(idHetGio)
    const json = await res.json()
    if (!res.ok) return { ok: false, loi: json.loi || `Server chat báo lỗi (mã ${res.status}).` }
    return { ok: true, ketQua: json }
  } catch (err) {
    clearTimeout(idHetGio)
    if (err.name === 'AbortError') {
      return { ok: false, loi: `Server chat không phản hồi sau ${THOI_GIAN_CHO_TOI_DA_MS / 1000}s.` }
    }
    return {
      ok: false,
      loi: import.meta.env.DEV
        ? `Không gọi được server chat — đã chạy "node chat-server/server.js" chưa? Chi tiết: ${err.message}`
        : `Không gọi được server chat. Chi tiết: ${err.message}`,
    }
  }
}

function chayTool(tenTool, thamSo, maMonDaGoiY) {
  if (tenTool === 'tra_cuu_mon_theo_ten') return traCuuMonTheoTen(thamSo || {})
  if (tenTool === 'tra_cuu_quan') return traCuuQuan(thamSo || {})
  if (tenTool === 'tim_mon') return timMonChat(thamSo || {}, maMonDaGoiY)
  return { timDuoc: false, lyDo: `Không có tool tên "${tenTool}".` }
}

export default function KhoiGoiYNhanh({ onChonMon }) {
  const [tinNhan, datTinNhan] = useState([
    { id: 'chao', vaiTro: 'ai', noiDung: 'Xin chào! Mình là trợ lý dinh dưỡng — hỏi mình về món ăn, giá cả, hoặc dinh dưỡng nhé.' },
  ])
  const [dangGo, datDangGo] = useState('')
  const [dangGui, datDangGui] = useState(false)

  // Không phải state React — chỉ ảnh hưởng luồng gửi/nhận, không cần vẽ lại.
  const lichSuGemini = useRef([])
  const maMonDaGoiYTrongPhien = useRef(new Set())

  // Nút "Ghi nhận" ở khối bổ sung — THẬT từ 14/08/2026 (trước đó chỉ demo,
  // xem NHAT-KY-AI.md). Mở modal GhiNhanPhuTro.jsx tìm/chọn 1 sản phẩm THẬT
  // (san_pham_phu_tro, khác thuc_pham_tham_khao đang gợi ý) rồi ghi vào
  // phu_tro_ghi_nhan. `dangMoGhiNhan` giữ khoá `${idTin}:${idMon}` của
  // dòng đang mở modal (null = không mở). `daGhiNhanBoSung` chỉ là NHẬT
  // KÝ HIỂN THỊ trong phiên (không chặn ghi lại — sql/15 cố ý cho phép mỗi
  // lần ăn là 1 dòng mới), nút KHÔNG khoá sau khi ghi nhận.
  const [dangMoGhiNhan, datDangMoGhiNhan] = useState(null)
  const [daGhiNhanBoSung, datDaGhiNhanBoSung] = useState(new Set())

  // Khu tin nhắn cuộn riêng và bị chặn trần chiều cao — không tự kéo xuống
  // thì câu trả lời mới nằm khuất dưới đáy, học sinh tưởng AI không trả lời.
  const khuTinNhanRef = useRef(null)
  useLayoutEffect(() => {
    const el = khuTinNhanRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [tinNhan])

  // <textarea rows=1> không tự cao lên theo nội dung — gõ câu dài chỉ thấy
  // một dòng. Trần 160px khớp `max-height` của .o-nhap-chat.
  const oNhapRef = useRef(null)
  useEffect(() => {
    const el = oNhapRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [dangGo])

  const guiTin = async (noiDung) => {
    if (dangGui) return
    lichSuGemini.current.push({ role: 'user', parts: [{ text: noiDung }] })
    datTinNhan((ds) => [
      ...ds,
      { id: `nd-${Date.now()}`, vaiTro: 'nguoiDung', noiDung },
      { id: 'dang-xu-ly', loai: 'dangGo' },
    ])
    datDangGo('')
    datDangGui(true)

    let danhSachMonDinhKem = []
    let soVongGoiTool = 0

    for (;;) {
      const phanHoi = await goiServerChat(lichSuGemini.current)

      if (!phanHoi.ok) {
        datTinNhan((ds) => [...ds.filter((t) => t.id !== 'dang-xu-ly'), { id: `loi-${Date.now()}`, vaiTro: 'loi', noiDung: phanHoi.loi }])
        break
      }

      const parts = phanHoi.ketQua?.candidates?.[0]?.content?.parts || []
      const luotGoiTool = parts.find((p) => p.functionCall)

      if (!luotGoiTool || soVongGoiTool >= GIOI_HAN_VONG_GOI_TOOL) {
        const vanBan = parts.filter((p) => p.text).map((p) => p.text).join('\n').trim()
        lichSuGemini.current.push({ role: 'model', parts })
        datTinNhan((ds) => [...ds.filter((t) => t.id !== 'dang-xu-ly'), {
          id: `ai-${Date.now()}`,
          vaiTro: 'ai',
          noiDung: vanBan || 'Xin lỗi, mình chưa trả lời được câu này.',
          monList: danhSachMonDinhKem.length > 0 ? danhSachMonDinhKem : null,
        }])
        break
      }

      soVongGoiTool += 1
      lichSuGemini.current.push({ role: 'model', parts })
      datTinNhan((ds) => [...ds.filter((t) => t.id !== 'dang-xu-ly'), { id: 'dang-xu-ly', loai: 'dangGoiTool', tenViec: 'Đang tìm món phù hợp...' }])

      const { name: tenTool, args: thamSo } = luotGoiTool.functionCall
      let ketQuaTool
      try {
        ketQuaTool = chayTool(tenTool, thamSo, maMonDaGoiYTrongPhien.current)
      } catch (err) {
        ketQuaTool = { timDuoc: false, lyDo: `Lỗi khi tìm món (${err.message}) — thử hỏi lại theo cách khác.` }
      }

      if (ketQuaTool.timDuoc && ketQuaTool.monList) {
        danhSachMonDinhKem = [...danhSachMonDinhKem, ...ketQuaTool.monList]
        ketQuaTool.monList.forEach((m) => { if (m.id) maMonDaGoiYTrongPhien.current.add(m.id) })
      }

      // Gửi lại Gemini bản RÚT GỌN (tomTat) — không gửi monList đầy đủ (đỡ
      // token, tránh lộ field nội bộ như sai số/mon_goc_id không cần AI biết).
      const phanHoiChoGemini = { ...ketQuaTool }
      if ('monList' in phanHoiChoGemini) {
        phanHoiChoGemini.monList = phanHoiChoGemini.tomTat
        delete phanHoiChoGemini.tomTat
      }
      lichSuGemini.current.push({ role: 'user', parts: [{ functionResponse: { name: tenTool, response: phanHoiChoGemini } }] })
    }

    datDangGui(false)
  }

  const guiTuDo = (e) => {
    e.preventDefault()
    const vanBan = dangGo.trim()
    if (!vanBan) return
    guiTin(vanBan)
  }

  return (
    <>
    <Khoi tieuDe="Gợi ý nhanh" phu="Chat để tìm nhanh một bữa, không cần lộ trình">
      <div className="khu-tin-nhan" ref={khuTinNhanRef}>
        {tinNhan.map((t) => {
          if (t.loai === 'dangGo') {
            return (
              <div className="chat-bong chat-bong--ai" key={t.id}>
                <span className="chat-cham-nhay" aria-label="AI đang soạn câu trả lời">
                  <span></span><span></span><span></span>
                </span>
              </div>
            )
          }
          if (t.loai === 'dangGoiTool') {
            return (
              <div className="chat-bong chat-bong--ai" key={t.id}>
                <span className="chat-dang-goi-tool" aria-label={t.tenViec}>
                  <span className="chat-xoay" aria-hidden="true">⟳</span>
                  {t.tenViec}
                </span>
              </div>
            )
          }
          if (t.vaiTro === 'nguoiDung') {
            return <div className="chat-bong chat-bong--nguoi-dung" key={t.id}>{t.noiDung}</div>
          }
          return (
            <div className={`chat-bong chat-bong--ai${t.vaiTro === 'loi' ? ' chat-bong--loi' : ''}`} key={t.id}>
              <div className="chat-noi-dung">{dungVanBanAI(t.noiDung)}</div>
              {t.monList && t.monList.length > 0 && (
                <>
                  <div className="dai-ngang dai-ngang--tren">
                    {t.monList.map((m) => (
                      <div className="khoi-mon-chat" key={m.id}>
                        <TheMon mon={m} onChon={onChonMon} />
                        {m.goiYBoSung && (
                          <div className="goi-y-bo-sung">
                            <p className="goi-y-bo-sung__tieu-de chu-nhat">
                              Có thể bổ sung thêm (tuỳ chọn){' '}
                              <ThongTinGoiY noiDung="Gợi ý này giúp bù phần năng lượng/canxi/sắt/kẽm còn thiếu so với mục tiêu bữa vừa ghi nhận — không bắt buộc, chỉ là gợi ý thêm nếu bạn muốn." />
                            </p>
                            <p className="goi-y-bo-sung__mon">{m.goiYBoSung.phuTro.ten}</p>
                            <button
                              type="button"
                              className="nut nut--chip goi-y-bo-sung__nut-ghi-nhan"
                              onClick={() => datDangMoGhiNhan({
                                khoa: `${t.id}:${m.id}`,
                                tuKhoaBanDau: m.goiYBoSung.phuTro.ten,
                                diUngDaChon: m.diUngDaChon,
                              })}
                            >
                              Ghi nhận
                            </button>
                            {daGhiNhanBoSung.has(`${t.id}:${m.id}`) && (
                              <p className="chu-nho chu-nhat">✓ Đã ghi nhận trong phiên này — vẫn ghi thêm được nếu ăn tiếp.</p>
                            )}
                            <MienTru gonGang />
                          </div>
                        )}
                      </div>
                    ))}
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
        })}
      </div>

      <div className="hang-box-nhanh">
        {NUT_GOI_Y.map((n) => (
          <button
            key={n.ma}
            type="button"
            className="nut nut--chip"
            disabled={dangGui}
            onClick={() => guiTin(NOI_DUNG_CHIP[n.ma])}
          >
            {n.nhan}
          </button>
        ))}
      </div>

      <form className="khu-nhap-chat" onSubmit={guiTuDo}>
        <textarea
          rows={1}
          ref={oNhapRef}
          className="o-nhap-chat"
          placeholder="Gõ yêu cầu của bạn..."
          value={dangGo}
          disabled={dangGui}
          onChange={(e) => datDangGo(e.target.value)}
        />
        <button className="nut nut--chinh nut--gui-chat" type="submit" disabled={!dangGo.trim() || dangGui}>Gửi</button>
      </form>
    </Khoi>

    {dangMoGhiNhan && (
      <GhiNhanPhuTro
        tuKhoaBanDau={dangMoGhiNhan.tuKhoaBanDau}
        diUngDaChon={dangMoGhiNhan.diUngDaChon}
        onDong={() => datDangMoGhiNhan(null)}
        onGhiNhanXong={() => {
          const khoa = dangMoGhiNhan.khoa
          datDaGhiNhanBoSung((s) => new Set(s).add(khoa))
        }}
      />
    )}
    </>
  )
}
