/**
 * 里程碑脉冲弹窗：录入类型 / 标题 / 一句话 → 比例 + 主题 + 实时预览 → 一键复制 / 保存到库。
 *
 * 设计哲学：这是「成果脉冲」而非「每日打卡」。
 * 只有当你真的突破 / 顿悟 / 过关 / 决策时，才在这里生成一张里程碑卡去分享。
 */
import { App, Modal, Notice } from "obsidian";
import { toPng } from "html-to-image";
import { buildCardHTML } from "./card";
import { countMilestones } from "./milestones";
import {
  SHARE_THEMES,
  SHARE_RATIOS,
  MILESTONE_TYPES,
  pickTheme,
  getTheme,
  getMilestoneType,
  type ShareTheme,
  type ShareRatio,
} from "./themes";
import type { CirastSettings } from "./settings";

export class ShareModal extends Modal {
  private settings: CirastSettings;

  private ratioIndex = 0;
  private seed = Math.floor(Math.random() * 1e9);
  private themeId: string | null = null;

  private typeId: string = MILESTONE_TYPES[0].id;
  private title = "";
  private subtitle = "";
  private seq = 1;

  private ratioBtns: HTMLElement[] = [];
  private themeBtns: HTMLElement[] = [];
  private typeBtns: HTMLElement[] = [];
  private previewInner!: HTMLElement;
  private copyBtn!: HTMLButtonElement;
  private saveBtn!: HTMLButtonElement;

  constructor(app: App, settings: CirastSettings) {
    super(app);
    this.settings = settings;
  }

  onOpen(): void {
    const { contentEl, modalEl } = this;
    modalEl.style.width = "600px";

    // 累计里程碑数（成果驱动，非日历驱动）；本次默认为「下一座」
    const count = countMilestones(this.app, this.settings.milestoneFolder);
    this.seq = count + 1;

    contentEl.empty();
    contentEl.classList.add("sx-modal");

    // 头部
    const head = contentEl.createDiv({ cls: "sx-modal-head" });
    head.createDiv({ cls: "sx-modal-title", text: "生成里程碑 · 脉冲卡" });
    const close = head.createDiv({ cls: "sx-modal-close", text: "×" });
    close.onClickEvent(() => this.close());

    const body = contentEl.createDiv({ cls: "sx-modal-body" });

    // 类型
    const typeField = body.createDiv({ cls: "sx-field" });
    typeField.createEl("label", { cls: "sx-label", text: "里程碑类型" });
    const typeRow = typeField.createDiv({ cls: "sx-type-row" });
    MILESTONE_TYPES.forEach((mt) => {
      const b = typeRow.createDiv({ cls: "sx-type-btn" });
      b.createDiv({ cls: "t-cn", text: mt.cn });
      b.createDiv({ cls: "t-en", text: mt.en });
      b.onClickEvent(() => {
        this.typeId = mt.id;
        this.render();
      });
      this.typeBtns.push(b);
    });

    // 标题
    const titleField = body.createDiv({ cls: "sx-field" });
    titleField.createEl("label", { cls: "sx-label", text: "里程碑标题（视觉重心）" });
    const titleInput = titleField.createEl("input", { cls: "sx-input" });
    titleInput.type = "text";
    titleInput.placeholder = "例：xv6 页表映射终于跑通";
    titleInput.oninput = () => {
      this.title = titleInput.value;
      this.render();
    };

    // 一句话
    const subField = body.createDiv({ cls: "sx-field" });
    subField.createEl("label", { cls: "sx-label", text: "一句话注解（可空）" });
    const subInput = subField.createEl("input", { cls: "sx-input" });
    subInput.type = "text";
    subInput.placeholder = "例：卡了三天，原来是 satp 没刷新 TLB";
    subInput.oninput = () => {
      this.subtitle = subInput.value;
      this.render();
    };

    // 序号
    const seqField = body.createDiv({ cls: "sx-field" });
    seqField.createEl("label", { cls: "sx-label", text: "第 N 座里程碑" });
    const seqRow = seqField.createDiv({ cls: "sx-seq-row" });
    const seqInput = seqRow.createEl("input", { cls: "sx-input" });
    seqInput.type = "number";
    seqInput.min = "1";
    seqInput.value = String(this.seq);
    seqInput.oninput = () => {
      const v = parseInt(seqInput.value, 10);
      this.seq = Number.isFinite(v) && v > 0 ? v : 1;
      this.render();
    };
    seqRow.createDiv({
      cls: "sx-seq-hint",
      text: `已依据 ${this.settings.milestoneFolder} 自动推算，可手动调整`,
    });

    // 比例预设
    const ratioRow = body.createDiv({ cls: "sx-ratio-row" });
    SHARE_RATIOS.forEach((r, i) => {
      const b = ratioRow.createDiv({ cls: "sx-ratio-btn" });
      b.createDiv({ cls: "r-label", text: r.label });
      b.createDiv({ cls: "r-ratio", text: r.ratio });
      b.onClickEvent(() => {
        this.ratioIndex = i;
        this.render();
      });
      this.ratioBtns.push(b);
    });

    // 主题切换 + 随机
    const themeRow = body.createDiv({ cls: "sx-theme-row" });
    SHARE_THEMES.forEach((th) => {
      const b = themeRow.createDiv({ cls: "sx-theme-btn" });
      const sw = b.createEl("span", { cls: "sx-theme-swatch" });
      sw.style.background = th.id === "black-gold" ? "#15130f" : "#efe7d6";
      b.createEl("span", { cls: "sx-theme-name", text: th.name });
      b.onClickEvent(() => {
        this.themeId = th.id;
        this.render();
      });
      this.themeBtns.push(b);
    });
    const dice = themeRow.createDiv({ cls: "sx-theme-btn sx-theme-dice", text: "🎲 随机" });
    dice.onClickEvent(() => {
      this.themeId = null;
      this.seed = Math.floor(Math.random() * 1e9);
      this.render();
    });

    // 预览
    const previewWrap = body.createDiv({ cls: "sx-preview-wrap" });
    this.previewInner = previewWrap.createDiv({ cls: "sx-preview-inner" });

    // 操作按钮
    this.copyBtn = body.createEl("button", { cls: "sx-copy-btn" });
    this.copyBtn.onClickEvent(() => this.copy());
    this.saveBtn = body.createEl("button", { cls: "sx-save-btn", text: "保存到库" });
    this.saveBtn.onClickEvent(() => this.save());

    this.render();
  }

