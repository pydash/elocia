import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
}

export default function Input({
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  type = "text",
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="relative w-full">
      {LeadingIcon && (
        <LeadingIcon className="pointer-events-none absolute left-3 top-6 size-5 -translate-y-1/2 text-(--ghost)" />
      )}

      <input
        type={type}
        className={`w-full paragraph-2 rounded-md border-2 border-(--border) bg-(--gray-50) px-4 py-3 text-(--ghost) outline-none ${
          LeadingIcon ? "pl-10" : ""
        } ${TrailingIcon ? "pr-12" : ""} ${className}`}
        {...props}
      />

      {TrailingIcon && (
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-(--ghost)"
          aria-label="Input action"
        >
          <TrailingIcon className="size-5" />
        </button>
      )}
    </div>
  );
}
