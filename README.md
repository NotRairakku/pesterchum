# Pesterchum


## About
This project is an instant messaging client inspired by **Pesterchum**, recreating the visual style and general user experience seen in the webcomic *Homestuck*.
The implementation is original and developed independently.  
The project is intended for educational and non-commercial purposes.

## Intellectual Property Notice
*Homestuck* and **Pesterchum** are creations of **Andrew Hussie**.
All original characters, names, visual styles, and concepts related to *Homestuck* and Pesterchum are the intellectual property of their respective owner (Andrew Hussie).

This project is **not affiliated with, endorsed by, or associated with** Andrew Hussie or the official *Homestuck* works in any way.
<hr>

## Development setup

Wails client + gRPC server written in Go.

### Requirements

- Go (latest recommended)
- Wails CLI
- Protobuf compiler (`protoc`)

### Install Wails

```bash
  go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### Check that everything is installed correctly:

```bash
  wails doctor
```

### Install Protobuf (protoc)
Download `protoc` from the official releases page:
https://github.com/protocolbuffers/protobuf/releases/

Unpack the archive to any folder on your computer.
You must either:
- add `protoc` to your PATH
- or use an absolute path when running it (see examples below)

### Install Go plugins for protobuf and gRPC
```bash
  go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
  go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

### Generate gRPC code
If `protoc` is in PATH:
```bash
  protoc --go_out=. --go-grpc_out=. server/proto/api.proto
```

Windows example with absolute path:
```bash
  C:\protoc\bin\protoc.exe --go_out=. --go-grpc_out=. server/proto/api.proto
```

## Run the project
### Start gRPC server
```bash
  cd server
  go run ./cmd/server
```
### Start Wails client
```bash
  cd app
  wails dev
```

## Build the project
### Build gRPC server
```bash
  cd server/cmd/server
  ./build.ps1
```

### Build Wails client
```bash
  cd app
  wails build
```
Server and client should now be running and able to communicate.
If something fails — check logs and make sure PATH and dependencies are set correctly.


