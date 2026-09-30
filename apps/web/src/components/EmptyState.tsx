export default function EmptyState({
  title,
  message,
}: {
  title: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-lg font-semibold text-gray-700">{title}</p>
      {message && <p className="mt-2 text-gray-500">{message}</p>}
    </div>
  );
}
