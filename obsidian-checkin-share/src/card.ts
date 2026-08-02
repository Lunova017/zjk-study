/**
 * 里程碑脉冲卡 HTML 生成（纯 HTML 字符串）。
 *
 * 从「每日打卡巨数字 + 连续天数 + 3000 日环」彻底改为：
 *   类型徽章（突破/顿悟/里程碑/决策） + 里程碑标题 + 一句话注解。
 * 视觉重心是这次「脉冲」本身，而非任何日历指标。
 *
 * 注意：主题色含带引号的 data URI（如 url("data:image/svg+xml,...")），
 * 因此不手写 style 属性，而是先用 createElement 建好元素、用 setProperty 写入 CSS 变量，
 * 再取 outerHTML —— 让浏览器负责正确转义引号，避免破坏 HTML 属性。
 */
import type { ShareTheme, ShareRatio, MilestoneType } from "./themes";
import { makeRng, pickQuote, getImageryByDate } from "./themes";

const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

function pad(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

/** 转义用户输入，避免破坏卡片 HTML 结构 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface CardOptions {
  /** 里程碑类型（突破/顿悟/里程碑/决策） */
  type: MilestoneType;
  /** 里程碑标题（视觉重心） */
  title: string;
  /** 一句话注解（可空） */
  subtitle: string;
  /** 第 N 座里程碑 */
  seq: number;
  theme: ShareTheme;
  ratio: ShareRatio;
  /** 同一次分享内稳定，保证预览与导出一致 */
  seed: number;
}

export function buildCardHTML(opts: CardOptions): string {
  const { type, title, subtitle, seq, theme, ratio, seed } = opts;
  const t = theme;
  const now = new Date();

  const todayStr = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;
  const weekday = WEEKDAYS[now.getDay()];

  const k = ratio.h / 1080;
  const rng = makeRng(seed);
  const quote = pickQuote(rng);
  const imagery = getImageryByDate(now);

  const glowX = 8 + rng() * 40;
  const glowY = 55 + rng() * 35;

  // 标题字号随长度自适应（越长越小），并按比例微调
  const titleText = (title || "").trim() || "（写下这次里程碑）";
  const titleLen = [...titleText].length;
  const baseTitle = titleLen <= 8 ? 92 : titleLen <= 14 ? 74 : titleLen <= 22 ? 58 : 46;
  const TITLE_SCALE: Record<string, number> = { wechat: 1.0, xhs: 0.98, weibo: 0.92 };
  const titleSize = baseTitle * k * (TITLE_SCALE[ratio.id] ?? 1);

  const wrap = document.createElement("div");
  wrap.className = "share-card";
  wrap.innerHTML = `
  <div class="sc-pattern-overlay"></div>
  <div class="sc-grain"></div>
  <div class="sc-glow-center" style="background: radial-gradient(circle, ${t.glow}, transparent 62%)"></div>
  <div class="sc-glow-edge" style="left:${glowX}%; top:${glowY}%; background: radial-gradient(circle, ${t.glow}, transparent 60%)"></div>

  <div class="sc-content">
    <header class="sc-head">
      <div class="sc-brand">循星台<small>CIRAST</small></div>
      <div class="sc-anchor">
        <span class="sc-anchor-cn">循星纪 · 第 ${seq} 座里程碑</span>
        <span class="sc-anchor-en">MILESTONE NO.${pad(seq)}</span>
      </div>
    </header>

    <div class="sc-focus-ms">
      <div class="sc-ms-type">
        <span class="sc-ms-glyph">${type.glyph}</span>${type.cn}<em>${type.en}</em>
      </div>
      <div class="sc-ms-title">${escapeHtml(titleText)}</div>
      ${subtitle ? `<div class="sc-ms-sub">${escapeHtml(subtitle)}</div>` : ""}
      <div class="sc-ms-rule"></div>
    </div>

    <footer class="sc-foot">
      <div class="sc-quote-col">
        <div class="sc-quote">「${quote}」</div>
        <div class="sc-imagery">${imagery}</div>
      </div>
      <div class="sc-foot-right">
        <div class="sc-date">
          <b>${todayStr}</b>
          <span class="sc-date-cn">${weekday}</span>
          <span class="sc-date-en">${now.getFullYear()} · ${pad(now.getMonth() + 1)} · ${pad(now.getDate())}</span>
        </div>
        <div class="sc-seal">
          <span>循星</span>
          <em>里程</em>
        </div>
      </div>
    </footer>
  </div>`;

  // 尺寸与主题变量（含带引号的 data URI，必须走 setProperty 让浏览器正确转义）
  wrap.style.width = `${ratio.w}px`;
  wrap.style.height = `${ratio.h}px`;
  wrap.style.setProperty("--sc-k", String(k));
  wrap.style.setProperty("--sc-title", `${titleSize}px`);
  wrap.style.setProperty("--sc-bg", t.bg);
  wrap.style.setProperty("--sc-bg-noise", t.bgNoise);
  wrap.style.setProperty("--sc-pattern", t.pattern);
  wrap.style.setProperty("--sc-ink", t.ink);
  wrap.style.setProperty("--sc-dim", t.dim);
  wrap.style.setProperty("--sc-faint", t.faint);
  wrap.style.setProperty("--sc-foil", t.foil);
  wrap.style.setProperty("--sc-line", t.line);
  wrap.style.setProperty("--sc-seal-bg", t.sealBg);
  wrap.style.setProperty("--sc-seal-ink", t.sealInk);
  wrap.style.setProperty("--sc-glow", t.glow);

  return wrap.outerHTML;
}
