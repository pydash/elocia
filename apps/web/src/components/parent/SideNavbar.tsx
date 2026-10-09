import {
  Settings,
  HelpCircle,
  LogOut,
  ChartNoAxesCombined,
  House,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NavbarMenuItem from "../NavbarMenuItem";
import { useLocation } from "react-router-dom";
import { useAdultLogout } from "@/hooks/useAuth";

type NavItem = {
  name: string;
  icon: LucideIcon;
  to: string;
};

const navItems: NavItem[] = [
  {
    name: "Home",
    icon: House,
    to: "/parent/home",
  },
  {
    name: "Progress",
    icon: ChartNoAxesCombined,
    to: "/parent/progress",
  },
];

type ParentSideNavbarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function ParentSideNavbar({
  isOpen = false,
  onClose,
}: ParentSideNavbarProps) {
  const location = useLocation();
  const currentPath = location.pathname.split("/")[2] || "home";
  const { logout } = useAdultLogout("/parent/login");

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
        {/* Logo & Mobile Close Button */}
        <div className="relative p-4 flex items-center justify-center">
          <div className="flex size-24 sm:size-28 items-center justify-center">
            <img
              src="/logo.png"
              alt="Elocia logo"
              className="h-full w-full object-contain"
            />
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
        <nav className="flex-1 px-3 py-4 sm:py-6 justify-around flex flex-col overflow-y-auto">
          {/* Top Menus */}
          <div className="space-y-3 sm:space-y-4">
            {navItems.map((item) => {
              const isActive = item.to.split("/")[2] === currentPath;

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

          {/* Bottom Menus */}
          <div className="mt-auto space-y-3 sm:space-y-4 pt-4 border-t border-gray-100">
            <div onClick={onClose}>
              <NavbarMenuItem
                to="/parent/settings"
                isSelected={currentPath === "settings"}
                icon={Settings}
              >
                Settings
              </NavbarMenuItem>
            </div>

            <div onClick={onClose}>
              <NavbarMenuItem
                to="/parent/help"
                isSelected={currentPath === "help"}
                icon={HelpCircle}
              >
                Help
              </NavbarMenuItem>
            </div>

            <button
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
