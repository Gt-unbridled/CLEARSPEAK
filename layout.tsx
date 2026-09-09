import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "./sign-out-button";
import NewConversationForm from "./new-conversation-form";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // Get every conversation this user is part of, with the other
  // participant's name and the most recent message for a preview.
  const { data: participantRows } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  const conversationIds = participantRows?.map((r) => r.conversation_id) ?? [];

  const conversations: {
    id: string;
    otherName: string;
    lastMessageAt: string;
  }[] = [];

  if (conversationIds.length > 0) {
    const { data: convos } = await supabase
      .from("conversations")
      .select("id, last_message_at")
      .in("id", conversationIds)
      .order("last_message_at", { ascending: false });

    for (const convo of convos ?? []) {
      const { data: others } = await supabase
        .from("conversation_participants")
        .select("user_id, profiles(display_name)")
        .eq("conversation_id", convo.id)
        .neq("user_id", user.id);

      const otherProfile = others?.[0]?.profiles as unknown as
        | { display_name: string }
        | undefined;

      conversations.push({
        id: convo.id,
        otherName: otherProfile?.display_name ?? "Unknown",
        lastMessageAt: convo.last_message_at,
      });
    }
  }

  return (
    <div className="flex-1 flex">
      <aside className="w-[280px] border-r border-line bg-panel flex flex-col">
        <div className="px-6 py-5 border-b border-line flex items-center justify-between">
          <p className="font-bold text-sage-deep">ClearSpeak</p>
          <SignOutButton />
        </div>

        <div className="px-6 py-4 border-b border-line">
          <p className="text-ink-soft text-sm">Signed in as</p>
          <p className="font-bold">{profile?.display_name ?? user.email}</p>
        </div>

        <div className="px-6 py-4 border-b border-line">
          <NewConversationForm />
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-ink-soft text-sm px-3 mb-2">Conversations</p>
          {conversations.length === 0 && (
            <p className="text-ink-soft text-sm px-3">
              No conversations yet. Start one above.
            </p>
          )}
          <nav className="space-y-1">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className="block px-3 py-2 rounded-lg hover:bg-paper font-bold"
              >
                {c.otherName}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
