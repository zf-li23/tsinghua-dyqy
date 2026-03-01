const fs = require('fs');
const file = './src/pages/ReportsPage.tsx';

let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { useState }')) {
  content = content.replace("import { yearlyArchives }", "import { useState } from 'react'\nimport { yearlyArchives }");
}

const yearBlockSrc = `
function YearBlock({ yearItem }: { yearItem: any }) {
  const [isOpen, setIsOpen] = useState(true); // Default to open or closed? Let's say false except for recent. Or just false.
  
  return (
    <section className="archive-year">
      <button className="accordion-btn" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <span className="tag" style={{ marginRight: 8 }}>年度档案</span>
          <h3 style={{ display: 'inline', margin: 0 }}>{yearItem.year} 年</h3>
        </div>
        <span className={\`accordion-icon \${isOpen ? 'open' : ''}\`}>▼</span>
      </button>

      {isOpen && (
        <div className="accordion-content">
          <div className="archive-grid">
            {yearItem.categories.map((category: any) => {
              const preview = getPreview(category.files)

              return (
                <article key={\`\${yearItem.year}-\${category.key}\`} className="archive-card">
                  <h4>{category.title}</h4>
                  <p>{category.description}</p>

                  {preview && (
                    <img
                      src={preview}
                      alt={\`\${yearItem.year} \${category.title} 预览\`}
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
          </div>
        </div>
      )}
    </section>
  )
}

export function ReportsPage() {`;

content = content.replace("export function ReportsPage() {", yearBlockSrc);

const oldMap = `        {yearlyArchives.map((yearItem) => (
          <section key={yearItem.year} className="archive-year">
            <header>
              <span className="tag">年度档案</span>
              <h3>{yearItem.year} 年</h3>
            </header>

            <div className="archive-grid">
              {yearItem.categories.map((category) => {
                const preview = getPreview(category.files)

                return (
                  <article key={\`\${yearItem.year}-\${category.key}\`} className="archive-card">
                    <h4>{category.title}</h4>
                    <p>{category.description}</p>

                    {preview && (
                      <img
                        src={preview}
                        alt={\`\${yearItem.year} \${category.title} 预览\`}
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
        ))}`;

const newMap = `        {yearlyArchives.map((yearItem) => (
          <YearBlock key={yearItem.year} yearItem={yearItem} />
        ))}`;

content = content.replace(oldMap, newMap);

fs.writeFileSync(file, content);
