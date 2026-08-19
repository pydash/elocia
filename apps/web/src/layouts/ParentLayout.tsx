import SideNavbar from "../components/teacher/SideNavbar";
import { Outlet } from "react-router-dom";

export default function ParentLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNavbar />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
