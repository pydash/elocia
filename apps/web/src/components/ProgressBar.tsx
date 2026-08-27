type ProgressBarProps = {
  percentage: number;
  className?: string;
};

export default function ProgressBar({
  percentage,
  className = "",
}: ProgressBarProps) {
  const progress = Math.min(100, Math.max(0, percentage));

  return (
    <div
      className={`h-3 w-full overflow-hidden rounded-full bg-(--surface) ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full rounded-full bg-(--primary) transition-[width] duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
