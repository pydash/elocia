export default function StatCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-32 flex flex-col items-center justify-around gap-2 rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
      <p className="uppercase paragraph-2 font-bold! text-(--ghost)">{label}</p>
      {children}
    </div>
  );
}
