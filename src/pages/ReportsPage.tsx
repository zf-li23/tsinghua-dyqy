import { useState } from 'react'
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


function YearBlock({ yearItem }: { yearItem: any }) {
  const [isOpen, setIsOpen] = useState(false); // Default to open or closed? Let's say false except for recent. Or just false.
  
  return (
    <section className="archive-year">
      <button className="accordion-btn" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <span className="tag" style={{ marginRight: 8 }}>年度档案</span>
          <h3 style={{ display: 'inline', margin: 0 }}>{yearItem.year} 年</h3>
        </div>
        <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="accordion-content">
          <div className="archive-grid">
            {yearItem.categories.filter((c: any) => c.key !== 'photo').map((category: any) => {
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
                    {category.files.map((file: string) => (
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
            
            {yearItem.categories.filter((c: any) => c.key === 'photo').map((category: any) => (
              <article key={`${yearItem.year}-${category.key}`} className="archive-card" style={{ gridColumn: '1 / -1' }}>
                <h4>{category.title}</h4>
                <p>{category.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  {category.files.map((file: string) => (
                    <div key={file} style={{ display: 'flex', flexDirection: 'column' }}>
                      <a href={toAssetUrl(file)} target="_blank" rel="noreferrer" style={{ display: 'block', aspectRatio: '4/3', overflow: 'hidden', borderRadius: '8px', marginBottom: '8px', background: '#f5f5f5' }}>
                        {imagePattern.test(file) ? (
                          <img
                            src={toAssetUrl(file)}
                            alt={getFileName(file)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>无法预览</div>
                        )}
                      </a>
                      <small style={{ color: '#444', wordBreak: 'break-word', lineHeight: 1.2 }}>{getFileName(file)}</small>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
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
          <YearBlock key={yearItem.year} yearItem={yearItem} />
        ))}
      </div>
    </section>
  )
}
