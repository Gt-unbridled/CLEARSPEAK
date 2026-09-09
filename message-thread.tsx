"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { sendMessage } from "../actions";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

export default function MessageThread({
  conversationId,
  currentUserId,
  otherName,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  otherName: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Subscribe to new messages in this conversation in real time.
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicating a message we already added optimistically
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;

    const content = draft.trim();
    setDraft("");
    setSending(true);

    const result = await sendMessage(conversationId, content);
    if (result.error) {
      // Put the draft back so nothing is lost
      setDraft(content);
    }
    setSending(false);
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-6 py-5 border-b border-line">
        <h1 className="font-bold text-lg">{otherName}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-ink-soft">
            No messages yet. Say hello below.
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.sender_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`max-w-[70%] ${isMine ? "ml-auto" : ""}`}
            >
              <div
                className={`rounded-lg px-4 py-3 ${
                  isMine
                    ? "bg-sage text-white"
                    : "bg-panel border border-line text-ink"
                }`}
              >
                <p className="leading-relaxed">{m.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="px-6 py-4 border-t border-line flex gap-3"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message"
          className="flex-1 rounded-lg border border-line bg-panel px-4 py-3 text-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="bg-sage hover:bg-sage-deep text-white font-bold rounded-lg px-6 py-3 transition-colors disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}
