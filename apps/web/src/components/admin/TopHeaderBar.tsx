import { getNameFromToken, tokenManager } from "@/helpers/jwt";
import { UserCheck } from "lucide-react";

type TopHeaderBarProps = {
  title?: string;
};

export default function AdminTopHeaderBar({
  title = "System Administration",
}: TopHeaderBarProps) {
  const token = tokenManager.getAccessToken();
  const adminName = token ? getNameFromToken(token) : "Administrator";

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="border-b border-gray-200 bg-white px-8 py-4 flex items-center justify-between shadow-xs">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500 mt-0.5">{todayStr}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right">
          <span className="text-sm font-semibold text-gray-800">{adminName || "Administrator"}</span>
          <span className="text-[11px] font-medium text-emerald-600 tracking-wide uppercase">Super Admin</span>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full bg-(--primary) text-white font-bold shadow-xs">
          <UserCheck className="size-5" />
        </div>
      </div>
    </header>
  );
}