  private currentRatio(): ShareRatio {
    return SHARE_RATIOS[this.ratioIndex];
  }

  private currentTheme(): ShareTheme {
    return this.themeId ? getTheme(this.themeId) : pickTheme(this.seed);
  }

  private render(): void {
    const ratio = this.currentRatio();
    const theme = this.currentTheme();
    const type = getMilestoneType(this.typeId);

    this.previewInner.innerHTML = buildCardHTML({
      type,
      title: this.title,
      subtitle: this.subtitle,
      seq: this.seq,
      theme,
      ratio,
      seed: this.seed,
    });

    const scale = Math.min(1, 420 / ratio.w);
    this.previewInner.style.width = `${ratio.w * scale}px`;
    this.previewInner.style.height = `${ratio.h * scale}px`;
    this.previewInner.style.transform = `scale(${scale})`;
    this.previewInner.style.transformOrigin = "top left";

    this.copyBtn.textContent = `📋 一键复制（${ratio.label} ${ratio.ratio} · ${theme.name}）`;

    this.ratioBtns.forEach((b, i) => b.toggleClass("active", i === this.ratioIndex));
    this.typeBtns.forEach((b, i) => b.toggleClass("active", MILESTONE_TYPES[i].id === this.typeId));
    this.themeBtns.forEach((b, i) =>
      b.toggleClass("active", !this.themeId && i === SHARE_THEMES.indexOf(pickTheme(this.seed))),
    );
    if (this.themeId) {
      this.themeBtns.forEach((b, i) => b.toggleClass("active", SHARE_THEMES[i].id === this.themeId));
    }
  }

  private cardEl(): HTMLElement | null {
    return this.previewInner.querySelector<HTMLElement>(".share-card");
  }

  private async snapshot(): Promise<string | null> {
    const el = this.cardEl();
    if (!el) return null;
    const ratio = this.currentRatio();
    const theme = this.currentTheme();
    return toPng(el, {
      width: ratio.w,
      height: ratio.h,
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: theme.dark ? "#0f1113" : "#F5F5DC",
    });
  }

  private async copy(): Promise<void> {
    this.copyBtn.disabled = true;
    const old = this.copyBtn.textContent;
    this.copyBtn.textContent = "生成中…";
    try {
      const dataUrl = await this.snapshot();
      if (!dataUrl) throw new Error("未找到分享卡元素");
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      new Notice("已复制到剪贴板，去分享吧 ✨");
    } catch (e) {
      console.error("[cirast-checkin] copy failed", e);
      new Notice("复制失败：" + (e instanceof Error ? e.message : "未知错误"));
    } finally {
      this.copyBtn.disabled = false;
      this.copyBtn.textContent = old;
    }
  }

  private async save(): Promise<void> {
    this.saveBtn.disabled = true;
    const old = this.saveBtn.textContent;
    this.saveBtn.textContent = "导出中…";
    try {
      const dataUrl = await this.snapshot();
      if (!dataUrl) throw new Error("未找到分享卡元素");
      const base64 = dataUrl.split(",")[1];
      const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const ab = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength) as ArrayBuffer;
      const base = this.settings.exportFolder.replace(/\/+$/, "");

      // 确保导出目录存在
      if (!this.app.vault.getAbstractFileByPath(base)) {
        try {
          await this.app.vault.createFolder(base);
        } catch {
          /* 已存在则忽略 */
        }
      }

      const n = new Date();
      const stamp = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
      const path = `${base}/${stamp}-milestone-${this.seq}.png`;
      await this.app.vault.createBinary(path, ab);
      new Notice(`已保存到 ${path}`);
    } catch (e) {
      console.error("[cirast-checkin] save failed", e);
      new Notice("保存失败：" + (e instanceof Error ? e.message : "未知错误"));
    } finally {
      this.saveBtn.disabled = false;
      this.saveBtn.textContent = old;
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
