"use client";

import Swal from "sweetalert2";

export function alertSuccess(title, text) {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText: "OK",
  });
}

export function alertError(title, text) {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "OK",
  });
}

export function confirmDanger({ title, text, confirmText = "Ya" }) {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    reverseButtons: true,
    focusCancel: true,
  });
}

export function promptSelect({
  title,
  text,
  options,
  defaultValue,
  confirmText = "OK",
  cancelText = "Batal",
}) {
  return Swal.fire({
    title,
    text,
    input: "select",
    inputOptions: options,
    inputValue: defaultValue,
    inputPlaceholder: "Pilih...",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
    inputValidator: (value) => {
      if (!value) return "Wajib dipilih";
    },
  });
}

export function promptNumber({
  title,
  text,
  defaultValue,
  min = 1,
  max,
  confirmText = "OK",
  cancelText = "Batal",
}) {
  return Swal.fire({
    title,
    text,
    input: "number",
    inputValue: defaultValue,
    inputAttributes: {
      min: String(min),
      ...(max !== undefined ? { max: String(max) } : {}),
      step: "1",
    },
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
    inputValidator: (value) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return "Harus angka";
      if (!Number.isInteger(n)) return "Harus bilangan bulat";
      if (n < min) return `Minimal ${min}`;
      if (max !== undefined && n > max) return `Maksimal ${max}`;
    },
  });
}
