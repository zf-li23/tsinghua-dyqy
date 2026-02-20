const timeline = [
  { date: '2025.11', text: '实践选题与立项：聚焦云南盈江鸟类生态与乡村经济互动。' },
  { date: '2025.12', text: '完成背景文献梳理，制定样线调查、访谈与数据管理方案。' },
  { date: '2026.01', text: '开展实地实践，记录鸟类、昆虫、植物等多类群观察。' },
  { date: '2026.02+', text: '整理成果并持续运营网站，形成可复用的生态调研资料库。' },
]

export function AboutPage() {
  return (
    <section className="card page-article">
      <p className="kicker">支队传承</p>
      <h2>从“鸟岛”经验到“滇羽”方法</h2>
      <p>
        “滇羽奇缘”在组织方式上延续了“鸟岛与少年”实践支队长期积累的经验：
        以科学记录为基础，以公共传播为桥梁，以青年行动连接生态保护与社会协作。
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

      <h3>团队分工</h3>
      <p>
        支队目前按“物种记录组 / 社会访谈组 / 影像传播组 / 数据整理组”协同推进，
        确保同一实践行动可以同时产出科学记录、访谈素材和传播内容。
      </p>
    </section>
  )
}
