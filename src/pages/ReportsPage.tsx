import { yearlyArchives } from '../data/yearlyArchives'

const imagePattern = /\.(png|jpg|jpeg|gif|webp)$/i

const toAssetUrl = (filePath: string): string => {
  const encoded = filePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return `${import.meta.env.BASE_URL}${encoded}`
}

const getFileName = (filePath: string): string => {
  const parts = filePath.split('/')
  return parts[parts.length - 1]
}

const getPreview = (files: string[]): string | null => {
  const matched = files.find((file) => imagePattern.test(file))
  return matched ? toAssetUrl(matched) : null
}

export function ReportsPage() {
  return (
    <section className="card page-article">
      <p className="kicker">成果展示</p>
      <h2>历年调研成果与资料归档</h2>
      <p>
        本栏目整合“学术报告、成果总结、摄影作品、文创产品”四大类资料，
        以年度档案方式集中展示实践产出，便于传播、检索与跨届传承。
      </p>

      <div className="archive-years">
        {yearlyArchives.map((yearItem) => (
          <section key={yearItem.year} className="archive-year">
            <header>
              <span className="tag">年度档案</span>
              <h3>{yearItem.year} 年</h3>
            </header>

            <div className="archive-grid">
              {yearItem.categories.map((category) => {
                const preview = getPreview(category.files)

                return (
                  <article key={`${yearItem.year}-${category.key}`} className="archive-card">
                    <h4>{category.title}</h4>
                    <p>{category.description}</p>

                    {preview && (
                      <img
                        src={preview}
                        alt={`${yearItem.year} ${category.title} 预览`}
                        className="archive-preview"
                        loading="lazy"
                      />
                    )}

                    <ul className="archive-file-list">
                      {category.files.map((file) => (
                        <li key={file}>
                          <a href={toAssetUrl(file)} target="_blank" rel="noreferrer">
                            {getFileName(file)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
