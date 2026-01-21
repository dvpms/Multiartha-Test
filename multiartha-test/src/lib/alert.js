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
