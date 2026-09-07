type BarChartProps = {
  percentage: number;
  label: string;
};

export function Bar({ percentage, label }: BarChartProps) {
  return (
    <div className="flex flex-col h-full items-center justify-end gap-2">
      <div
        className={`w-42 bg-(--primary) rounded-t-2xl border-b-4 border-(--primary-shadow)`}
        style={{ height: `${percentage}%` }}
      />

      <span className="text-(--black) font-semibold">
        {label}
        <span className="text-(--black) font-semibold"> - {percentage}%</span>
      </span>
    </div>
  );
}

export function BarChart({ data }: { data: BarChartProps[] }) {
  return (
    <div className="flex items-end gap-4">
      {data.map((bar) => (
        <Bar key={bar.label} percentage={bar.percentage} label={bar.label} />
      ))}
    </div>
  );
}
