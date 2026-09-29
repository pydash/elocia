import { AlertTriangle } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center"
      role="alert"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-(--danger-light) text-(--danger)">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <h2 className="heading-3 mt-4 text-(--black)">{title}</h2>
      <p className="paragraph-2 mt-2 max-w-md text-(--ghost)">{message}</p>
    </div>
  );
}
