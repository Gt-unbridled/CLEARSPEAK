"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Check your email to confirm your account.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
      } else {
        router.push("/chat");
        router.refresh();
      }
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-[420px]">
      {mode === "signup" && (
        <div>
          <label htmlFor="displayName" className="block font-bold mb-2">
            What should we call you?
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-ink focus:outline-none"
            placeholder="Your name"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="block font-bold mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-ink focus:outline-none"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block font-bold mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-ink focus:outline-none"
          placeholder="At least 6 characters"
        />
      </div>

      {message && (
        <p className="text-sage-deep bg-sage/10 rounded-lg px-4 py-3">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sage hover:bg-sage-deep text-white font-bold rounded-lg px-6 py-3 transition-colors disabled:opacity-60"
      >
        {loading
          ? "One moment..."
          : mode === "signup"
          ? "Create account"
          : "Log in"}
      </button>
    </form>
  );
}
