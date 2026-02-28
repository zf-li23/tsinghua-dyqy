import { Link } from 'react-router-dom'
import { DYQY_INAT_PROJECT_URL } from '../config'

const featuredPosts = [
  {
    title: '物种图鉴：自动汇总项目分类树',
    excerpt: '基于 iNaturalist 项目全量记录自动生成分类树，展示科属种层级结构与观察量。',
    to: '/species-atlas',
  },
  {
    title: '数据记录平台',
    excerpt: '以 iNaturalist 项目为数据后端，展示近期观察、高频物种和地图点位。',
    to: '/data-platform',
  },
  {
    title: '成果展示与团队协作',
    excerpt: '沉淀历年调研成果与资料归档，并集中展示支队传承和对外协作入口。',
    to: '/showcase',
  },
]

const updates = [
  '新增“物种图鉴”栏目，可从项目记录自动更新分类树。',
  '完成盈江区域重点样点踏查与定位，形成每日观察路线日志。',
  '对接地方保护站与村社访谈，补充物种记录背景信息。',
  '建立实践影像素材库，为后续图鉴配图与图文专题做准备。',
]

export function HomePage() {
  return (
    <>
      <section className="hero card">
        <p className="kicker">滇羽奇缘 · 官方网站</p>
        <h2>博客式多页面档案，持续更新实践记录</h2>
        <p>
          本站采用接近 Jekyll 的栏目化阅读体验：围绕“物种图鉴、数据记录平台、成果展示、支队与联系”
          四大主栏独立维护，支持跨届复用。
        </p>
        <p>
          <a href={DYQY_INAT_PROJECT_URL} target="_blank" rel="noreferrer" className="inline-link">
            查看 iNaturalist 项目主页
          </a>
        </p>
      </section>

      <section className="split-grid">
        <article className="card">
          <h3>栏目导览</h3>
          <div className="post-list">
            {featuredPosts.map((post) => (
              <Link key={post.title} to={post.to} className="post-item">
                <h4>{post.title}</h4>
                <p>{post.excerpt}</p>
                <span>进入栏目 →</span>
              </Link>
            ))}
          </div>
        </article>

        <aside className="card sidebar">
          <h3>实践速递</h3>
          <ul>
            {updates.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link to="/team" className="btn-link">
            查看支队与联系
          </Link>
        </aside>
      </section>
    </>
  )
}
