import { useEffect, useMemo, useState } from 'react'
import {
  DYQY_INAT_AREAS,
  DYQY_INAT_PROJECT_ID,
  DYQY_INAT_PROJECT_URL,
  type InatAreaBounds,
} from '../config'
import { ObservationMap } from '../components/ObservationMap'
import {
  fetchObservationsByBounds,
  fetchProjectOverview,
  fetchRecentObservations,
  fetchSpeciesCounts,
  formatObservedDate,
  type InatObservation,
  type InatProjectOverview,
  type InatSpeciesCount,
} from '../services/inat'

export function SpeciesRecordsPage() {
  const [activeArea, setActiveArea] = useState<InatAreaBounds>(DYQY_INAT_AREAS[0])
  const [project, setProject] = useState<InatProjectOverview | null>(null)
  const [observations, setObservations] = useState<InatObservation[]>([])
  const [mapObservations, setMapObservations] = useState<InatObservation[]>([])
  const [speciesCounts, setSpeciesCounts] = useState<InatSpeciesCount[]>([])
  const [loading, setLoading] = useState(true)
  const [mapLoading, setMapLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [projectData, observationData, speciesData] = await Promise.all([
          fetchProjectOverview(DYQY_INAT_PROJECT_ID),
          fetchRecentObservations(DYQY_INAT_PROJECT_ID),
          fetchSpeciesCounts(DYQY_INAT_PROJECT_ID),
        ])
        setProject(projectData)
        setObservations(observationData)
        setSpeciesCounts(speciesData)
      } catch {
        setError('iNaturalist 数据加载失败，请稍后刷新重试。')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadMapData = async () => {
      setMapLoading(true)
      setMapError(null)
      try {
        const data = await fetchObservationsByBounds(DYQY_INAT_PROJECT_ID, activeArea)
        setMapObservations(data)
      } catch {
        setMapError('地图观察数据加载失败，请稍后刷新重试。')
      } finally {
        setMapLoading(false)
      }
    }

    loadMapData()
  }, [activeArea])

  const stats = useMemo(
    () => [
      { label: '累计观察', value: project?.observationsCount ?? '—' },
      { label: '记录物种', value: project?.speciesCount ?? '—' },
      { label: '参与观察者', value: project?.observersCount ?? '—' },
      { label: '项目编号', value: DYQY_INAT_PROJECT_ID },
    ],
    [project],
  )

  return (
    <>
      <section className="card page-article">
        <p className="kicker">数据记录平台</p>
        <h2>基于 iNaturalist 的实时观察数据平台</h2>
        <p>
          本栏目聚焦“记录与追踪”：通过 iNaturalist Collect Project 同步近期观察、
          高频物种统计与范围点位，为后续图鉴和成果展示提供结构化数据。
        </p>
        <p>
          <a href={DYQY_INAT_PROJECT_URL} target="_blank" rel="noreferrer" className="inline-link">
            在 iNaturalist 查看完整项目
          </a>
        </p>
      </section>

      <section className="stats-grid">
        {stats.map((item) => (
          <article className="stat-tile" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </section>

      <section className="card page-article">
        <h3>观察地图</h3>
        <p>可切换查看石梯村与百花岭范围内的全部 iNaturalist 观察点位。</p>

        <div className="area-switcher" role="tablist" aria-label="观察范围选择">
          {DYQY_INAT_AREAS.map((area) => (
            <button
              key={area.key}
              type="button"
              className={area.key === activeArea.key ? 'active' : ''}
              onClick={() => setActiveArea(area)}
            >
              {area.label}
            </button>
          ))}
        </div>

        {mapLoading && <p>正在加载 {activeArea.label} 的地图点位...</p>}
        {mapError && <p className="error-text">{mapError}</p>}

        {!mapLoading && !mapError && (
          <>
            <p>当前范围共 {mapObservations.length} 条观察记录。</p>
            <ObservationMap bounds={activeArea} observations={mapObservations} />
          </>
        )}
      </section>

      {loading && <section className="card">正在同步记录数据...</section>}
      {error && <section className="card error-text">{error}</section>}

      {!loading && !error && (
        <section className="split-grid">
          <article className="card">
            <h3>最近观察</h3>
            <div className="record-grid">
              {observations.map((item) => {
                const photo = item.photos[0]?.url?.replace('square', 'medium')
                return (
                  <article className="record-card" key={item.id}>
                    {photo ? (
                      <img src={photo} alt={item.speciesName} loading="lazy" />
                    ) : (
                      <div className="record-placeholder">暂无图片</div>
                    )}
                    <div className="record-content">
                      <h4>{item.speciesName}</h4>
                      <p>{item.commonName || '暂无中文名'}</p>
                      <small>
                        观察者：{item.userLogin} · {formatObservedDate(item.observedOn)}
                      </small>
                      <a href={item.uri} target="_blank" rel="noreferrer" className="text-link">
                        打开原记录
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
          </article>

          <aside className="card sidebar">
            <h3>高频物种</h3>
            <ul className="species-list">
              {speciesCounts.map((entry) => (
                <li key={entry.taxonId}>
                  <div>
                    <strong>{entry.name}</strong>
                    <span>{entry.preferredCommonName || '暂无中文名'}</span>
                  </div>
                  <b>{entry.count}</b>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      )}
    </>
  )
}
