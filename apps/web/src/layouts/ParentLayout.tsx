import ParentSideNavbar from "@/components/parent/SideNavbar";
import { Outlet } from "react-router-dom";

export default function ParentLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSideNavbar />

      <main className="ml-64 min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
