# 用 Catbox 存放 Live2D 模型（免信用卡，让公网也有动态看板娘）

## 为什么

你的大肥鱼（DeepSeek-chan）免费公皮**禁止随 GitHub 仓库重新分发**（授权要求），所以模型文件没有进仓库。这导致：

- 本地 `npm run dev` / 本地构建 → 有模型 → 看板娘是**动态**的 ✅
- GitHub → Cloudflare Pages 自动构建 → 没有模型 → 看板娘降级为**静态立绘** ⚠️

想让公网也能用动态看板娘，需要把模型文件放到一个**公网可访问的地方**。Catbox 是最合适的免信用卡方案。

## Catbox 是什么

- 完全**免注册、免信用卡**
- 单文件上限 **200MB**，你的模型解压后约 27MB，绰绰有余
- 不压缩图片、支持任意文件类型
- 提供**永久直链**（形如 `https://files.catbox.moe/xxxx.zip`）

## 操作步骤

### 第一步：把模型打包成一个 zip

模型必须保持目录结构。在终端（macOS）执行：

```bash
cd "/Users/admin78/Downloads/DeepSeek免费公皮"
zip -r dafeiyu-model.zip "DeepSeek" \
  -x "DeepSeek/psd/*" \
  -x "*/.DS_Store"
ls -lh dafeiyu-model.zip        # 确认 < 200MB
```

> 排除 `psd/`（那是源文件，网页用不到，能省一半体积）和 `.DS_Store`。

### 第二步：上传到 Catbox

打开 https://catbox.moe/
- 直接把 `dafeiyu-model.zip` 拖进网页的上传区，等它传完
- 上传完成后会得到一个直链，形如：
  ```
  https://files.catbox.moe/a1b2c3.zip
  ```
- **保存好这个链接**（Catbox 没有账号后台，链接丢了就得重传）

> 备选：JonesFiles / Gofile。如果 Catbox 偶尔打不开，这些也是免注册免信用卡的。

### 第三步：让部署时能拿到模型

在你的仓库 `Jiboyu78/zfzblog` 里，打开 `.github/workflows/deploy.yml`，在 `npm run build` 那步**之前**加一段下载+解压：

```yaml
      - name: 下载 Live2D 模型（Catbox 托管）
        run: |
          MODEL_URL="https://files.catbox.moe/a1b2c3.zip"   # ← 换成你的直链
          cd /tmp
          curl -sL "$MODEL_URL" -o model.zip
          unzip -q model.zip -d model
          MROOT="$GITHUB_WORKSPACE/public/models/dafeiyu"
          mkdir -p "$MROOT"
          cp -R model/DeepSeek/* "$MROOT/" 2>/dev/null || cp -R model/* "$MROOT/"

      - name: Build (Astro + OG + Pagefind)
        run: npm run build
```

> ⚠️ 注意：这只在你走 **GitHub Actions 自动部署**（方式 B）时有效。
> 如果你走的是 **Cloudflare Pages 直连 GitHub**（方式 A）构建，需要在 Cloudflare 的 Build command 里改成一条 shell 命令（pages 支持）：
> ```
> bash ./scripts/fetch-models.sh && npm run build
> ```
> 同时新建 `scripts/fetch-models.sh` 放同样的下载逻辑。

### 第四步：云端 Cubism Core

Cubism Core（`live2dcubismcore.min.js`）你本地已有但不能进仓库（Live2D Inc. 专有授权）。
在 `public/models/live2dcubismcore.min.js` 下载链接已在仓库 README 注明，部署脚本里可以加一步：

```yaml
      - name: 下载 Cubism Core
        run: |
          curl -sL "https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js" \
            -o "$GITHUB_WORKSPACE/public/models/live2dcubismcore.min.js"
```

### 效果

配置好之后：你 `git push` → Cloudflare 拉仓库构建 → 构建时自动从 Catbox 下载模型、从 Live2D 官方下载 Cubism Core → 构建出的公网站点**动态大肥鱼看板娘生效**，和你本地看到的一样。

## 验证

打开线上 `https://zfzblog.pages.dev`，如果右下角是**会呼吸会眨眼的大肥鱼**（而不是静态图），就成功了；如果还是静态图，检查 Cloudflare 构建日志里下载那步有没有报错（最常见是 Catbox 链接填错、或 zip 解压路径不对）。

## 常规/常见问题

- **Q：Catbox 会跑路吗？**
  A：它靠用户捐赠运营，比「没有」稳，但不是企业级 SLA。重要模型本地一定留备份（你已经有 `/Users/admin78/Downloads/DeepSeek免费公皮` 原文件），Catbox 只为部署用。
- **Q：模型更新怎么办？**
  A：重新打包 zip 上传 Catbox 拿到新链接，改 workflow 里那一行 URL，`git push` 即可。
- **Q：能不能不进 GitHub 的数据保密一点？**
  A：可以。把 Catbox 链接存成 GitHub Actions Secret（比如 `L2D_MODEL_URL`），workflow 里用 `${{ secrets.L2D_MODEL_URL }}`，这样链接不会出现在仓库明文里。
