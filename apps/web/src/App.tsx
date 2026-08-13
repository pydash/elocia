import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import TeacherLayout from "./layouts/TeacherLayout.tsx";
import TeacherDashboard from './pages/teacher/Dashboard'
import ParentDashboard from './pages/parent/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/teacher" element={<TeacherLayout />}>
           <Route index element={<TeacherDashboard />} />
        </Route>

        <Route path="/parent" element={<ParentDashboard />} />

        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App