import Avatar from "@/components/Avatar";
import { GraduationCap, ChevronDown } from "lucide-react";
import type { ParentStudent } from "@/interfaces/parent.interface";
import { useState } from "react";

type StudentBannerProps = {
  name: string;
  grade: string | number;
  emoji?: string;
  color?: string;
  allChildren?: ParentStudent[];
  selectedChildId?: string;
  onSelectChild?: (child: ParentStudent) => void;
};

export default function StudentBanner({
  name,
  grade,
  emoji = "👦",
  color = "#3B82F6",
  allChildren = [],
  selectedChildId,
  onSelectChild,
}: StudentBannerProps) {
  const [showChildPicker, setShowChildPicker] = useState(false);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 border-t-4 border-t-[#FF8A00] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="w-fit px-4 py-1.5 bg-[#FF8A00] rounded-xl text-sm font-semibold text-white shadow-sm">
          Student's Profile
        </span>

        {/* Multi-child switcher if parent has more than 1 student */}
        {allChildren.length > 1 && onSelectChild && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowChildPicker(!showChildPicker)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span>Switch Child ({allChildren.length})</span>
              <ChevronDown className="size-3.5" />
            </button>

            {showChildPicker && (
              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl bg-white border border-gray-200 shadow-lg py-1">
                {allChildren.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectChild(c);
                      setShowChildPicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-orange-50 transition-colors ${
                      c.id === selectedChildId ? "bg-orange-50 font-semibold text-[#FF8A00]" : "text-gray-700"
                    }`}
                  >
                    <span>{c.emoji || "👦"}</span>
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <hr className="border-gray-100 my-1" />

      <div className="flex items-center gap-5">
        <div className="shrink-0">
          <Avatar emoji={emoji} color={color} />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{name}</h2>
          <div className="flex items-center gap-2 text-gray-400 font-medium">
            <GraduationCap className="size-5 text-gray-500" />
            <p className="text-base text-gray-500">Grade {grade}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
