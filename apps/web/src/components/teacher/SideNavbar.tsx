import {
  Users,
  BookOpen,
  Settings,
  HelpCircle,
  LogOut,
  ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NavbarMenuItem from "../NavbarMenuItem";
import { useLocation } from "react-router-dom";

type NavItem = {
  name: string;
  icon: LucideIcon;
  to: string;
};

const navItems: NavItem[] = [
  {
    name: "Students",
    icon: Users,
    to: "/teacher/students",
  },
  {
    name: "Lessons",
    icon: BookOpen,
    to: "/teacher/lessons",
  },
  {
    name: "Tasks",
    icon: ClipboardList,
    to: "/teacher/tasks",
  },
];

export default function TeacherSideNavbar() {
  const location = useLocation();
  const currentPath = location.pathname.split("/")[2] || "students";

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white fixed">
      {/* Logo */}
      <div className="p-4 flex items-center justify-center">
        <div className="flex size-28 items-center justify-center">
          <img
            src="/logo.png"
            alt="Elocia logo"
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 justify-around flex flex-col">
        {/* Top Menus */}
        <div className="space-y-4">
          {navItems.map((item) => {
            const isActive = item.to.split("/")[2] === currentPath;

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

        {/* Bottom Menus */}
        <div className="mt-auto space-y-4">
          <NavbarMenuItem
            to="/teacher/settings"
            isSelected={currentPath === "settings"}
            icon={Settings}
          >
            Settings
          </NavbarMenuItem>

          <NavbarMenuItem
            to="/teacher/help"
            isSelected={currentPath === "help"}
            icon={HelpCircle}
          >
            Help
          </NavbarMenuItem>

          <button
            className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => {
              // Handle logout logic here
              console.log("Logout clicked");
            }}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
