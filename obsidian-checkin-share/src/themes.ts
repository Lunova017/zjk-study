/**
 * 分享图 · 主题 / 箴言 / 意象 数据层（从桌面端 shareThemes.ts 移植，纯 TS 无依赖）。
 *
 * 设计哲学：高级感来自克制。
 * - 仅两套主色：米白（暖象牙宣纸）与黑金（曜夜描金）；
 * - 背景摒弃纯色与繁杂装饰：多重柔和光晕营造纵深，叠一层「自设计」极淡图案水印；
 * - 删去一切廉价装饰；金仅作细发丝线与印章点缀，中央巨数字为唯一视觉重心；
 * - 所有随机均由一个 seed 决定，保证「预览」与「导出图片」完全一致。
 */

/** 可复现伪随机：mulberry32，由数值 seed 生成稳定的随机序列 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ShareTheme {
  id: string;
  name: string;
  bg: string;
  /** 细噪点纹理，制造纸张 / 金属的微颗粒质感 */
  bgNoise: string;
  /** 自设计图案水印（data URI SVG），极淡铺底，只作肌理 */
  pattern: string;
  ink: string;
  dim: string;
  faint: string;
  foil: string;
  line: string;
  ringBg: string;
  ringFg: string;
  ringStops: [string, string];
  sealBg: string;
  sealInk: string;
  glow: string;
  dark?: boolean;
}

const NOISE_LIGHT = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
const NOISE_DARK = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * 自设计「星盘 · 北斗」大图案（800×800，单张居中，不平铺）。
 * 由同心刻度环 + 八方放射线 + 北斗七星连线构成，契合「循星台 · 观星」意象。
 */
