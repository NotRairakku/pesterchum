create type mood_type as enum (
    'chummy',
    'palsy',
    'chipper',
    'bully',
    'peppy',
    'rancorous'
    );

create table users (
    id bigserial primary key,
    username text not null,
    password_hash text not null,
    mood mood_type not null default 'chummy'
);

create unique index idx_users_username on users (username);

create table sessions (
    id uuid primary key,
    user_id bigint not null references users(id) on delete cascade,
    expires_at timestamptz not null
);

create index idx_sessions_user_id on sessions (user_id);
create index idx_sessions_expires_at on sessions (expires_at);

create table friends (
    user_id bigint not null references users(id) on delete cascade,
    friend_id bigint not null references users(id) on delete cascade,
    primary key (user_id, friend_id),
    check (user_id <> friend_id)
);

create index idx_friends_friend_id on friends (friend_id);
