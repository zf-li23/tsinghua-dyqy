const timeline = [
  { date: '2025.11', text: '实践选题与立项：聚焦云南盈江鸟类生态与乡村经济互动。' },
  { date: '2025.12', text: '完成背景文献梳理，制定样线调查、访谈与数据管理方案。' },
  { date: '2026.01', text: '开展实地实践，记录鸟类、昆虫、植物等多类群观察。' },
  { date: '2026.02+', text: '整理成果并持续运营网站，形成可复用的生态调研资料库。' },
]

export function TeamContactPage() {
  return (
    <section className="card page-article">
      <p className="kicker">支队与联系</p>
      <h2>支队传承、团队协作与对外共建入口</h2>
      <p>
        “滇羽奇缘”延续“鸟岛与少年”的组织方法与知识积累：
        以科学记录为基础，以公共传播为桥梁，推动青年生态行动与社区协作。
      </p>

      <h3>我们的使命</h3>
      <ul>
        <li>构建可信、可持续的实践数据链，支持后续研究与科普使用。</li>
        <li>记录人与自然的互动现场，呈现生态议题的社会维度。</li>
        <li>培养具备实地调查能力与传播能力的青年生态行动者。</li>
      </ul>

      <h3>实践时间轴</h3>
      <div className="timeline">
        {timeline.map((item) => (
          <article key={item.date}>
            <strong>{item.date}</strong>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      <h3>联系我们与参与方式</h3>
      <ul>
        <li>物种记录：优先通过 iNaturalist 项目提交观察，并完善时间地点信息。</li>
        <li>图文投稿：提交“日期 + 地点 + 主题 + 200 字摘要 + 图片说明”。</li>
        <li>联合活动：欢迎中学社团、公益组织联系开展生态观察与科普实践。</li>
      </ul>
    </section>
  )
}
