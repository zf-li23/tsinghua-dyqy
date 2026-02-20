import { DYQY_INAT_PROJECT_URL } from '../config'

export function ContactPage() {
  return (
    <section className="card page-article">
      <p className="kicker">联系我们</p>
      <h2>协作与内容共建</h2>
      <p>
        欢迎实践队员、校内同学和生态爱好者参与内容共建。你可以提交观察记录、实践故事、
        访谈素材或科普内容建议。
      </p>

      <h3>参与方式</h3>
      <ul>
        <li>物种记录：优先通过 iNaturalist 项目提交观察，并完善时间地点信息。</li>
        <li>图文投稿：提交“日期 + 地点 + 主题 + 200字摘要 + 图片说明”。</li>
        <li>联合活动：欢迎中学社团、公益组织联系开展生态观察与科普实践。</li>
      </ul>

      <h3>平台入口</h3>
      <p>
        <a href={DYQY_INAT_PROJECT_URL} target="_blank" rel="noreferrer" className="inline-link">
          iNaturalist · 滇羽奇缘2026
        </a>
      </p>
    </section>
  )
}
