/**
 * 里程碑计数（纯逻辑，无外部依赖）。
 *
 * 设计哲学：告别「每日打卡 / 连续天数 / 热力图」这类日历驱动的压力指标。
 * 这里只有一个健康的计数——累计里程碑数，它只在你真正达成时才增长，
 * 由 milestoneFolder（默认 content/roadmap）下的笔记数量驱动，绝不随日历自动上涨。
 */
import { App } from "obsidian";

/** 循星台启程之日（仅作叙事锚点，不用于任何"连续/断签"判定） */
export const JOURNEY_START = "2026-07-09";

/**
 * 统计里程碑数量：milestoneFolder 下的 Markdown 文件数（排除各级 index.md）。
 * @param app             Obsidian App
 * @param milestoneFolder 里程碑根路径（vault 内相对路径）
 */
export function countMilestones(app: App, milestoneFolder: string): number {
  const folder = milestoneFolder.replace(/\/+$/, "");
  const files = app.vault
    .getMarkdownFiles()
    .filter((f) => f.path === folder || f.path.startsWith(folder + "/"));
  return files.filter((f) => !/(^|\/)index\.md$/i.test(f.path)).length;
}
