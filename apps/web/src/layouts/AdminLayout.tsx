import { useState } from "react";
import AdminSideNavbar from "../components/admin/SideNavbar";
import AdminTopHeaderBar from "../components/admin/TopHeaderBar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col lg:flex-row">
      {/* Mobile & Tablet Header (< 1024px) */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF8A00] hover:bg-orange-100 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="size-6" />
        </button>

        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Elocia logo" className="h-8 object-contain" />
          <span className="font-extrabold text-[#FF8A00] text-sm tracking-tight">ELOCIA ADMIN</span>
        </div>

        <div className="size-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-[#FF8A00] font-bold text-xs">
          A
        </div>
      </header>

      {/* Responsive Sidebar Drawer */}
      <AdminSideNavbar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <main className="min-w-0 flex-1 flex flex-col min-h-screen lg:ml-64">
        <div className="hidden lg:block">
          <AdminTopHeaderBar />
        </div>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
