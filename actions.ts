"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function startConversation(recipientEmail: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be logged in." };
  }

  // Look up the recipient by email via the profiles table.
  // Note: email lives on auth.users, not profiles, so we use an RPC-free
  // approach: query profiles joined against a view, OR simplest for MVP,
  // ask Supabase auth admin - but that needs service role. For MVP we
  // instead look the user up by display_name match as a placeholder,
  // OR (recommended) add an `email` column to profiles synced on signup.
  const { data: recipient, error: lookupError } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("email", recipientEmail)
    .single();

  if (lookupError || !recipient) {
    return { error: "No account found with that email." };
  }

  if (recipient.id === user.id) {
    return { error: "You can't start a conversation with yourself." };
  }

  // Check if a conversation between these two already exists
  const { data: existing } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (existing && existing.length > 0) {
    const conversationIds = existing.map((row) => row.conversation_id);
    const { data: shared } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", recipient.id)
      .in("conversation_id", conversationIds);

    if (shared && shared.length > 0) {
      return { conversationId: shared[0].conversation_id };
    }
  }

  // Create a new conversation
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({})
    .select()
    .single();

  if (convError || !conversation) {
    return { error: "Couldn't start the conversation. Try again." };
  }

  const { error: participantsError } = await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: recipient.id },
    ]);

  if (participantsError) {
    return { error: "Couldn't add participants. Try again." };
  }

  revalidatePath("/chat");
  return { conversationId: conversation.id };
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be logged in." };
  }

  if (!content.trim()) {
    return { error: "Message can't be empty." };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content.trim(),
  });

  if (error) {
    return { error: "Message didn't send. Try again." };
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { success: true };
}
