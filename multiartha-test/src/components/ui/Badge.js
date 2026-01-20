export default function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-zinc-100 text-zinc-700",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    success: "bg-emerald-100 text-emerald-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[variant] || styles.default
      }`}
    >
      {children}
    </span>
  );
}
