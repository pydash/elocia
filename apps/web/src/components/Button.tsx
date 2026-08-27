// components/Button.jsx

const variants = {
  default: "bg-(--primary) text-white hover:bg-(--primary-hover)",
  outline:
    "border border-(--primary) bg-transparent text-(--primary) hover:bg-(--primary) hover:text-white",
  destructive:
    "bg-(--danger-light) border-1 border-(--danger)! text-(--danger) hover:bg-[#FFC7C7] disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "bg-(--gray-100) text-(--black) border-(--ghost)! hover:bg-(--gray-150) disabled:pointer-events-none disabled:opacity-50",
};

function Button({ variant = "default", className = "", children, ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded-md px-5 py-3
        font-semibold
        transition-colors
        disabled:pointer-events-none disabled:opacity-50
        border-b-4 border-(--primary-shadow)
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
