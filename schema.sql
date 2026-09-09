-- ClearSpeak database schema
-- Run this in the Supabase SQL Editor after creating your project.

-- ─────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  email text not null,
  reading_font text default 'atkinson',        -- 'atkinson' | 'standard'
  color_overlay text default 'none',            -- 'none' | 'cream' | 'blue' | 'rose'
  line_spacing text default 'relaxed',          -- 'relaxed' | 'standard'
  tts_speed numeric default 1.0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view all profiles"
  on profiles for select using (true);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Let users look each other up by email to start a conversation
create index profiles_email_idx on profiles (email);

-- ─────────────────────────────────────────────
-- CONVERSATIONS
-- ─────────────────────────────────────────────
create table conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  last_message_at timestamptz default now()
);

create table conversation_participants (
  conversation_id uuid references conversations on delete cascade,
  user_id uuid references profiles on delete cascade,
  primary key (conversation_id, user_id)
);

alter table conversations enable row level security;
alter table conversation_participants enable row level security;

create policy "Users see conversations they're part of"
  on conversations for select using (
    id in (
      select conversation_id from conversation_participants
      where user_id = auth.uid()
    )
  );

create policy "Users can create conversations"
  on conversations for insert with check (true);

create policy "Users see their own participant rows"
  on conversation_participants for select using (
    conversation_id in (
      select conversation_id from conversation_participants
      where user_id = auth.uid()
    )
  );

create policy "Users can add participants to conversations they create"
  on conversation_participants for insert with check (true);

-- ─────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations on delete cascade not null,
  sender_id uuid references profiles not null,
  content text not null,                  -- final text (typed or transcribed)
  original_voice_url text,                -- storage path if sent as voice
  was_simplified boolean default false,   -- true if reader requested a simplified version
  simplified_content text,                -- cached simplified version
  was_cleaned_up boolean default false,   -- true if sender used the AI cleanup pass before sending
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "Users see messages in their conversations"
  on messages for select using (
    conversation_id in (
      select conversation_id from conversation_participants
      where user_id = auth.uid()
    )
  );

create policy "Users can send messages to their conversations"
  on messages for insert with check (
    sender_id = auth.uid()
    and conversation_id in (
      select conversation_id from conversation_participants
      where user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- REALTIME
-- ─────────────────────────────────────────────
-- Enable realtime on messages so new messages stream to open conversations
alter publication supabase_realtime add table messages;

-- ─────────────────────────────────────────────
-- STORAGE (run separately in Supabase Storage settings, or via dashboard)
-- ─────────────────────────────────────────────
-- Create a bucket named "voice-messages" (private) for recorded audio uploads.
-- Create a bucket named "avatars" (public) if you add profile photos later.
