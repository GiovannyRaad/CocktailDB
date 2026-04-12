import { motion } from "motion/react";
import { useState } from "react";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    toast.success("Login UI only for now.");
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
              className="w-full rounded-2xl border border-amber-200/15 bg-[#1d1410] px-4 py-3 text-amber-50 outline-none transition placeholder:text-amber-100/35 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/15"
            />
          </label>

          <button
            type="submit"
            className="tavern-cta w-full rounded-2xl bg-[#e1a24d] px-5 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#21130c] shadow-[0_16px_32px_rgba(0,0,0,0.28)]"
          >
            Login
          </button>
        </form>
      </motion.section>
    </main>
  );
}

export default Login;
