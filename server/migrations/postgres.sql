create type mood_type as enum (
    'chummy',
    'palsy',
    'chipper',
    'bully',
    'peppy',
    'rancorous'
    );

create table users (
    user_id uuid primary key,
    username text not null,
    password_hash text not null,
    photo text not null default '',
    description text not null default '',
    mood mood_type not null default 'chummy',
    color text not null,
    birthdate text not null default '',
    address text not null default '',
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create unique index idx_users_username on users (username);

create table sessions (
    session_id uuid primary key,
    user_id uuid not null references users(user_id) on delete cascade,
    expires_at timestamptz not null
);

create index idx_sessions_user_id on sessions (user_id);
create index idx_sessions_expires_at on sessions (expires_at);

create table friends (
    user_id uuid not null references users(user_id) on delete cascade,
    friend_id uuid not null references users(user_id) on delete cascade,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    primary key (user_id, friend_id),
    check (user_id <> friend_id)
);

create index idx_friends_friend_id on friends (friend_id);

create table requests_friends (
    request_id uuid primary key,
    user_id uuid not null references users(user_id) on delete cascade,
    friend_id uuid not null references users(user_id) on delete cascade,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create index idx_requests_friends_request_id on requests_friends (request_id);

create table messages (
    message_id uuid primary key,
    sender_id uuid not null references users(user_id) on delete cascade,
    recipient_id uuid not null references users(user_id) on delete cascade,
    message text null,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create index idx_messages_message_id on messages (message_id);

CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();