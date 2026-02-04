create table users (
                       id bigserial primary key,
                       username text unique not null,
                       password_hash text not null
);

create table sessions (
                          id uuid primary key,
                          user_id bigint references users(id),
                          expires_at timestamptz not null
);

create unique index idx_users_username on users(username);
create index idx_sessions_user_id on sessions(user_id);
