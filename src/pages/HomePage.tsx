import { Link } from 'react-router-dom'
import { DYQY_INAT_PROJECT_URL } from '../config'

const featuredPosts = [
  {
    title: '从“鸟岛与少年”到“滇羽奇缘”',
    excerpt: '延续生态实践的组织方法、知识积累与叙事传统，在云南建立新的野外记录样本。',
    to: '/about',
  },
  {
    title: '物种记录系统上线',
    excerpt: '以 iNaturalist 项目为数据后端，展示最近观察、高频物种与实践现场的记录逻辑。',
    to: '/species-records',
  },
  {
    title: '调研与传播并重',
    excerpt: '围绕鸟类生态、乡村产业与社区访谈，形成研究报告、纪实内容与公众科普材料。',
    to: '/reports',
  },
]

const updates = [
  '完成盈江区域重点样点踏查与定位，形成每日观察路线日志。',
  '对接地方保护站与村社访谈，补充物种记录背景信息。',
  '建立实践影像素材库，为后续纪录短片与图文专题做准备。',
  '统一记录模板：物种、地点、时间、行为、栖息地与人为干扰项。',
]

export function HomePage() {
  return (
    <>
      <section className="hero card">
        <p className="kicker">滇羽奇缘 · 官方网站</p>
        <h2>博客式多页面档案，持续更新实践记录</h2>
        <p>
          本站采用接近 Jekyll 的栏目化阅读体验：每个栏目独立页面，支持清晰切换和长期维护。
          核心物种数据与 iNaturalist 项目同步，兼顾叙事与科学记录。
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
          <Link to="/journey" className="btn-link">
            查看行程纪实
          </Link>
        </aside>
      </section>
    </>
  )
}
