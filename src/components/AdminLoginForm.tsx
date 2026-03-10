"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao entrar.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Falha ao entrar.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="admin-username"
          className="block text-xs font-extrabold uppercase tracking-[0.12em] text-cocoa/82"
        >
          Usuario
        </label>
        <input
          id="admin-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2 w-full rounded-xl border border-caramel/25 bg-sugar px-4 py-3 text-espresso outline-none focus:border-caramel"
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="block text-xs font-extrabold uppercase tracking-[0.12em] text-cocoa/82"
        >
          Senha
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-caramel/25 bg-sugar px-4 py-3 text-espresso outline-none focus:border-caramel"
          autoComplete="current-password"
          required
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-espresso px-5 text-xs font-extrabold uppercase tracking-[0.09em] text-sugar"
      >
        {submitting ? "Entrando..." : "Entrar no painel"}
      </button>
    </form>
  );
}
