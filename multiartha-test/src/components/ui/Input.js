export default function Input({
  label,
  className = "",
  id,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      {label ? (
        <div className="mb-1 text-sm font-medium text-zinc-900">{label}</div>
      ) : null}
      <input
        id={inputId}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
        {...props}
      />
    </label>
  );
}
