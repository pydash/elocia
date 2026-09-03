import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage.tsx";

// Teacher Pages
import TeacherLayout from "./layouts/TeacherLayout.tsx";
import TeacherAddLessonLayout from "./layouts/TeacherAddLessonLayout.tsx";
import TeacherLoginPage from "./pages/teacher/LoginPage.tsx";
import TeacherStudentsPage from "./pages/teacher/StudentsPage.tsx";
import TeacherStudentProfilePage from "./pages/teacher/StudentProfilePage.tsx";
import TeacherLessonsPage from "./pages/teacher/LessonsPage.tsx";
import {
  TeacherAddLessonStepOnePage,
  TeacherAddLessonStepTwoPage,
  TeacherAddLessonStepThreePage,
} from "./pages/teacher/AddLessonPage.tsx";
import TeacherTasksPage from "./pages/teacher/TasksPage.tsx";
import TeacherAddGameActivityLayout from "./layouts/TeacherAddGameActivityLayout.tsx";
import {
  TeacherAddGameActivityStepOnePage,
  TeacherAddGameActivityStepTwoPage,
  TeacherAddGameActivityStepThreePage,
} from "./pages/teacher/AddGameActivityPage.tsx";
import TeacherUploadVideoLayout from "./layouts/TeacherUploadVideoLayout.tsx";
import {
  TeacherUploadVideoStepOnePage,
  TeacherUploadVideoStepTwoPage,
  TeacherUploadVideoStepThreePage,
} from "./pages/teacher/UploadVideoPage.tsx";
import TeacherSettingsPage from "./pages/teacher/SettingsPage.tsx";
import TeacherHelpPage from "./pages/teacher/HelpPage.tsx";

// Parent Pages
import ParentLoginPage from "./pages/parent/LoginPage.tsx";
import ParentLayout from "./layouts/ParentLayout.tsx";
import ParentHomePage from "@/pages/parent/HomePage.tsx";
import ParentStudentProfilePage from "./pages/parent/StudentProfilePage.tsx";

//
import AdminDashboard from "./pages/admin/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Login */}
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/parent/login" element={<ParentLoginPage />} />

        {/* Teacher */}
        <Route path="/teacher" element={<TeacherLayout />}>
          {/* Students */}
          <Route path="students" index element={<TeacherStudentsPage />} />
          <Route
            path="students/:username"
            element={<TeacherStudentProfilePage />}
          />

          {/* Lessons */}
          <Route path="lessons" element={<TeacherLessonsPage />} />
          <Route path="lessons/new" element={<TeacherAddLessonLayout />}>
            <Route
              index
              path="step-1"
              element={<TeacherAddLessonStepOnePage />}
            />
            <Route path="step-2" element={<TeacherAddLessonStepTwoPage />} />
            <Route path="step-3" element={<TeacherAddLessonStepThreePage />} />
          </Route>

          {/* Tasks */}
          <Route path="tasks" element={<TeacherTasksPage />} />
          <Route
            path="tasks/:gameTitle"
            element={<TeacherAddGameActivityLayout />}
          >
            <Route
              index
              path="step-1"
              element={<TeacherAddGameActivityStepOnePage />}
            />
            <Route
              path="step-2"
              element={<TeacherAddGameActivityStepTwoPage />}
            />
            <Route
              path="step-3"
              element={<TeacherAddGameActivityStepThreePage />}
            />
          </Route>
          <Route path="tasks/upload" element={<TeacherUploadVideoLayout />}>
            <Route
              index
              path="step-1"
              element={<TeacherUploadVideoStepOnePage />}
            />
            <Route path="step-2" element={<TeacherUploadVideoStepTwoPage />} />
            <Route
              path="step-3"
              element={<TeacherUploadVideoStepThreePage />}
            />
          </Route>
          <Route path="settings" element={<TeacherSettingsPage />} />
          <Route path="help" element={<TeacherHelpPage />} />
        </Route>

        {/* Parent */}
        <Route path="/parent" element={<ParentLayout />}>
          <Route path="home" index element={<ParentHomePage />} />
          <Route
            path="home/student/:username"
            element={<ParentStudentProfilePage />}
          />
        </Route>

        {/* System Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
