const fs = require('fs');
const file = './src/pages/ReportsPage.tsx';

let content = fs.readFileSync(file, 'utf8');

const oldMap = `            {yearItem.categories.map((category: any) => {
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
            })}`;

const newMap = `            {yearItem.categories.map((category: any) => {
              if (category.key === 'photo') {
                return (
                  <article key={\`\${yearItem.year}-\${category.key}\`} className="archive-card" style={{ gridColumn: '1 / -1' }}>
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
                )
              }

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
            })}`;

content = content.replace(oldMap, newMap);

fs.writeFileSync(file, content);
