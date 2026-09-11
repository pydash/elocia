type AvatarProps = {
  emoji: string;
  color: string;
};

export default function Avatar({ emoji, color }: AvatarProps) {
  return (
    <div
      className={`flex h-24 w-24 items-center justify-center rounded-full text-(--primary) border-2`}
      style={{ backgroundColor: color }}
    >
      <span className="text-4xl font-bold">{emoji}</span>
    </div>
  );
}
