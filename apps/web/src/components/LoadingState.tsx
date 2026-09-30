export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-16 h-16 border-4 border-t-transparent border-(--black) rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  );
}
