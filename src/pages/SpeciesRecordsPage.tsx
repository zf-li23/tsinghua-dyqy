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
import {
  fetchPondInatAssignments,
  fetchPondRecordSpace,
  fetchPondSites,
} from '../services/ponds'
import type { PondInatAssignment, PondRecordEntry, PondSite } from '../types/ponds'

type PondView = {
  pondId: string
  villages: string[]
  years: number[]
  coordinate: { lat: number; lng: number } | null
  manualSpeciesCounts: PondRecordEntry['manualSpeciesCounts']
  inatObservations: PondInatAssignment['observations']
}


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
          <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>▼</span>
        </button>
        {isOpen && (
          <div className="accordion-content">
            {pond.manualSpecies.length > 0 && (
              <div className="record-list">
                <small>全部人工记录：</small>
                <ul className="species-list">
                  {pond.manualSpecies.map((item: any, index: number) => (
                    <li key={`${pond.pondId}-manual-${index}`}>
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

  const [pondSites, setPondSites] = useState<PondSite[]>([])
  const [pondRecords, setPondRecords] = useState<PondRecordEntry[]>([])
  const [pondAssignments, setPondAssignments] = useState<PondInatAssignment[]>([])
  const [localLoading, setLocalLoading] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)

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

  useEffect(() => {
    const loadLocal = async () => {
      setLocalLoading(true)
      setLocalError(null)
      try {
        const [sitesData, recordData, inatData] = await Promise.all([
          fetchPondSites(),
          fetchPondRecordSpace(),
          fetchPondInatAssignments(),
        ])
        setPondSites(sitesData.ponds ?? [])
        setPondRecords(recordData.records ?? [])
        setPondAssignments(inatData.ponds ?? [])
      } catch {
        setLocalError('本地鸟塘记录加载失败，请稍后刷新重试。')
      } finally {
        setLocalLoading(false)
      }
    }

    loadLocal()
  }, [])

  const pondViews = useMemo<PondView[]>(() => {
    if (!pondSites.length) return []

    const recordMap = new Map(pondRecords.map((item) => [item.pondId, item]))
    const inatMap = new Map(pondAssignments.map((item) => [item.pondId, item]))

    return pondSites.map((site) => {
      const record = recordMap.get(site.pondId)
      const inat = inatMap.get(site.pondId)

      return {
        pondId: site.pondId,
        villages: site.villages,
        years: record?.years ?? site.years ?? [],
        coordinate: site.canonicalCoordinate
          ? { lat: site.canonicalCoordinate.latitude, lng: site.canonicalCoordinate.longitude }
          : null,
        manualSpeciesCounts: record?.manualSpeciesCounts ?? [],
        inatObservations: inat?.observations ?? [],
      }
    })
  }, [pondSites, pondRecords, pondAssignments])

  const areaPonds = useMemo(() => {
    return pondViews
      .filter((pond) => {
        if (!pond.coordinate) return false
        const { lat, lng } = pond.coordinate
        return lat >= activeArea.swLat && lat <= activeArea.neLat && lng >= activeArea.swLng && lng <= activeArea.neLng
      })
      .map((pond) => ({
        pondId: pond.pondId,
        label: pond.pondId,
        latitude: pond.coordinate?.lat as number,
        longitude: pond.coordinate?.lng as number,
        manualCount: pond.manualSpeciesCounts.length,
        inatCount: pond.inatObservations.length,
      }))
  }, [pondViews, activeArea])

  const pondCards = useMemo(() => {
    return [...pondViews]
      .map((pond) => ({
        pondId: pond.pondId,
        villages: pond.villages,
        years: pond.years,
        manualCount: pond.manualSpeciesCounts.length,
        inatCount: pond.inatObservations.length,
        manualSpecies: pond.manualSpeciesCounts,
        inatSpecies: pond.inatObservations,
      }))
      .sort((a, b) => b.manualCount + b.inatCount - (a.manualCount + a.inatCount))
  }, [pondViews])

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
        <h2>鸟塘合并视图：本地记录 + iNaturalist</h2>
        <p>
          iNaturalist 实时拉取与线下手工记录一并呈现，既能查看最新线上观察，也能回溯 2023-2025 年的鸟塘调查结果。
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
        <h3>鸟塘地图（合并图层）</h3>
        <p>绿色圆点为鸟塘点位，橙色为 iNat 原始观测。范围切换仅影响地图视图，不影响列表。</p>

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

        {mapLoading && <p>正在加载 {activeArea.label} 的 iNat 点位...</p>}
        {mapError && <p className="error-text">{mapError}</p>}

        {!mapLoading && !mapError && (
          <>
            <p>
              当前范围 iNat 记录 {mapObservations.length} 条，鸟塘点位 {areaPonds.length} 个。
            </p>
            <ObservationMap bounds={activeArea} ponds={areaPonds} inatPoints={mapObservations} />
          </>
        )}
      </section>

      {localLoading && <section className="card">正在加载鸟塘本地记录...</section>}
      {localError && <section className="card error-text">{localError}</section>}

      {!localLoading && !localError && (
        <section className="card page-article">
          <h3>鸟塘归并记录</h3>
          <p>每个鸟塘的人工记录（2023/2025）与 iNat 归并记录合并展示。</p>
          <div className="record-grid">
            {pondCards.map((pond) => <PondCard key={pond.pondId} pond={pond} />)}
          </div>
        </section>
      )}

      {loading && <section className="card">正在同步 iNat 实时数据...</section>}
      {error && <section className="card error-text">{error}</section>}

      {!loading && !error && (
        <section className="split-grid">
          <article className="card">
            <h3>最近观察（iNat 实时）</h3>
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
            <h3>高频物种（iNat）</h3>
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
