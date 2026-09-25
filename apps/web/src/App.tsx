import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage.tsx";

// Teacher Pages
import TeacherLayout from "./layouts/TeacherLayout.tsx";
import TeacherAddLessonLayout from "./layouts/TeacherAddLessonLayout.tsx";
import TeacherLoginPage from "./pages/teacher/LoginPage.tsx";
import TeacherClassesPage from "./pages/teacher/ClassesPage.tsx";
import TeacherClassPage from "./pages/teacher/ClassPage.tsx";
import TeacherStudentsPage from "./pages/teacher/StudentsPage.tsx";
import TeacherStudentProfilePage from "./pages/teacher/StudentProfilePage.tsx";
import TeacherLessonsPage from "./pages/teacher/LessonsPage.tsx";
import TeacherSectionListPage from "./pages/teacher/SectionListPage.tsx";
import TeacherUnitListPage from "./pages/teacher/UnitListPage.tsx";
import TeacherStageListPage from "./pages/teacher/StageListPage.tsx";
import {
  TeacherStageCreatePage,
  TeacherStagePreviewPage,
} from "./pages/teacher/StageCreationPage.tsx";
import TeacherStageItemPage from "./pages/teacher/StageItemPage.tsx";
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
import ParentProgressPage from "./pages/parent/ProgressPage.tsx";

// Admin Pages
import AdminLoginPage from "./pages/admin/LoginPage.tsx";
import AdminLayout from "./layouts/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminUsersPage from "./pages/admin/UsersPage.tsx";
import AdminClassesPage from "./pages/admin/ClassesPage.tsx";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Login */}
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/parent/login" element={<ParentLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Teacher */}
        <Route path="/teacher" element={<TeacherLayout />}>
          {/* Classes */}
          <Route path="classes" index element={<TeacherClassesPage />} />
          <Route path="classes/:id" element={<TeacherClassPage />} />
          {/* Students */}
          <Route path="students" index element={<TeacherStudentsPage />} />
          <Route path="students/:id" element={<TeacherStudentProfilePage />} />

          {/* Lessons */}
          <Route path="lessons" element={<TeacherLessonsPage />} />

          {/* /lessons/:curriculumId */}
          <Route
            path="lessons/:curriculumId"
            element={<TeacherSectionListPage />}
          />

          {/* /lessons/:curriculumId/sections/:sectionId */}
          <Route
            path="lessons/:curriculumId/sections/:sectionId"
            element={<TeacherUnitListPage />}
          />

          {/* /lessons/:curriculumId/sections/:sectionId/units/:unitId */}
          <Route
            path="lessons/:curriculumId/sections/:sectionId/units/:unitId"
            element={<TeacherStageListPage />}
          />
          <Route
            path="lessons/:curriculumId/sections/:sectionId/units/:unitId/new"
            element={<TeacherStageCreatePage />}
          />
          <Route
            path="lessons/:curriculumId/sections/:sectionId/units/:unitId/preview"
            element={<TeacherStagePreviewPage />}
          />

          {/* /lessons/:curriculumId/sections/:sectionId/units/:unitId/stages/:stageId */}
          <Route
            path="lessons/:curriculumId/sections/:sectionId/units/:unitId/stages/:stageId"
            element={<TeacherStageItemPage />}
          />

          {/* Add lesson */}
          <Route path="lessons/new" element={<TeacherAddLessonLayout />}>
            <Route path="step-1" element={<TeacherAddLessonStepOnePage />} />
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
          <Route path="progress" element={<ParentProgressPage />} />
        </Route>

        {/* System Admin */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="classes" element={<AdminClassesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
