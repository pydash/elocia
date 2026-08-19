type TopHeaderBarProps = {
  variant?: "default" | "light";
};

export default function TopHeaderBar({
  variant = "default",
}: TopHeaderBarProps) {
  return (
    <header
      className={`border-b border-(--border) p-6 ${
        variant === "light" ? "bg-(--primary-light)" : "bg-(--gray-50)"
      }`}
    >
      <h1 className="heading-3 text-(--primary)">Teacher Dashboard</h1>
    </header>
  );
}
