import React, { useState } from "react";

function SparkleIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
      <path d="m19 3 .45 1.55L21 5l-1.55.45L19 7l-.45-1.55L17 5l1.55-.45L19 3Z" />
    </svg>
  );
}

export default function Login({ onLoadDemo, onLogin, onSignup, loading = false }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("aditi@edupath.demo");
  const [password, setPassword] = useState("edupath-demo");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (mode === "login") {
      const ok = await onLogin(email, password);
      if (!ok) setError("Sign in failed. Check the email and password.");
    } else {
      if (!name.trim()) {
        setError("Please tell us your name.");
        return;
      }
      const ok = await onSignup(name.trim(), email, password);
      if (!ok) setError("Sign up failed. That email may already be registered.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm" aria-hidden="true">
            <SparkleIcon className="h-5 w-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-slate-950">EduPath</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">
            {mode === "login" ? "Sign in to continue" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            {mode === "login"
              ? "Use the seeded demo credentials below, or your own account."
              : "Set up an account and save your first profile."}
          </p>

          <button
            type="button"
            onClick={onLoadDemo}
            disabled={loading}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <SparkleIcon className="h-4 w-4" />
            {loading ? "Loading demo…" : "Load Aditi Demo"}
          </button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">or sign in manually</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Your name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Aditi Sharma"
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            {error && (
              <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {mode === "login" ? "New to EduPath? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Demo credentials: aditi@edupath.demo / edupath-demo
        </p>
      </div>
    </main>
  );
}
