import TeacherSideNavbar from "../components/teacher/SideNavbar";
import { Outlet } from "react-router-dom";

export default function TeacherLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <TeacherSideNavbar />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
