import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StudentLogin from './pages/StudentLogin'
import StudentAttendance from './pages/StudentAttendance-simple'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminMembers from './pages/AdminMembers'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import AdminLayout from './components/AdminLayout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        
        {/* 관리자 로그인 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* 관리자 보호된 라우트 */}
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/members" element={<AdminMembers />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
