"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startConversation } from "./actions";

export default function NewConversationForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await startConversation(email);
      if (result.error) {
        setError(result.error);
      } else if (result.conversationId) {
        setEmail("");
        router.push(`/chat/${result.conversationId}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="recipientEmail" className="block text-sm font-bold text-ink-soft">
        Start a conversation
      </label>
      <div className="flex gap-2">
        <input
          id="recipientEmail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="their email"
          className="flex-1 min-w-0 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-sage hover:bg-sage-deep text-white text-sm font-bold rounded-lg px-4 py-2 transition-colors disabled:opacity-60 shrink-0"
        >
          {isPending ? "..." : "Start"}
        </button>
      </div>
      {error && <p className="text-clay text-sm">{error}</p>}
    </form>
  );
}
