type AvatarProps = {
  emoji: string;
  color: string;
  isActive?: boolean;
};

export default function Avatar({ emoji, color, isActive = true }: AvatarProps) {
  return (
    <div
      className={`flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all ${
        isActive
          ? "border-white/50 text-(--primary) shadow-sm"
          : "border-gray-300 bg-gray-200 text-gray-400 grayscale opacity-60"
      }`}
      style={{ backgroundColor: isActive ? color : undefined }}
      title={isActive ? undefined : "Deactivated Profile (Colorless)"}
    >
      <span className="text-4xl font-bold">{emoji}</span>
    </div>
  );
}
