import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing.tsx";
import TeacherLogin from "./pages/teacher/Login.tsx";
import ParentLogin from "./pages/parent/Login.tsx";
import TeacherLayout from "./layouts/TeacherLayout.tsx";
import TeacherStudents from "./pages/teacher/Students.tsx";
import ParentLayout from "./layouts/ParentLayout.tsx";
import ParentDashboard from "./pages/parent/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";

import TeacherLessons from "./pages/teacher/Lessons.tsx";
import TeacherTasks from "./pages/teacher/Tasks.tsx";
import TeacherSettings from "./pages/teacher/Settings.tsx";
import TeacherHelp from "./pages/teacher/Help.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/parent/login" element={<ParentLogin />} />

        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="students" index element={<TeacherStudents />} />
          <Route path="lessons" element={<TeacherLessons />} />
          <Route path="tasks" element={<TeacherTasks />} />
          <Route path="settings" element={<TeacherSettings />} />
          <Route path="help" element={<TeacherHelp />} />
        </Route>

        <Route path="/parent" element={<ParentLayout />}>
          <Route index element={<ParentDashboard />} />
        </Route>

        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
