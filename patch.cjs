const fs = require('fs');
const path = require('path');
const file = './src/pages/SpeciesRecordsPage.tsx';

let content = fs.readFileSync(file, 'utf8');

// replace slice
content = content.replace(/manualSpecies: pond\.manualSpeciesCounts\.slice\(0, 5\)/, 'manualSpecies: pond.manualSpeciesCounts');
content = content.replace(/inatSpecies: pond\.inatObservations\.slice\(0, 5\)/, 'inatSpecies: pond.inatObservations');

// introduce PondCard Component
const pondCardSrc = `
function PondCard({ pond }: { pond: any }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <article className="record-card">
      <div className="record-content">
        <button className="accordion-btn" onClick={() => setIsOpen(!isOpen)}>
          <div style={{ textAlign: 'left' }}>
            {pond.pondId} (村落：{pond.villages.join('、')} / 年份：{pond.years.join(', ')})
            <div style={{ fontWeight: 'normal', color: '#666', fontSize: '0.85em', marginTop: 4 }}>
              人工记录：{pond.manualCount} 条 · iNat 归并：{pond.inatCount} 条
            </div>
          </div>
          <span className={\`accordion-icon \${isOpen ? 'open' : ''}\`}>▼</span>
        </button>
        {isOpen && (
          <div className="accordion-content">
            {pond.manualSpecies.length > 0 && (
              <div className="record-list">
                <small>全部人工记录：</small>
                <ul className="species-list">
                  {pond.manualSpecies.map((item: any, index: number) => (
                    <li key={\`\${pond.pondId}-manual-\${index}\`}>
                      <div>
                        <strong>{item.speciesName}</strong>
                        <span>{item.year}</span>
                      </div>
                      <b>{item.count}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pond.inatSpecies.length > 0 && (
              <div className="record-list" style={{ marginTop: 12 }}>
                <small>全部 iNat 归并记录：</small>
                <ul className="species-list">
                  {pond.inatSpecies.map((item: any) => (
                    <li key={item.observationId}>
                      <div>
                        <strong>{item.speciesName}</strong>
                        <span>{item.commonName || '暂无中文名'}</span>
                      </div>
                      <b>{item.userLogin}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pond.manualSpecies.length === 0 && pond.inatSpecies.length === 0 && (
              <p>暂无记录</p>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export function SpeciesRecordsPage() {`;

content = content.replace("export function SpeciesRecordsPage() {", pondCardSrc);

const oldRenderLoop = `{pondCards.map((pond) => (
              <article className="record-card" key={pond.pondId}>
                <div className="record-content">
                  <h4>{pond.pondId}</h4>
                  <p>
                    村落：{pond.villages.join('、')} · 年份：{pond.years.join(', ')}
                  </p>
                  <p>
                    人工记录：{pond.manualCount} 条 · iNat 归并：{pond.inatCount} 条
                  </p>

                  {pond.manualSpecies.length > 0 && (
                    <div className="record-list">
                      <small>人工记录示例：</small>
                      <ul className="species-list">
                        {pond.manualSpecies.map((item, index) => (
                          <li key={\`\${pond.pondId}-manual-\${index}\`}>
                            <div>
                              <strong>{item.speciesName}</strong>
                              <span>{item.year}</span>
                            </div>
                            <b>{item.count}</b>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pond.inatSpecies.length > 0 && (
                    <div className="record-list">
                      <small>iNat 记录示例：</small>
                      <ul className="species-list">
                        {pond.inatSpecies.map((item) => (
                          <li key={item.observationId}>
                            <div>
                              <strong>{item.speciesName}</strong>
                              <span>{item.commonName || '暂无中文名'}</span>
                            </div>
                            <b>{item.userLogin}</b>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            ))}`;

const newRenderLoop = `{pondCards.map((pond) => <PondCard key={pond.pondId} pond={pond} />)}`;

content = content.replace(oldRenderLoop, newRenderLoop);

fs.writeFileSync(file, content);
