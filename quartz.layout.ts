import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { QuartzComponent } from "./quartz/components/types"

// 空页脚组件：去掉 Quartz 默认品牌行。
// 注意：本文件是 .ts 不能写 JSX，须返回 null as any；
// 且 footer 字段类型是单个组件，不能设成数组 []（会导致页面底部乱码）。
const BlankFooter: QuartzComponent = () => null as any

// 全站共享组件：极简顶栏（站名 + 搜索 + 明暗切换），无侧栏、无页脚品牌行。
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.PageTitle(), Component.Search(), Component.Darkmode()],
  afterBody: [],
  footer: BlankFooter,
}

// 单篇文章页：单栏，正文前显示面包屑 / 标题 / 元信息 / 标签。
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [],
  right: [],
}

// 列表页（标签 / 文件夹索引）：同样单栏。
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [],
  right: [],
}
