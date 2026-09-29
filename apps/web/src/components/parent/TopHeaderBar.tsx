import { getNameFromToken, tokenManager } from "@/helpers/jwt";
import { User as UserIcon } from "lucide-react";

type TopHeaderBarProps = {
  variant?: "default" | "light";
};

export default function TopHeaderBar({
  variant = "default",
}: TopHeaderBarProps) {
  const token = tokenManager.getAccessToken();
  const parentName = token ? getNameFromToken(token) : "Parent";

  return (
    <header
      className={`border-b border-gray-200 px-8 py-5 flex items-center justify-between ${
        variant === "light" ? "bg-(--primary-light)" : "bg-white"
      }`}
    >
      <h1 className="text-xl font-bold text-[#FF8A00]">Parent Dashboard</h1>

      {/* Parent Avatar on Top-Right matching Figma */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full border-2 border-orange-200 bg-orange-100 flex items-center justify-center text-[#FF8A00] shadow-sm overflow-hidden" title={parentName || "Parent"}>
          <UserIcon className="size-5" />
        </div>
      </div>
    </header>
  );
}
