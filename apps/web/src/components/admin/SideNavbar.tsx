import {
  LayoutDashboard,
  Users,
  School,
  LogOut,
  ShieldAlert,
  Settings,
  HelpCircle,
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

type AdminSideNavbarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function AdminSideNavbar({
  isOpen = false,
  onClose,
}: AdminSideNavbarProps) {
  const location = useLocation();
  const { logout } = useAdultLogout("/admin/login");

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
        }`}
      >
        {/* Brand Header & Mobile Close Button */}
        <div className="relative p-6 flex flex-col items-center justify-center border-b border-gray-100">
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

          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
              aria-label="Close navigation"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 flex flex-col justify-between overflow-y-auto">
          {/* Top Menus */}
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <div key={item.name} onClick={onClose}>
                  <NavbarMenuItem
                    to={item.to}
                    isSelected={isActive}
                    icon={item.icon}
                  >
                    {item.name}
                  </NavbarMenuItem>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto space-y-2 pt-4 border-t border-gray-200">
            <div onClick={onClose}>
              <NavbarMenuItem
                to="/admin/settings"
                isSelected={location.pathname === "/admin/settings"}
                icon={Settings}
              >
                Settings
              </NavbarMenuItem>
            </div>

            <div onClick={onClose}>
              <NavbarMenuItem
                to="/admin/help"
                isSelected={location.pathname === "/admin/help"}
                icon={HelpCircle}
              >
                Help
              </NavbarMenuItem>
            </div>

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
