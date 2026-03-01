# tsinghua-dyqy

清华大学“滇羽奇缘”生态调研社会实践支队网站（React + Vite + TypeScript）。

当前版本采用博客式多页面导航（非单页滚动），更接近原 Jekyll 站点的阅读体验。

## 项目目标

- 参考原 `tsinghua_birdisland.github.io` 的信息架构
- 重构为“四大总栏”：物种图鉴、数据记录平台、成果展示、支队与联系
- 通过 iNaturalist API 实时读取项目数据，作为前端展示后端
- 主题色从“天空蓝 + 草原绿”切换到“羽毛橙 + 森林绿”

## 页面结构

- `/` 首页
- `/species-atlas` 物种图鉴（自动生成物种树）
- `/data-platform` 数据记录平台（iNaturalist API）
- `/showcase` 成果展示（历年资料归档）
- `/team` 支队与联系（支队传承 + 联系我们）

## 数据来源

- iNaturalist 项目页：
  https://www.inaturalist.org/observations?project_id=bfbdd5b3-26b5-4060-96c8-52a7680325dc&verifiable=any&place_id=any
- 当前使用项目 ID：`bfbdd5b3-26b5-4060-96c8-52a7680325dc`
- API 域名：`https://api.inaturalist.org/v1`

## 本地运行

```bash
npm install
npm run dev
```

## 物种树生成

```bash
npm run generate:species-tree
```

- 默认从 `project_id=bfbdd5b3-26b5-4060-96c8-52a7680325dc` 拉取全部 `species_counts` 与分类信息。
- 生成文件：`public/data/species-tree.json`。

## 鸟塘数据清洗与 iNat 归入

### 1) 清洗鸟塘点位表

```bash
npm run clean:pond-sites
```

- 默认输入：`2023-2026鸟塘信息.xlsx`
- 默认输出：
  - `public/data/ponds/pond-sites.json`（点位主数据，保留缺失坐标与坐标历史）
  - `public/data/ponds/pond-record-space.json`（每个点位预留展示记录空间）

### 2) 将 iNat 观察按 50m 归入鸟塘

```bash
npm run assign:pond-observations
```

- 默认参数：`project_id=bfbdd5b3-26b5-4060-96c8-52a7680325dc`，半径 `50m`
- 默认输出：`public/data/ponds/inat-observations-by-pond-50m.json`
- 归入规则：每条观察按“50m 内最近点位”归入；超出半径保留在 `unassigned`

### 3) 未来上传手工记录的建议落点

- 在 `public/data/ponds/pond-record-space.json` 的对应 `pondId` 下补充：
  - `manualSpeciesCounts`
  - `surveyEvents`
  - `notes`
  - `attachments`

## 构建

```bash
npm run build
npm run preview
```

## GitHub Pages 部署说明

- `vite.config.ts` 已配置 `base: '/tsinghua-dyqy/'`
- 若仓库名变化，需要同步修改 `base`。
- 已提供工作流：`.github/workflows/deploy.yml`。
- GitHub 仓库 Settings → Pages 请设置为 `Build and deployment: GitHub Actions`。

## 核心目录

```text
src/
  App.tsx             # 路由入口
  App.css             # 博客式页面样式
  components/
    SiteLayout.tsx    # 顶部导航 + 页面框架
  pages/
    HomePage.tsx
    SpeciesAtlasPage.tsx
    SpeciesRecordsPage.tsx
    ReportsPage.tsx
    TeamContactPage.tsx
  config.ts           # 项目常量（名称、iNat 项目 ID/链接）
  services/
    inat.ts           # iNaturalist API 请求与数据映射
scripts/
  generate_species_tree.mjs
```
