"use client";

export default function Modal({ title, children, open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          </div>
          <button
            className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
            onClick={onClose}
            type="button"
          >
            Tutup
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
