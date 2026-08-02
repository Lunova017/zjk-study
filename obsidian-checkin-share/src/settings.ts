/** 插件设置 */
export interface CirastSettings {
  /** 里程碑根路径（vault 内相对路径）。累计里程碑数 = 该目录下的笔记数（排除 index）。 */
  milestoneFolder: string;
  /** 里程碑图「保存到库」的目标目录（vault 内相对路径） */
  exportFolder: string;
}

export const DEFAULT_SETTINGS: CirastSettings = {
  milestoneFolder: "content/04-循星",
  exportFolder: "attachments/pulses",
};
