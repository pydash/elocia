import { ChevronDown } from "lucide-react";

type DropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className: string;
};

export default function Dropdown({
  value,
  onChange,
  options,
  className,
}: DropdownProps) {
  return (
    <div className={`relative inline-block w-full ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded-md border-2 border-(--border) bg-(--gray-50) px-4 paragraph-2 text-(--ghost) outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-(--ghost)" />
    </div>
  );
}
