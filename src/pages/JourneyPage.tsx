const diaries = [
  {
    date: '01/18',
    title: '抵达与路线确认',
    text: '完成样线预踏查、记录点位初筛，建立每日观察与素材回传机制。',
  },
  {
    date: '01/20',
    title: '林缘与河谷联合观察',
    text: '同步开展鸟类行为观察和昆虫、植物辅助记录，完善生境描述字段。',
  },
  {
    date: '01/23',
    title: '访谈与观察交叉验证',
    text: '结合地方经验修订重点物种关注清单，形成观察与访谈双轨资料。',
  },
  {
    date: '01/26',
    title: '总结与归档',
    text: '进行数据清洗、照片归档与叙事线整理，为网站长期更新建立模板。',
  },
]

export function JourneyPage() {
  return (
    <section className="card page-article">
      <p className="kicker">行程纪实</p>
      <h2>实践日志与现场故事</h2>
      <p>
        以“日程节点 + 观察重点 + 现场见闻”记录实践全过程，后续会持续补充照片、短视频与访谈摘录。
      </p>

      <div className="timeline">
        {diaries.map((item) => (
          <article key={item.date}>
            <strong>{item.date}</strong>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
