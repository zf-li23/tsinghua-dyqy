const reportCards = [
  {
    title: '盈江典型生境鸟类多样性观察报告（草案）',
    summary:
      '结合样线记录与定点观察，梳理河谷、林缘、农田交错区的优势类群变化，形成实践期初步统计。',
    tag: '生态调研',
  },
  {
    title: '乡村经济与生态友好型产业访谈纪要',
    summary:
      '通过村社与基层工作者访谈，记录农文旅实践、生态产品价值转化与地方治理协同机制。',
    tag: '社会调研',
  },
  {
    title: '公众传播素材包：鸟类识别与观察方法',
    summary:
      '输出图文讲解框架，介绍常见记录字段、观察伦理与非干扰式拍摄建议，面向中学生科普活动。',
    tag: '科普传播',
  },
]

export function ReportsPage() {
  return (
    <section className="card page-article">
      <p className="kicker">调研成果</p>
      <h2>从实地数据到可传播成果</h2>
      <p>
        本栏目汇总支队在实践周期内形成的研究报告、访谈纪要与传播材料。后续将按“完整版 PDF +
        网页摘要”方式持续补充。
      </p>

      <div className="post-list">
        {reportCards.map((card) => (
          <article className="post-item static" key={card.title}>
            <span className="tag">{card.tag}</span>
            <h3>{card.title}</h3>
            <p>{card.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
