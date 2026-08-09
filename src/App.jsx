import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'

import BoCuc from './components/BoCuc.jsx'
import CongDuLieu from './components/CongDuLieu.jsx'
import DangNhap from './pages/DangNhap.jsx'
import DangKy from './pages/DangKy.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AnGiHomNay from './pages/AnGiHomNay.jsx'
import QuanAnGanDay from './pages/QuanAnGanDay.jsx'
import LoTrinh from './pages/LoTrinh.jsx'
import HoSo from './pages/HoSo.jsx'
import CaiDat from './pages/CaiDat.jsx'
import LichSu from './pages/LichSu.jsx'
import PhanTich from './pages/PhanTich.jsx'
import { coPhienDangNhap } from './data/supabase/khoXacThuc.js'

// Chưa có phiên đăng nhập thật (Supabase Auth) thì đá về /dang-nhap.
// getSession() là bất đồng bộ — cần chờ trước khi quyết định, không thể
// đọc đồng bộ như cờ demo cũ.
function ConGate() {
  const [coPhien, datCoPhien] = useState(null) // null = đang kiểm

  useEffect(() => {
    let huy = false
    coPhienDangNhap().then((kq) => { if (!huy) datCoPhien(kq) })
    return () => { huy = true }
  }, [])

  if (coPhien === null) return null
  return coPhien ? <Outlet /> : <Navigate to="/dang-nhap" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="dang-nhap" element={<DangNhap />} />
        <Route path="dang-ky" element={<DangKy />} />

        <Route element={<ConGate />}>
          <Route element={<CongDuLieu />}>
            <Route element={<BoCuc />}>
              <Route index element={<Dashboard />} />
              <Route path="lo-trinh"        element={<LoTrinh />} />
              <Route path="an-gi-hom-nay"   element={<AnGiHomNay />} />
              <Route path="quan-an-gan-day" element={<QuanAnGanDay />} />
              <Route path="lich-su"         element={<LichSu />} />
              <Route path="phan-tich"       element={<PhanTich />} />
              <Route path="ho-so"           element={<HoSo />} />
              <Route path="cai-dat"         element={<CaiDat />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
