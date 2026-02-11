![PESTERCHUM](./assets/img/README_logo.png)

This project is an instant messaging client inspired by Pesterchum, recreating the visual style and general user experience seen in the webcomic Homestuck. The implementation is original and developed independently.
The project is intended for educational and non-commercial purposes.

## Intellectual Property Notice
Homestuck and Pesterchum are creations of Andrew Hussie. All original characters, names, visual styles, and concepts related to Homestuck and Pesterchum are the intellectual property of their respective owner (Andrew Hussie).  
This project is not affiliated with, endorsed by, or associated with Andrew Hussie or the official Homestuck works in any way.

---
## Development setup
Install Wails:
```sh
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

Check that everything is installed correctly:
```sh
wails doctor
```

Install Protobuf (protoc)  
Download `protoc` from the official releases page: https://github.com/protocolbuffers/protobuf/releases/

Unpack the archive to any folder on your computer. You must either:

- add `protoc` to your PATH
- or use an absolute path when running it (see examples below)

Install Go plugins for protobuf and gRPC
```sh
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

Generate gRPC code
If `protoc` is in `PATH`:
```sh
protoc --go_out=. --go-grpc_out=. server/proto/api.proto
```
Windows example with absolute path:
```sh
C:\protoc\bin\protoc.exe --go_out=. --go-grpc_out=. server/proto/api.proto
```

## To do
- [X] Relatively stable client 
- [X] Changing user data 
- [X] Friendship feature
- [ ] Chat function (It's funny that it's not here yet)
- [ ] Improve the UI
- [ ] I haven't figured it out yet...
---
## Run the project
Start gRPC server
```sh
cd server
go run ./cmd/server
```
Start Wails client
```sh
cd app
wails dev
```

## Build the project
Build gRPC server
```sh
cd server/cmd/server
./build.ps1
```
Built files will appear in `pesterchum/server/bin`

Build Wails client
```sh
cd app
wails build
```
Built files will appear in `pesterchum/app/build/bin`

## Create installer
Install NSIS from https://nsis.sourceforge.io/Download/  
Make sure `makensis.exe` is available in `PATH`
```sh
make build
```
Installer will be created in `pesterchum/app/build/bin`


