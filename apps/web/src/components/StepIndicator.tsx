export default function StepIndicator({
  steps,
  step,
}: {
  steps: { number: number; label: string }[];
  step: number;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      {steps.map((s, index) => (
        <div key={s.number} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              step === s.number
                ? "border-(--primary) bg-(--primary)"
                : "border-(--border) bg-(--white)"
            }`}
          >
            <span
              className={`text-sm font-semibold ${
                step === s.number ? "text-white" : "text-(--ghost)"
              }`}
            >
              {s.number}
            </span>
          </div>
          <span
            className={`text-sm font-semibold ${
              step === s.number ? "text-(--primary)" : "text-(--ghost)"
            }`}
          >
            {s.label}
          </span>
          {index < steps.length - 1 && (
            <div className="h-0.5 w-6 bg-(--border)"></div>
          )}
        </div>
      ))}
    </div>
  );
}
