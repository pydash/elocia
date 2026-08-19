type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export default function Separator({
  orientation = "horizontal",
  className = "",
}: SeparatorProps) {
  const orientationClass =
    orientation === "horizontal" ? "h-px w-full" : "h-full w-px";

  return (
    <div
      className={`${orientationClass} bg-gray-200 ${className}`}
      role="separator"
    />
  );
}
