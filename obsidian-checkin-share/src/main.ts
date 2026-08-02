import { Plugin, Setting, PluginSettingTab } from "obsidian";
import { ShareModal } from "./shareModal";
import { DEFAULT_SETTINGS, type CirastSettings } from "./settings";

export default class CirastCheckinPlugin extends Plugin {
  settings: CirastSettings;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addRibbonIcon("milestone", "循星台 · 里程碑脉冲", () => this.openShare());
    this.addCommand({
      id: "share-milestone",
      name: "生成里程碑脉冲卡",
      callback: () => this.openShare(),
    });
    this.addSettingTab(new CirastSettingTab(this));
  }

  onunload(): void {
    /* no-op */
  }

  private openShare(): void {
    new ShareModal(this.app, this.settings).open();
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

class CirastSettingTab extends PluginSettingTab {
  plugin: CirastCheckinPlugin;

  constructor(plugin: CirastCheckinPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "循星台 · 里程碑脉冲" });

    new Setting(containerEl)
      .setName("里程碑目录")
      .setDesc(
        "vault 内相对路径。累计里程碑数 = 该目录下的笔记数（排除 index），只在你真正达成时增长（默认 content/04-循星）。",
      )
      .addText((text) =>
        text
          .setPlaceholder("content/04-循星")
          .setValue(this.plugin.settings.milestoneFolder)
          .onChange(async (value) => {
            this.plugin.settings.milestoneFolder = value.trim() || "content/04-循星";
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("导出目录")
      .setDesc("点击「保存到库」时，里程碑图写入该目录（默认 attachments/pulses，为私有本地目录，不发布）。")
      .addText((text) =>
        text
          .setPlaceholder("attachments/pulses")
          .setValue(this.plugin.settings.exportFolder)
          .onChange(async (value) => {
            this.plugin.settings.exportFolder = value.trim() || "attachments/pulses";
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("关于")
      .setDesc(
        "告别每日打卡。这里以「脉冲」为单位记录成果——只有成就 / 决策时才生成一张里程碑卡。节奏由认知决定，不由日历决定。",
      );
  }
}
