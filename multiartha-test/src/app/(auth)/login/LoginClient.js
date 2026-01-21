"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

export default function LoginClient({ callbackUrl }) {
  const router = useRouter();
  const { status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!result?.ok) {
      toast.error("Email atau password salah");
      return;
    }

    toast.success("Login berhasil");
    router.replace(callbackUrl);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <Card className="w-full">
          {status === "authenticated" ? (
            <div className="py-8 text-center text-sm text-zinc-600">Mengalihkan...</div>
          ) : null}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-zinc-900">
              Sistem Inventaris
            </h1>
            <p className="text-sm text-zinc-600">Silakan login untuk lanjut</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) =>
                setForm((v) => ({ ...v, password: e.target.value }))
              }
              required
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Memproses..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-xs text-zinc-500">
            Gunakan akun seed: admin@local.test / Admin123!
          </div>
        </Card>
      </div>
    </div>
  );
}
