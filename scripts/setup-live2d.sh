#!/usr/bin/env bash
#
# Live2D 模型准备脚本
#
# ⚠️  授权提醒（务必先读）
#
#  1. Cubism Core 运行时（live2dcubismcore.min.js）是 Live2D Inc. 的专有软件，
#     **不允许再分发**。必须自行从 Live2D 官网下载 Cubism SDK for Web 并解压获取。
#     下载：https://www.live2d.com/en/sdk/download/web/
#
#  2. 官方样例模型（Shizuku / Haru / Hiyori / Mao / Rice / Nito 等）受
#     Live2D Free Material License 约束：
#       - 可用于个人 / 研究用途
#       - **不可改名、不可改设定**
#       - **必须署名**（本项目页脚已有固定署名位）
#     条款：https://www.live2d.com/eula/live2d-sample-model-terms_en.html
#
#  3. 本脚本只负责目录准备与校验，不下载、不分发任何模型文件。
#     请自行从官网下载后解压到对应目录。
#
#  用法：
#    ./scripts/setup-live2d.sh          # 只建目录并打印清单
#    ./scripts/setup-live2d.sh --check  # 校验现有模型是否完整

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODELS_DIR="$ROOT/public/models"

# 模型清单：id -> 显示名
declare -a MODEL_IDS=("shizuku" "haru" "hiyori")
declare -a MODEL_NAMES=("しずく (Shizuku)" "はる (Haru)" "ひより (Hiyori Momose)")
declare -a MODEL_CUBISM=("Cubism 4" "Cubism 4" "Cubism 4")

mkdir -p "$MODELS_DIR"

echo "════════════════════════════════════════════════════════════"
echo " Live2D 模型目录已就绪：$MODELS_DIR"
echo "════════════════════════════════════════════════════════════"
echo ""

for i in "${!MODEL_IDS[@]}"; do
  id="${MODEL_IDS[$i]}"
  dir="$MODELS_DIR/$id"
  mkdir -p "$dir"
  echo "▸ ${MODEL_NAMES[$i]}  (${MODEL_CUBISM[$i]})"
  echo "  目录：$dir"
  echo "  需要包含："
  echo "    $id.model3.json      ← 入口文件"
  echo "    $id.moc3             ← 模型数据"
  echo "    $id.physics3.json    ← 物理（可选）"
  echo "    $id.4096/            ← 贴图目录（或 $id.2048/）"
  echo "    expressions/         ← 表情（可选）"
  echo "    motions/             ← 动作（可选）"
  echo ""
done

echo "▸ Cubism Core 运行时（必须自行从官网 SDK 解压）"
echo "  放到：$MODELS_DIR/live2dcubismcore.min.js"
echo "  下载：https://www.live2d.com/en/sdk/download/web/"
echo ""

if [ "${1:-}" = "--check" ]; then
  echo "════════════════════════════════════════════════════════════"
  echo " 校验结果"
  echo "════════════════════════════════════════════════════════════"
  ok=0; fail=0
  for id in "${MODEL_IDS[@]}"; do
    dir="$MODELS_DIR/$id"
    entry="$dir/$id.model3.json"
    if [ -f "$entry" ]; then
      echo "  ✓ $id  入口文件存在"
      ok=$((ok+1))
    else
      echo "  ✗ $id  缺少 $id.model3.json（该模型将无法加载，会自动降级为静态立绘）"
      fail=$((fail+1))
    fi
  done
  echo ""
  echo "  可用：$ok    缺失：$fail"
  echo ""
  if [ "$fail" -gt 0 ]; then
    echo "  提示：没有模型时看板娘会自动降级为静态立绘，站点其余功能不受影响。"
  fi
  exit 0
fi

cat <<'EOF'
下一步：
  1. 从 https://www.live2d.com/en/sdk/download/web/ 下载 Cubism SDK for Web
     解压出 live2dcubismcore.min.js → public/models/
  2. 从 Live2D 官网下载样例模型 → 解压到 public/models/<模型名>/
     并把入口文件重命名为 <模型名>.model3.json
  3. 运行 ./scripts/setup-live2d.sh --check 校验
  4. 在 src/consts.ts 的 SITE.live2d.models 里调整模型清单

EOF
