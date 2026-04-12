import { motion } from "motion/react";
import { useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.detail ?? "Login failed. Please try again.");
      }

      if (!data?.access_token) {
        throw new Error("No token received from server.");
      }

      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("auth_token_type", data.token_type ?? "bearer");
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          id: data.id,
          email: data.email,
          is_admin: data.is_admin,
        }),
      );

      toast.success("Login successful.");
      window.location.assign(data.is_admin ? "/dashboard" : "/menu");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#120c09] px-4 text-amber-50">
      <motion.section
        className="w-full max-w-md rounded-3xl border border-amber-200/15 bg-[#1b120e]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl tracking-[0.02em] text-amber-50">
            Login
          </h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm uppercase tracking-[0.22em] text-amber-100/70">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-2xl border border-amber-200/15 bg-[#1d1410] px-4 py-3 text-amber-50 outline-none transition placeholder:text-amber-100/35 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/15"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm uppercase tracking-[0.22em] text-amber-100/70">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-amber-200/15 bg-[#1d1410] px-4 py-3 text-amber-50 outline-none transition placeholder:text-amber-100/35 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/15"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="tavern-cta w-full rounded-2xl bg-[#e1a24d] px-5 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#21130c] shadow-[0_16px_32px_rgba(0,0,0,0.28)]"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </motion.section>
    </main>
  );
}

export default Login;
