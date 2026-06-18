# Maintainer: Comardom <Comardom@outlook.com>

pkgname=taskapsule
pkgver=0.2.0
pkgrel=1
pkgdesc="Task management app with Electron + Vue + Go backend"
arch=('x86_64')
url="https://github.com/Comardom/tasKapsule"
license=('Apache-2.0')
depends=('electron')
makedepends=('go' 'nodejs-lts-krypton' 'pnpm' 'typescript')
source=("$pkgname-$pkgver.tar.gz::https://github.com/Comardom/tasKapsule/archive/refs/tags/v$pkgver.tar.gz")
sha256sums=('eea0a309bd77e446f25bf52f949a47ab7b1d0c65d99786bdd5f9f2920c9c21c3')

prepare() {
  cd "$srcdir/tasKapsule-$pkgver"

  # 强制生产模式（修改 TypeScript 源文件，确保编译后生效）
  sed -i 's|process\.resourcesPath|path.join(__dirname, "resources")|g' electron/main.ts
  sed -i 's|const isProd = app.isPackaged;|const isProd = true;|' electron/main.ts

  # 添加窗口图标（确保 path 已导入）
  sed -i '/autoHideMenuBar: true/a\        icon: path.join(__dirname, "resources", "icon.png"),' electron/main.ts
}

build() {
  cd "$srcdir/tasKapsule-$pkgver"

  # 避免 pnpm 下载 Electron 二进制
  export ELECTRON_SKIP_BINARY_DOWNLOAD=1

  # 构建前端
  cd frontend
  pnpm install --no-frozen-lockfile
  pnpm build
  cd ..

  # 构建后端
  cd backend
  go build -trimpath -ldflags="-s -w" -o taskapsule-server
  cd ..

  # 编译 Electron 主进程（指定 tsconfig）
  tsc -p electron/tsconfig.json   # 或 tsc -p electron，视项目结构而定
}

package() {
  cd "$srcdir/tasKapsule-$pkgver"
  local appdir="$pkgdir/usr/lib/$pkgname"
  local resdir="$appdir/resources"

  install -d "$appdir"
  install -d "$resdir/frontend/dist"

  # 主进程文件
  cp electron/dist/main.js    "$appdir/"
  cp electron/dist/preload.js "$appdir/"
  [ -f electron/dist/killPort.js ] && cp electron/dist/killPort.js "$appdir/"

  # 前端资源
  cp -r frontend/dist/* "$resdir/frontend/dist/"

  # 后端和图标
  install -Dm755 backend/taskapsule-server "$resdir/"
  install -Dm644 build/icon.png "$resdir/"

  # 启动脚本
  install -Dm755 /dev/stdin "$pkgdir/usr/bin/taskapsule" <<'EOF'
#!/bin/bash
exec /usr/bin/electron /usr/lib/taskapsule/main.js "$@"
EOF

  # .desktop 文件
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

  # 图标（符合 hicolor 规范）
  install -Dm644 build/icon.png "$pkgdir/usr/share/icons/hicolor/512x512/apps/taskapsule.png"

  # 许可证
  install -Dm644 LICENSE "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
}
