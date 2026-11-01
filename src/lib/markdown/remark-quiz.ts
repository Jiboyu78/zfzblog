/**
 * remarkQuiz：` ```quiz ` 围栏代码块 → 客户端可交互判分的答题块。
 *
 * 输入格式（极简 YAML 子集，多个题目用 `---` 分隔）：
 *
 *     ```quiz
 *     question: 1 + 1 = ?
 *     options:
 *       - 1
 *       - 2
 *       - 3
 *     answer: 1
 *     explanation: 基础算术。
 *     ```
 *
 *   - options 为 `- ` 开头的列表
 *   - answer 为 0 基索引（也可写多索引用逗号分隔，视为多选）
 *   - explanation 可选
 *
 * 输出：
 *   <div class="quiz" data-quiz="BASE64(JSON)">静态回退渲染</div>
 * 客户端脚本读取 data-quiz，绑定点击判分、展示解析。
 */
import type { Root, Code } from 'mdast';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number[];
  explanation?: string;
}

export function remarkQuiz() {
  return function transform(tree: Root): void {
    const walk = (node: any): void => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node.children)) {
        node.children = node.children.map((child: any) => {
          if (child.type === 'code' && (child as Code).lang === 'quiz') {
            return quizNodeToHtml(child as Code);
          }
          walk(child);
          return child;
        });
      }
    };
    walk(tree);
  };
}

function quizNodeToHtml(node: Code): any {
  const questions = parseQuizSource(node.value);
  const payload = Buffer.from(JSON.stringify(questions), 'utf8').toString('base64');

  // 静态回退：即使 JS 被禁用也能看到题目和选项
  const staticHtml = questions
    .map((q, qi) => {
      const opts = q.options
        .map(
          (o, oi) =>
            `<li class="quiz-option" data-qi="${qi}" data-oi="${oi}"><span class="quiz-marker">${String.fromCharCode(
              65 + oi
            )}</span><span class="quiz-text">${escapeHtml(o)}</span></li>`
        )
        .join('');
      return `<div class="quiz-question" data-qi="${qi}"><p class="quiz-q"><span class="quiz-no">Q${
        qi + 1
      }</span>${escapeHtml(q.question)}</p><ul class="quiz-options">${opts}</ul><div class="quiz-feedback" hidden></div></div>`;
    })
    .join('');

  return {
    type: 'html',
    value: `<div class="quiz" data-quiz="${payload}">${staticHtml}</div>`,
  };
}

/** 极简 YAML 子集解析：只支持本插件需要的字段 */
function parseQuizSource(src: string): QuizQuestion[] {
  return src
    .split(/^---\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseSingleQuiz);
}

function parseSingleQuiz(src: string): QuizQuestion {
  const lines = src.split(/\r?\n/);
  const q: QuizQuestion = { question: '', options: [], answer: [] };
  let inOptions = false;

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) continue;
    if (inOptions && /^\s*-\s+/.test(line)) {
      q.options.push(line.replace(/^\s*-\s+/, '').trim());
      continue;
    }
    inOptions = false;
    const kv = /^([A-Za-z]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, key, valueRaw] = kv;
    const value = valueRaw.trim();
    if (key === 'question') q.question = stripQuotes(value);
    else if (key === 'answer') {
      q.answer = value
        .split(/[,，]/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n));
    } else if (key === 'explanation') q.explanation = stripQuotes(value);
    else if (key === 'options') inOptions = true;
  }
  return q;
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
