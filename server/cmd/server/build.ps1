New-Item -ItemType Directory -Force -Path ../../bin | Out-Null

$platforms = @(
    @{ Os="windows"; Arch="amd64"; Ext=".exe"; Name="windows-amd64" },
    @{ Os="windows"; Arch="arm64"; Ext=".exe"; Name="windows-arm64" },
    @{ Os="linux";   Arch="amd64"; Ext="";     Name="linux-amd64" },
    @{ Os="linux";   Arch="arm64"; Ext="";     Name="linux-arm64" },
    @{ Os="darwin";  Arch="amd64"; Ext="";     Name="macos-amd64" },
    @{ Os="darwin";  Arch="arm64"; Ext="";     Name="macos-arm64" }
)

foreach ($p in $platforms) {
    $env:GOOS = $p.Os
    $env:GOARCH = $p.Arch
    $output = "../../bin/server-$($p.Name)$($p.Ext)"

    Write-Host "Building $($p.Os)-$($p.Arch)..."
    go build -ldflags="-s -w" -trimpath -o $output .

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR while building $($p.Os)-$($p.Arch)" -ForegroundColor Red
    } else {
        Write-Host "Done: $output" -ForegroundColor Green
    }
}

Remove-Item Env:\GOOS -ErrorAction SilentlyContinue
Remove-Item Env:\GOARCH -ErrorAction SilentlyContinue