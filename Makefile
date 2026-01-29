CLIENT_DIR := client
SERVER_DIR := server

# Default prefixes - with cd
CLIENT_PREFIX = cd $(CLIENT_DIR) &&
SERVER_PREFIX = cd $(SERVER_DIR) &&

# If we are in the desired folder, remove cd
ifeq ($(notdir $(CURDIR)),$(CLIENT_DIR))
    CLIENT_PREFIX :=
endif

ifeq ($(notdir $(CURDIR)),$(SERVER_DIR))
    SERVER_PREFIX :=
endif

.PHONY: run-server npm-dev tauri-dev npm-build tauri-build app-dev app-build server-build

run-server:
	$(SERVER_PREFIX)go run ./cmd/server

npm-dev:
	$(CLIENT_PREFIX)npm run dev

tauri-dev:
	$(CLIENT_PREFIX)npx tauri dev

npm-build:
	$(CLIENT_PREFIX)npm run build

tauri-build:
	$(CLIENT_PREFIX)npx tauri build --release

server-build:
	$(SERVER_PREFIX)go build -o ../server-app ./cmd/server

app-dev:
	@trap 'kill 0' INT; \
	 ($(SERVER_PREFIX)go run ./cmd/server) & \
	 ($(CLIENT_PREFIX)npm run dev) & \
	 ($(CLIENT_PREFIX)npx tauri dev) & \
	 wait

app-build: npm-build tauri-build
