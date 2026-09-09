import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MessageThread from "./message-thread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RLS ensures this only returns data if the user is a participant
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, sender_id, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const { data: others } = await supabase
    .from("conversation_participants")
    .select("user_id, profiles(display_name)")
    .eq("conversation_id", conversationId)
    .neq("user_id", user.id);

  const otherProfile = others?.[0]?.profiles as unknown as
    | { display_name: string }
    | undefined;

  return (
    <MessageThread
      conversationId={conversationId}
      currentUserId={user.id}
      otherName={otherProfile?.display_name ?? "Conversation"}
      initialMessages={messages ?? []}
    />
  );
}
