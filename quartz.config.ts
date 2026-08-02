import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * 循星台 · Quartz 配置
 * 循星者，吾自命之星也，循轨而行，记录十年求学之路。
 * 设计取向：Derek Sivers 式安静单栏 + Solarized 明暗双主题。
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "循星台",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "zh-CN",
    // 实际域名
    baseUrl: "cirast.pages.dev",
    ignorePatterns: [
      "private",
      "templates",
      ".obsidian",
      "checkin-share",
      "attachments",
    ],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Source Serif 4",
        body: "Source Serif 4",
        code: "JetBrains Mono",
      },
      colors: {
        // Solarized Light
        lightMode: {
          light: "#fdf6e3", // base3 · 纸感底
          lightgray: "#eee8d5", // base2 · 分隔线
          gray: "#93a1a1", // base1 · 弱化文字
          darkgray: "#586e75", // base01 · 正文
          dark: "#073642", // base02 · 标题
          secondary: "#a07d33", // 雅致金 · 链接（清雅暖金，弱化土黄）
          tertiary: "#7a5e23", // 深铜金 · 悬停
          highlight: "rgba(160, 125, 51, 0.13)",
          textHighlight: "#a07d3355",
        },
        // Solarized Dark
        darkMode: {
          light: "#002b36", // base03 · 深空底
          lightgray: "#073642", // base02 · 分隔线
          gray: "#586e75", // base01 · 弱化文字
          darkgray: "#93a1a1", // base1 · 正文
          dark: "#eee8d5", // base2 · 标题
          secondary: "#d9c484", // 雅致金 · 链接（清雅暖金）
          tertiary: "#f0e3a8", // 浅金 · 悬停
          highlight: "rgba(217, 196, 132, 0.18)",
          textHighlight: "#d9c48455",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "solarized-light",
          dark: "solarized-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
