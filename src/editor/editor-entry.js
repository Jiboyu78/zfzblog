/**
 * 写作室编辑器（轻量版）—— 只用 marked 做实时预览，原生 textarea 编辑。
 * 不引入 CodeMirror（那会 +800KB），写作室首屏 JS 控制在 ~40KB。
 * 输出 IIFE 挂 window.OiEditor。
 */
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: true });

export function mount({ mountEl, previewEl, initial, onChange }) {
  const ta = document.createElement('textarea');
  ta.className = 'oi-editor-textarea';
  ta.spellcheck = false;
  ta.value = initial || '';
  ta.setAttribute('aria-label', 'Markdown 编辑器');
  mountEl.appendChild(ta);

  function render(text) {
    if (previewEl) {
      try { previewEl.innerHTML = marked.parse(text || ''); }
      catch { previewEl.textContent = text; }
    }
    if (onChange) onChange(text);
  }
  ta.addEventListener('input', () => render(ta.value));
  // Tab 插入两个空格
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.setRangeText('  ', s, en, 'end');
      render(ta.value);
    }
  });
  render(ta.value);

  return {
    get value() { return ta.value; },
    set value(v) { ta.value = v; render(v); },
    insert(text) {
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.setRangeText(text, s, en, 'end');
      ta.focus();
      render(ta.value);
    },
    focus() { ta.focus(); },
    destroy() { ta.remove(); },
  };
}

window.OiEditor = { mount };
