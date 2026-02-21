CREATE TYPE mood_type AS ENUM (
    'chummy',
    'palsy',
    'chipper',
    'bully',
    'peppy',
    'rancorous'
    );

CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    photo TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    mood mood_type NOT NULL DEFAULT 'chummy',
    color TEXT NOT NULL,
    birthdate TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_username ON users(username);


CREATE TABLE sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE friends (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(user_id, friend_id),
    CHECK(user_id <> friend_id)
);

CREATE INDEX idx_friends_friend_id ON friends(friend_id);

CREATE TABLE requests_friends (
    request_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_friends_user_id ON requests_friends(user_id);
CREATE INDEX idx_requests_friends_friend_id ON requests_friends(friend_id);

CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_message_id ON messages(message_id);

-- trigger for updating updated_at
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

CREATE TRIGGER trg_friends_updated_at
    BEFORE UPDATE ON friends
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_requests_friends_updated_at
    BEFORE UPDATE ON requests_friends
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
