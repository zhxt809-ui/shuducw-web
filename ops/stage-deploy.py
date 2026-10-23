#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成部署包（.deploy-stage + deploy-new.tar.gz），解决 pnpm + Next 16 standalone 的依赖缺口。

背景（2026-10-23 事故）：
- Next 16.4.2 在 pnpm 布局下，`.next/standalone/node_modules` 只产出 next/react/react-dom 三个
  **junction 符号链接**，缺 @next/env、@swc/helpers、styled-jsx、sharp、client-only 等运行时依赖；
- Copy-Item 复制 junction 会留下断链，tar 包到服务器直接 MODULE_NOT_FOUND（Cannot find module '@next/env'）。

本脚本做的事：
1. 清空并重建 .deploy-stage；
2. robocopy 跟随 junction 复制 .next/standalone（含 .pnpm 虚拟店）；
3. 把 .pnpm/<pkg>@*/node_modules/<pkg> 里的运行时依赖按名解引用复制到 .deploy-stage/node_modules 顶层；
4. 合并 .next/static 与 public；
5. 打包 deploy-new.tar.gz；
6. 打印各关键依赖是否就位（缺一即退出非 0）。

用法：python ops/stage-deploy.py          # 构建前需先 pnpm build
"""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STANDALONE = ROOT / ".next" / "standalone"
STAGE = ROOT / ".deploy-stage"

# 服务器现有部署 /var/www/shuducw-run/node_modules 的包清单（standalone 正常运行所需的顶层依赖）
REQUIRED = [
    "next", "react", "react-dom",
    "@next/env", "@swc/helpers", "styled-jsx", "client-only",
    "sharp", "@img/colour", "detect-libc", "semver", "typescript",
]


def robocopy(src: Path, dst: Path) -> None:
    r = subprocess.run(
        ["robocopy", str(src), str(dst), "/E", "/NFL", "/NDL", "/NJH", "/NJS", "/NP"],
        capture_output=True,
        text=True,
    )
    # robocopy: 0-7 为成功语义（1=有文件被复制），>=8 才是错误
    if r.returncode >= 8:
        raise SystemExit(f"robocopy 失败 {src} -> {dst}: {r.returncode}\n{r.stdout[-500:]}")


def pnpm_pkg_dir(pkg):
    # 不用 PEP 604 联合类型注解：本机 Python 3.8 不支持 Path | None
    name = pkg.replace("/", "+")
    store = STANDALONE / "node_modules" / ".pnpm"
    if not store.exists():
        return None
    for d in store.iterdir():
        if d.is_dir() and d.name.startswith(name + "@"):
            candidate = d / "node_modules" / pkg
            if candidate.exists():
                return candidate
    return None


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    if not (STANDALONE / "server.js").exists():
        print("缺少 .next/standalone/server.js，请先 pnpm build")
        return 2

    if STAGE.exists():
        shutil.rmtree(STAGE)
    STAGE.mkdir()

    print("1/4 复制 standalone（跟随 junction）...")
    robocopy(STANDALONE, STAGE)

    print("2/4 补齐 pnpm 虚拟店里的运行时依赖...")
    nm = STAGE / "node_modules"
    for pkg in REQUIRED:
        dst = nm / pkg
        if dst.exists():
            continue
        src = pnpm_pkg_dir(pkg)
        if src is None:
            # 有些包在项目 node_modules 顶层（直接依赖）
            alt = ROOT / "node_modules" / pkg
            src = alt if alt.exists() else None
        if src is None:
            print(f"  [警告] 找不到 {pkg}（构建时未被应用引用，可忽略）")
            continue
        robocopy(src, dst)
        print(f"  + {pkg}")

    print("3/4 合并 static 与 public...")
    robocopy(ROOT / ".next" / "static", STAGE / ".next" / "static")
    robocopy(ROOT / "public", STAGE / "public")

    print("4/4 打包...")
    tar = ROOT / "deploy-new.tar.gz"
    if tar.exists():
        tar.unlink()
    r = subprocess.run(["tar", "-czf", str(tar), "-C", str(STAGE), "."], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"tar 失败: {r.stderr[-500:]}")

    missing = [p for p in REQUIRED if not (nm / p).exists()]
    size_mb = tar.stat().st_size / 1024 / 1024
    print(f"\n包: {tar.name}  {size_mb:.1f} MB")
    print("缺少依赖: " + (", ".join(missing) if missing else "无"))
    if missing:
        print("→ 缺失项会导致线上 MODULE_NOT_FOUND，请先本地 node .deploy-stage/server.js 验证")
        return 1
    print("提示：上传前请在 .deploy-stage 内执行 `node server.js` 实测首页 200（保险做法）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