const COMPASS = (c: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E` +
  `%3Cg fill='none' stroke='${c}' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'%3E` +
  `%3Ccircle cx='400' cy='400' r='394'/%3E` +
  `%3Ccircle cx='400' cy='400' r='372'/%3E` +
  `%3Ccircle cx='400' cy='400' r='336' stroke-dasharray='2 16'/%3E` +
  `%3Ccircle cx='400' cy='400' r='300'/%3E` +
  `%3Ccircle cx='400' cy='400' r='150'/%3E` +
  `%3Cline x1='700' y1='400' x2='772' y2='400'/%3E` +
  `%3Cline x1='612' y1='612' x2='663' y2='663'/%3E` +
  `%3Cline x1='400' y1='700' x2='400' y2='772'/%3E` +
  `%3Cline x1='188' y1='612' x2='137' y2='663'/%3E` +
  `%3Cline x1='100' y1='400' x2='28' y2='400'/%3E` +
  `%3Cline x1='188' y1='188' x2='137' y2='137'/%3E` +
  `%3Cline x1='400' y1='100' x2='400' y2='28'/%3E` +
  `%3Cline x1='612' y1='188' x2='663' y2='137'/%3E` +
  `%3Cpolyline points='250,330 250,430 330,480 410,440 250,330'/%3E` +
  `%3Cpolyline points='410,440 490,470 555,530 610,560'/%3E` +
  `%3C/g%3E` +
  `%3Cg fill='${c}' stroke='none'%3E` +
  `%3Ccircle cx='250' cy='330' r='7'/%3E%3Ccircle cx='250' cy='430' r='7'/%3E` +
  `%3Ccircle cx='330' cy='480' r='7'/%3E%3Ccircle cx='410' cy='440' r='7'/%3E` +
  `%3Ccircle cx='490' cy='470' r='7'/%3E%3Ccircle cx='555' cy='530' r='7'/%3E` +
  `%3Ccircle cx='610' cy='560' r='7'/%3E` +
  `%3C/g%3E%3C/svg%3E")`;

/** 米白主色系：金褐描边的星盘大图 */
const PATTERN_CREAM = COMPASS("%23b9a06a");
/** 黑金主色系：暖金描边的星盘大图 */
const PATTERN_GOLD = COMPASS("%23c8a45a");

export const SHARE_THEMES: ShareTheme[] = [
  {
    id: "cream",
    name: "米白",
    bg:
      "radial-gradient(1100px 820px at 50% -12%, rgba(255,255,255,0.55), transparent 55%)," +
      "radial-gradient(900px 700px at 86% 112%, rgba(196,176,140,0.16), transparent 55%)," +
      "linear-gradient(160deg, #f6f0e3 0%, #efe7d6 55%, #e8dec9 100%)",
    bgNoise: NOISE_LIGHT,
    pattern: PATTERN_CREAM,
    ink: "#463d31",
    dim: "#8a7f6b",
    faint: "#b3a892",
    foil: "linear-gradient(180deg, #c2a063 0%, #a3854a 52%, #8c6f37 100%)",
    line: "rgba(150,128,90,0.30)",
    ringBg: "rgba(150,128,90,0.14)",
    ringFg: "url(#scRing)",
    ringStops: ["#c2a063", "#8c6f37"],
    sealBg: "#b08a3c",
    sealInk: "#f6f0e3",
    glow: "rgba(210,186,144,0.20)",
  },
  {
    id: "black-gold",
    name: "黑金",
    dark: true,
    bg:
      "radial-gradient(1100px 820px at 50% -8%, rgba(222,186,110,0.10), transparent 55%)," +
      "radial-gradient(900px 700px at 82% 112%, rgba(150,116,54,0.18), transparent 55%)," +
      "linear-gradient(160deg, #1c1a15 0%, #131210 55%, #0b0a08 100%)",
    bgNoise: NOISE_DARK,
    pattern: PATTERN_GOLD,
    ink: "#f1e9d7",
    dim: "#b3a584",
    faint: "#6c6450",
    foil: "linear-gradient(180deg, #e7cf90 0%, #c8a45a 52%, #a9853c 100%)",
    line: "rgba(200,165,95,0.34)",
    ringBg: "rgba(200,165,95,0.16)",
    ringFg: "url(#scRing)",
    ringStops: ["#e7cf90", "#a9853c"],
    sealBg: "#b08a3c",
    sealInk: "#16140f",
    glow: "rgba(206,168,92,0.20)",
  },
];

export function getTheme(id: string): ShareTheme {
  return SHARE_THEMES.find((t) => t.id === id) ?? SHARE_THEMES[0];
}

/**
 * 里程碑类型：对应「值得动笔」的四种脉冲时刻。
 * 只有跨过这四种认知阈值才生成脉冲，杜绝日历驱动的义务感。
 */
export interface MilestoneType {
  id: string;
  cn: string;
  en: string;
  glyph: string;
}

export const MILESTONE_TYPES: MilestoneType[] = [
  { id: "achievement", cn: "成就", en: "ACHIEVEMENT", glyph: "✦" },
  { id: "decision", cn: "决策", en: "DECISION", glyph: "✦" },
];

export function getMilestoneType(id: string): MilestoneType {
  return MILESTONE_TYPES.find((t) => t.id === id) ?? MILESTONE_TYPES[0];
}

/** 箴言池（里程碑主题，随机抽取一条）——由认知而非日历丈量进度 */
const QUOTE_POOL: string[] = [
  "每一次卡住，都是理解在敲门。",
  "想通的那一刻，胜过一百天的假装努力。",
  "真正的进度，由认知而非日历丈量。",
  "不求日日在场，但求步步为营。",
  "把难题啃碎，才是通往内核的路。",
  "代码不会说谎，跑通即真理。",
  "所谓成长，是把「不懂」一个个变成「原来如此」。",
  "读薄一本书，胜过翻烂十本。",
  "Debug 到深处，方见系统真容。",
  "十年一纪，功不唐捐。",
  "循星东行，一步一星光。",
  "慢一点，但每一步都算数。",
  "山高路远，行则将至。",
  "不疾不徐，自有山河。",
];

/**
 * 时令意象：按「天文节气」精确匹配（节气日期由天文算法动态计算，东八区显示），
 * 覆盖全年 24 节气；无论哪天打开，显示的时令都与当天真实节气相符。
 */
const TERM_OFFSET_MIN = [
  0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693,
  263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758,
];
const SOLAR_TERMS: string[] = [
  "小寒 · 梅信初传 · 静待春归",
  "大寒 · 岁末将尽 · 蓄势待发",
  "立春 · 循星东行 · 万物始生",
  "雨水 · 好雨知时 · 润物无声",
  "惊蛰 · 始雷乍动 · 万物苏醒",
  "春分 · 昼夜均长 · 暖意初盈",
  "清明 · 风至天清 · 草木萌发",
  "谷雨 · 雨润百谷 · 滋长无声",
  "立夏 · 槐荫初密 · 万物并秀",
  "小满 · 未满即是 · 小得盈满",
  "芒种 · 时雨及芒 · 忙于穑事",
  "夏至 · 日永阳极 · 夜短昼长",
  "小暑 · 温风始至 · 心静自凉",
  "大暑 · 暑气方退 · 心静自然",
  "立秋 · 禾谷待熟 · 凉风渐起",
  "处暑 · 暑气渐消 · 秋意初生",
  "白露 · 月相渐盈 · 露白阶清",
  "秋分 · 丹桂飘香 · 昼夜再均",
  "寒露 · 露凝为白 · 菊有黄华",
  "霜降 · 霜未全降 · 秋色尽染",
  "立冬 · 初寒乍临 · 万物收藏",
  "小雪 · 轻盈初落 · 天地清寂",
  "大雪 · 雪覆千山 · 围炉向暖",
  "冬至 · 一阳来复 · 星河低垂",
];

const TERM_BASE_UTC = Date.UTC(1900, 0, 6, 2, 5); // 节气计算基准（1900-01-06 02:05）
const TROPICAL_YEAR_MS = 31556925974.7; // 回归年毫秒数

/** 计算指定年份第 n 个节气（n: 0=小寒 … 23=冬至）的北京时间 Date */
function termBeijingDate(year: number, n: number): Date {
  const ms = TERM_BASE_UTC + TROPICAL_YEAR_MS * (year - 1900) + TERM_OFFSET_MIN[n] * 60000;
  return new Date(ms + 8 * 3600 * 1000); // 换算为东八区显示
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

export function pickQuote(rng: () => number): string {
  return pick(rng, QUOTE_POOL);
}

/** 按当前日期确定性地取时令意象（天文节气精确匹配，绝不随机） */
export function getImageryByDate(date: Date): string {
  const year = date.getFullYear();
  const today = (date.getMonth() + 1) * 100 + date.getDate();
  let chosen = SOLAR_TERMS[SOLAR_TERMS.length - 1];
  for (let i = 0; i < SOLAR_TERMS.length; i++) {
    const bj = termBeijingDate(year, i);
    const md = (bj.getUTCMonth() + 1) * 100 + bj.getUTCDate();
    if (today >= md) chosen = SOLAR_TERMS[i];
    else break;
  }
  return chosen;
}

/** 由 seed 选定主题（可复现的随机） */
export function pickTheme(seed: number): ShareTheme {
  return SHARE_THEMES[seed % SHARE_THEMES.length];
}

/** 社交平台分享比例预设（严格适配传播场景） */
export interface ShareRatio {
  id: "wechat" | "weibo" | "xhs";
  label: string;
  ratio: string;
  w: number;
  h: number;
}

export const SHARE_RATIOS: ShareRatio[] = [
  { id: "wechat", label: "朋友圈", ratio: "1:1", w: 1080, h: 1080 },
  { id: "weibo", label: "微博", ratio: "9:16", w: 1080, h: 1920 },
  { id: "xhs", label: "小红书", ratio: "3:4", w: 1080, h: 1440 },
];
