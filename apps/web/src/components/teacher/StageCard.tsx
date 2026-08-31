import { Check, Lock } from "lucide-react";
import ProgressBar from "../ProgressBar";

type StageCardVariant = "completed" | "current" | "locked";

type StageCardProps = {
  stageNumber: number;
  variant: StageCardVariant;
  progress?: number;
  className?: string;
};

const variantStyles: Record<
  StageCardVariant,
  {
    container: string;
    label: string;
    number: string;
    iconWrapper?: string;
    icon?: string;
  }
> = {
  locked: {
    container: "bg-white border-2 border-gray-200 shadow-sm",
    label: "text-slate-700",
    number: "text-slate-700",
    icon: "text-slate-500",
  },
  completed: {
    container: "bg-green-100 border-none shadow-sm",
    label: "text-green-600",
    number: "text-green-500",
    iconWrapper:
      "bg-green-500 rounded-full p-2.5 flex items-center justify-center",
    icon: "text-white stroke-[3]",
  },
  current: {
    container: "bg-white border-[3.5px] border-amber-500 shadow-sm",
    label: "text-amber-500",
    number: "text-amber-500",
  },
};

function StageCard({
  stageNumber,
  variant,
  progress = 0,
  className = "",
}: StageCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex w-32 flex-col items-center justify-between rounded-3xl p-6 aspect-3/4 ${styles.container} ${className}`}
    >
      {/* Top Label */}
      <span
        className={`text-sm font-bold tracking-wider uppercase ${styles.label}`}
      >
        STAGE
      </span>

      {/* Center Number */}
      <span className={`text-4xl font-bold ${styles.number}`}>
        {stageNumber}
      </span>

      {/* Bottom Status (Icon / Progress Bar) */}
      <div className="flex h-10 w-full items-center justify-center">
        {variant === "completed" && (
          <div className={styles.iconWrapper}>
            <Check className={`size-4 ${styles.icon}`} aria-hidden="true" />
          </div>
        )}

        {variant === "locked" && (
          <Lock className={`size-7 ${styles.icon}`} aria-hidden="true" />
        )}

        {variant === "current" && (
          <div className="w-full px-2">
            <ProgressBar percentage={progress} />
          </div>
        )}
      </div>
    </div>
  );
}

type StageConnectorProps = {
  completed?: boolean;
};

function StageConnector({ completed = false }: StageConnectorProps) {
  return (
    <div
      className={`h-1 w-8 shrink-0 rounded-full ${
        completed ? "bg-(--success)" : "bg-gray-200"
      }`}
    />
  );
}

export { StageCard, StageConnector };
