import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'

import BoCuc from './components/BoCuc.jsx'
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
import { daQuaDangNhapDemo } from './lib/demoAuth.js'

// Cổng demo (xem lib/demoAuth.js) — chưa "qua cổng" thì đá về /dang-nhap.
function ConGate() {
  return daQuaDangNhapDemo() ? <Outlet /> : <Navigate to="/dang-nhap" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="dang-nhap" element={<DangNhap />} />
        <Route path="dang-ky" element={<DangKy />} />

        <Route element={<ConGate />}>
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
      </Routes>
    </BrowserRouter>
  )
}
