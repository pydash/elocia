import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
}

export default function Field({
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  type = "text",
  className = "",
  ...props
}: FieldProps) {
  return (
    <div className="relative w-full">
      {LeadingIcon && (
        <LeadingIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-(--ghost)" />
      )}

      <input
        type={type}
        className={`w-full paragraph-2 rounded-md border-2 border-(--border) bg-(--gray-50) text-(--ghost) px-4 py-3 pl-12 outline-none ${className}`}
        {...props}
      />

      {TrailingIcon && (
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
        >
          <TrailingIcon className="size-5" />
        </button>
      )}
    </div>
  );
}
