CHAT_BIN=chat/build/bin/PesterchumChatClient.exe
APP_RES=app/build/windows/installer/resources
APP_DIR=app
CHAT_DIR=chat

.PHONY: build build-chat build-app installer

build: build-chat build-app installer

build-chat:
	cd $(CHAT_DIR) && wails build

build-app:
	cd $(APP_DIR) && wails build

installer:
	mkdir -p $(APP_RES)
	cp $(CHAT_BIN) $(APP_RES)/PesterchumChatClient.exe
	cd $(APP_DIR) && wails build -nsis
