import AdminSideNavbar from "../components/admin/SideNavbar";
import AdminTopHeaderBar from "../components/admin/TopHeaderBar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSideNavbar />

      <main className="ml-64 min-w-0 flex-1 flex flex-col min-h-screen">
        <AdminTopHeaderBar />
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
