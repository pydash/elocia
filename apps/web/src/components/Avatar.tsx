export default function Avatar({ gender }: { gender: "male" | "female" }) {
  return (
    <div
      className={`flex h-24 w-24 items-center justify-center rounded-full bg-(--primary-light) text-(--primary) border-2`}
      aria-label={`${gender} student`}
    >
      <span className="text-2xl font-bold">
        {gender === "male" ? "M" : gender === "female" ? "F" : "O"}
      </span>
    </div>
  );
}
