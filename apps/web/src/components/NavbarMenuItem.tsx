import { Link } from "react-router-dom";

type NavbarMenuItemProps = {
  to: string;
  isSelected: boolean;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
};

export default function NavbarMenuItem({
  to,
  isSelected,
  icon: Icon,
  children,
  className = "",
}: NavbarMenuItemProps) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold
        transition-colors disabled:pointer-events-none disabled:opacity-50
        ${
          isSelected
            ? "bg-(--primary) text-white hover:bg-(--primary-hover) border-b-4 border-(--primary-shadow)"
            : "bg-white text-(--ghost) hover:bg-gray-50"
        }
        ${className}
      `}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );
}
