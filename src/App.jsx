import { BrowserRouter, Routes, Route } from 'react-router-dom'

import BoCuc from './components/BoCuc.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AnGiHomNay from './pages/AnGiHomNay.jsx'
import QuanAnGanDay from './pages/QuanAnGanDay.jsx'
import LoTrinh from './pages/LoTrinh.jsx'
import HoSo from './pages/HoSo.jsx'
import CaiDat from './pages/CaiDat.jsx'
import LichSu from './pages/LichSu.jsx'
import PhanTich from './pages/PhanTich.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  )
}
