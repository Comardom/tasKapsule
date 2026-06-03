# Maintainer: Comardom <Comardom@outlook.com>
pkgname=taskapsule
pkgver=0.1.25
pkgrel=1
pkgdesc="Task management app with Electron + Vue + Go backend"
arch=('x86_64')
url="https://github.com/Comardom/tasKapsule"
license=('Apache2.0')
depends=('electron' 'electron42')
makedepends=('go' 'nodejs-lts-krypton' 'pnpm' 'typescript')

prepare() {
  cd "$startdir"
  sed -i 's|"electron": "42.0.0-alpha.5"|"electron": "^42.0.0"|' package.json
  sed -i 's|process\.resourcesPath|path.join(__dirname, "resources")|g' electron/main.ts
  sed -i 's|const isProd = app.isPackaged;|const isProd = true;|' electron/main.ts
  # 窗口图标
  sed -i '/autoHideMenuBar: true/a\        icon: path.join(__dirname, "resources", "icon.png"),' electron/main.ts
}

build() {
  cd "$startdir"
  export ELECTRON_SKIP_BINARY_DOWNLOAD=1
  pnpm install
  cd frontend && pnpm build && cd ..
  cd backend && go build -ldflags="-s -w" -o taskapsule-server && cd ..
  tsc -p electron
}

package() {
  cd "$startdir"
  local appdir="$pkgdir/usr/lib/$pkgname"
  local resdir="$appdir/resources"

  install -d "$appdir"
  cp electron/dist/main.js    "$appdir/"
  cp electron/dist/preload.js "$appdir/"
  cp electron/dist/killPort.js "$appdir/"

  install -d "$resdir/frontend/dist"
  cp -r frontend/dist/* "$resdir/frontend/dist/"
  install -Dm755 backend/taskapsule-server "$resdir/taskapsule-server"
  install -Dm644 build/icon.png "$resdir/icon.png"

  install -Dm755 /dev/stdin "$pkgdir/usr/bin/taskapsule" <<'EOF'
#!/bin/bash
exec /usr/bin/electron /usr/lib/taskapsule/main.js "$@"
EOF

  install -Dm644 /dev/stdin "$pkgdir/usr/share/applications/taskapsule.desktop" <<EOF
[Desktop Entry]
Name=tasKapsule
Comment=Task management app
Exec=taskapsule
Icon=taskapsule
Terminal=false
Type=Application
StartupWMClass=taskapsule
Categories=Utility;
EOF

  install -Dm644 build/icon.png "$pkgdir/usr/share/icons/hicolor/512x512/apps/taskapsule.png"
  install -Dm644 LICENSE "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
}
