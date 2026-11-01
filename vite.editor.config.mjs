// 打包写作室编辑器（CodeMirror 6 + marked）为独立 IIFE bundle
// 输出到 public/editor/editor.js，由 write.astro 通过 <script src> 加载。
// 这样写作室的 ~200KB JS 只在写作室页面加载，不进任何文章页的产物。
import { defineConfig } from 'vite';

export default defineConfig({
  logLevel: 'warn',
  publicDir: false,
  build: {
    outDir: 'public/editor',
    emptyOutDir: false,
    sourcemap: false,
    minify: false,
    target: 'es2020',
    lib: {
      entry: 'src/editor/editor-entry.js',
      name: 'OiEditor',
      formats: ['iife'],
      fileName: () => 'editor.js',
    },
  },
});
