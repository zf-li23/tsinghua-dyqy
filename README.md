# tsinghua-dyqy

清华大学“滇羽奇缘”生态调研社会实践支队网站（React + Vite + TypeScript）。

当前版本采用博客式多页面导航（非单页滚动），更接近原 Jekyll 站点的阅读体验。

## 项目目标

- 参考原 `tsinghua_birdisland.github.io` 的信息架构
- 将“物种图鉴”升级为“物种记录”
- 通过 iNaturalist API 实时读取项目数据，作为前端展示后端
- 主题色从“天空蓝 + 草原绿”切换到“羽毛橙 + 森林绿”

## 页面结构

- `/` 首页
- `/about` 支队传承
- `/species-records` 物种记录（iNaturalist API）
- `/reports` 调研成果
- `/journey` 行程纪实
- `/contact` 联系我们

## 数据来源

- iNaturalist 项目页：
  https://www.inaturalist.org/projects/%E6%BB%87%E7%BE%BD%E5%A5%87%E7%BC%982026
- 当前使用项目 ID：`273065`
- API 域名：`https://api.inaturalist.org/v1`

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## GitHub Pages 部署说明

- `vite.config.ts` 已配置 `base: '/tsinghua-dyqy/'`
- 若仓库名变化，需要同步修改 `base`。
- 推荐使用 GitHub Actions 将 `dist/` 发布到 Pages。

## 核心目录

```text
src/
  App.tsx             # 路由入口
  App.css             # 博客式页面样式
  components/
    SiteLayout.tsx    # 顶部导航 + 页面框架
  pages/
    HomePage.tsx
    AboutPage.tsx
    SpeciesRecordsPage.tsx
    ReportsPage.tsx
    JourneyPage.tsx
    ContactPage.tsx
  config.ts           # 项目常量（名称、iNat 项目 ID/链接）
  services/
    inat.ts           # iNaturalist API 请求与数据映射
```
