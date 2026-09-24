import {
  LayoutDashboard,
  Users,
  School,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NavbarMenuItem from "../NavbarMenuItem";
import { useLocation } from "react-router-dom";
import { useAdultLogout } from "@/hooks/useAuth";

type NavItem = {
  name: string;
  icon: LucideIcon;
  to: string;
  exact?: boolean;
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    to: "/admin",
    exact: true,
  },
  {
    name: "User Directory",
    icon: Users,
    to: "/admin/users",
  },
  {
    name: "Classrooms",
    icon: School,
    to: "/admin/classes",
  },
];

export default function AdminSideNavbar() {
  const location = useLocation();
  const { logout } = useAdultLogout("/admin/login");

  return (
    <aside className="fixed flex h-screen w-64 flex-col border-r border-gray-200 bg-white z-20">
      {/* Brand Header */}
      <div className="p-6 flex flex-col items-center justify-center border-b border-gray-100">
        <div className="flex size-20 items-center justify-center mb-2">
          <img
            src="/logo.png"
            alt="Elocia logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-(--primary-light) px-3 py-1 text-xs font-bold text-(--primary)">
          <ShieldAlert className="size-3.5" />
          <span>ADMIN CONSOLE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 flex flex-col justify-between">
        {/* Top Menus */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavbarMenuItem
                key={item.name}
                to={item.to}
                isSelected={isActive}
                icon={item.icon}
              >
                {item.name}
              </NavbarMenuItem>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
