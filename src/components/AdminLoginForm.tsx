"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        submitError instanceof Error ? submitError.message : "Falha ao entrar.",
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
          Usuário
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
        <div className="relative mt-2">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-caramel/25 bg-sugar px-4 py-3 pr-13 text-espresso outline-none focus:border-caramel"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-lg px-3 text-cocoa/76 transition hover:bg-oat/70 hover:text-espresso"
          >
            {showPassword ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current stroke-[2]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l18 18"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.6 10.7A3 3 0 0 0 12 15a3 3 0 0 0 2.2-.9"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.9 5.2A10.9 10.9 0 0 1 12 5c5 0 8.3 3.1 9.6 5.8a1.7 1.7 0 0 1 0 1.4 12.6 12.6 0 0 1-4 4.8"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.2 6.3a12.7 12.7 0 0 0-3.8 4.5 1.7 1.7 0 0 0 0 1.4C3.7 15 7 18 12 18c1 0 2-.1 2.9-.4"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current stroke-[2]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.4 12.8a1.7 1.7 0 0 1 0-1.4C3.7 8.6 7 5.5 12 5.5s8.3 3.1 9.6 5.9a1.7 1.7 0 0 1 0 1.4C20.3 15.4 17 18.5 12 18.5s-8.3-3.1-9.6-5.7Z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
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
