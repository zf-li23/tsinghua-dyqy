import { useEffect, useMemo, useState } from 'react'
import {
  fetchSpeciesDetail,
  fetchSpeciesPhotos,
  formatObservedDate,
  type InatSpeciesDetail,
  type InatSpeciesPhoto,
} from '../services/inat'

interface SpeciesTreeNode {
  key: string
  taxonId: number | null
  rank: string
  name: string
  commonName: string | null
  observationCount: number
  speciesLeafCount: number
  children: SpeciesTreeNode[]
}

interface SpeciesTreeData {
  projectId: string
  generatedAt: string
  totalObservations: number
  totalSpecies: number
  tree: SpeciesTreeNode[]
}

interface SpeciesLeafItem {
  taxonId: number
  name: string
  commonName: string | null
  rank: string
  observationCount: number
}

const rankLabel: Record<string, string> = {
  kingdom: '界',
  phylum: '门',
  class: '纲',
  order: '目',
  family: '科',
  genus: '属',
  species: '种',
  subspecies: '亚种',
  variety: '变种',
}

const traditionalToSimplifiedMap: Record<string, string> = {
  雲: '云',
  學: '学',
  鳥: '鸟',
  鶥: '鹛',
  種: '种',
  類: '类',
  亞: '亚',
  綱: '纲',
  目: '目',
  科: '科',
  屬: '属',
  門: '门',
  與: '与',
  為: '为',
  的: '的',
  一: '一',
  個: '个',
  這: '这',
  該: '该',
  於: '于',
  來: '来',
  後: '后',
  觀: '观',
  察: '察',
  記: '记',
  錄: '录',
  體: '体',
  臺: '台',
  網: '网',
  頁: '页',
  寫: '写',
  發: '发',
  現: '现',
  繁: '繁',
  簡: '简',
}

const toSimplified = (text: string): string =>
  [...text]
    .map((char) => traditionalToSimplifiedMap[char] ?? char)
    .join('')

const sanitizeSummaryHtml = (raw: string | null | undefined): string => {
  if (!raw) {
    return ''
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return toSimplified(raw)
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, 'text/html')
  const allowedTags = new Set(['B', 'I', 'EM', 'STRONG', 'P', 'BR', 'UL', 'OL', 'LI', 'A'])

  const walk = (element: Element) => {
    const children = [...element.children]
    for (const child of children) {
      if (!allowedTags.has(child.tagName)) {
        const fragment = document.createDocumentFragment()
        while (child.firstChild) {
          fragment.appendChild(child.firstChild)
        }
        child.replaceWith(fragment)
        continue
      }

      if (child.tagName === 'A') {
        const href = child.getAttribute('href')
        if (!href || !/^https?:\/\//i.test(href)) {
          child.removeAttribute('href')
        }
        child.setAttribute('target', '_blank')
        child.setAttribute('rel', 'noreferrer noopener')
      }

      const attrs = [...child.attributes]
      for (const attr of attrs) {
        if (child.tagName !== 'A' || !['href', 'target', 'rel'].includes(attr.name)) {
          child.removeAttribute(attr.name)
        }
      }

      walk(child)
    }
  }

  walk(doc.body)

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    node.textContent = toSimplified(node.textContent ?? '')
    node = walker.nextNode()
  }

  return doc.body.innerHTML
}

const formatTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString('zh-CN')
}

function hasSelectedDescendant(node: SpeciesTreeNode, selectedTaxonId: number | null): boolean {
  if (!selectedTaxonId) {
    return false
  }

  if (node.taxonId === selectedTaxonId) {
    return true
  }

  return node.children.some((child) => hasSelectedDescendant(child, selectedTaxonId))
}

function AtlasNode({
  node,
  depth,
  selectedTaxonId,
  onSelect,
}: {
  node: SpeciesTreeNode
  depth: number
  selectedTaxonId: number | null
  onSelect: (taxonId: number) => void
}) {
  const label = rankLabel[node.rank] || node.rank
  const commonName = node.commonName ? `（${node.commonName}）` : ''

  if (node.children.length === 0) {
    const isActive = node.taxonId === selectedTaxonId

    return (
      <li className="atlas-item atlas-leaf">
        <button
          type="button"
          className={`atlas-line atlas-leaf-btn ${isActive ? 'active' : ''}`}
          onClick={() => node.taxonId && onSelect(node.taxonId)}
        >
          <span className="atlas-rank">{label}</span>
          <strong>{node.name}</strong>
          <span className="atlas-common">{commonName}</span>
          <b>{node.observationCount}</b>
        </button>
      </li>
    )
  }

  const shouldOpen = depth < 2 || hasSelectedDescendant(node, selectedTaxonId)

  return (
    <li className="atlas-item">
      <details open={shouldOpen}>
        <summary>
          <span className="atlas-rank">{label}</span>
          <strong>{node.name}</strong>
          <span className="atlas-common">{commonName}</span>
          <small>
            {node.speciesLeafCount} 种 / {node.observationCount} 记录
          </small>
        </summary>

        <ul className="atlas-tree">
          {node.children.map((child) => (
            <AtlasNode
              key={child.key}
              node={child}
              depth={depth + 1}
              selectedTaxonId={selectedTaxonId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </details>
    </li>
  )
}

export function SpeciesAtlasPage() {
  const [data, setData] = useState<SpeciesTreeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTaxonId, setSelectedTaxonId] = useState<number | null>(null)
  const [detail, setDetail] = useState<InatSpeciesDetail | null>(null)
  const [photos, setPhotos] = useState<InatSpeciesPhoto[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/species-tree.json`)
        if (!response.ok) {
          throw new Error('not-found')
        }
        const json = (await response.json()) as SpeciesTreeData
        setData(json)
      } catch {
        setError('尚未生成物种树数据。请先执行 npm run generate:species-tree。')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const topLevelCount = useMemo(() => data?.tree.length ?? 0, [data])

  const speciesLeaves = useMemo(() => {
    if (!data) {
      return [] as SpeciesLeafItem[]
    }

    const rows: SpeciesLeafItem[] = []

    const walk = (nodes: SpeciesTreeNode[]) => {
      for (const node of nodes) {
        if (node.children.length === 0 && node.taxonId) {
          rows.push({
            taxonId: node.taxonId,
            name: node.name,
            commonName: node.commonName,
            rank: node.rank,
            observationCount: node.observationCount,
          })
          continue
        }

        walk(node.children)
      }
    }

    walk(data.tree)
    return rows
  }, [data])

  const selectedLeaf = useMemo(
    () => speciesLeaves.find((item) => item.taxonId === selectedTaxonId) ?? null,
    [speciesLeaves, selectedTaxonId],
  )

  useEffect(() => {
    if (!selectedTaxonId && speciesLeaves.length > 0) {
      setSelectedTaxonId(speciesLeaves[0].taxonId)
    }
  }, [selectedTaxonId, speciesLeaves])

  useEffect(() => {
    if (!selectedTaxonId || !data) {
      return
    }

    const loadProfile = async () => {
      setDetailLoading(true)
      setDetailError(null)
      try {
        const [nextDetail, nextPhotos] = await Promise.all([
          fetchSpeciesDetail(selectedTaxonId),
          fetchSpeciesPhotos(data.projectId, selectedTaxonId),
        ])
        setDetail(nextDetail)
        setPhotos(nextPhotos)
      } catch {
        setDetailError('物种详情加载失败，请稍后重试。')
        setDetail(null)
        setPhotos([])
      } finally {
        setDetailLoading(false)
      }
    }

    loadProfile()
  }, [data, selectedTaxonId])

  return (
    <>
      <section className="card page-article">
        <p className="kicker">物种图鉴</p>
        <h2>从 iNaturalist 项目自动生成的物种分类树</h2>
        <p>
          本页读取脚本生成的物种树文件（覆盖项目内全部记录），按“界—门—纲—目—科—属—种”层级展示，
          可用于教学、科普与跨届知识传承。
        </p>
      </section>

      {loading && <section className="card">正在加载物种树数据...</section>}
      {error && <section className="card error-text">{error}</section>}

      {!loading && !error && data && (
        <>
          <section className="stats-grid">
            <article className="stat-tile">
              <strong>{data.totalSpecies}</strong>
              <span>记录物种（种级叶子）</span>
            </article>
            <article className="stat-tile">
              <strong>{data.totalObservations}</strong>
              <span>累计观察记录</span>
            </article>
            <article className="stat-tile">
              <strong>{topLevelCount}</strong>
              <span>顶层分类节点</span>
            </article>
            <article className="stat-tile">
              <strong>{data.projectId}</strong>
              <span>项目编号</span>
            </article>
          </section>

          <section className="card page-article">
            <p className="atlas-meta">最近生成：{formatTime(data.generatedAt)}</p>
            <div className="atlas-layout">
              <aside className="atlas-sidebar">
                <h3>物种树导航</h3>
                <ul className="atlas-tree atlas-root">
                  {data.tree.map((node) => (
                    <AtlasNode
                      key={node.key}
                      node={node}
                      depth={0}
                      selectedTaxonId={selectedTaxonId}
                      onSelect={setSelectedTaxonId}
                    />
                  ))}
                </ul>
              </aside>

              <section className="atlas-main">
                <h3>物种详情</h3>
                {!selectedLeaf && <p>请先从左侧树中选择物种。</p>}

                {selectedLeaf && (
                  <>
                    <article className="atlas-detail-card">
                      <h4>
                        {selectedLeaf.name}
                        {selectedLeaf.commonName ? `（${selectedLeaf.commonName}）` : ''}
                      </h4>
                      <p>
                        分类等级：{rankLabel[selectedLeaf.rank] || selectedLeaf.rank} ·
                        项目内记录数：{selectedLeaf.observationCount}
                      </p>

                      {detailLoading && <p>正在加载详细信息...</p>}
                      {detailError && <p className="error-text">{detailError}</p>}

                      {!detailLoading && !detailError && detail && (
                        <>
                          {detail.defaultPhotoUrl && (
                            <img
                              src={detail.defaultPhotoUrl}
                              alt={detail.name}
                              className="atlas-detail-cover"
                              loading="lazy"
                            />
                          )}

                          {detail.wikipediaSummary && (
                            <div
                              className="atlas-summary"
                              dangerouslySetInnerHTML={{
                                __html: sanitizeSummaryHtml(detail.wikipediaSummary),
                              }}
                            />
                          )}

                          <p>
                            <a
                              href={`https://www.inaturalist.org/taxa/${selectedLeaf.taxonId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-link"
                            >
                              打开 iNaturalist 物种页
                            </a>
                          </p>
                        </>
                      )}
                    </article>

                    <article className="atlas-detail-card">
                      <h4>项目拍摄照片</h4>
                      {detailLoading && <p>正在加载照片...</p>}
                      {!detailLoading && photos.length === 0 && <p>该物种暂无可展示照片。</p>}

                      {photos.length > 0 && (
                        <div className="atlas-photo-grid">
                          {photos.map((photo) => (
                            <article key={photo.observationId} className="atlas-photo-card">
                              <img src={photo.photoUrl} alt={selectedLeaf.name} loading="lazy" />
                              <div>
                                <small>
                                  观察者：{photo.userLogin} · {formatObservedDate(photo.observedOn)}
                                </small>
                                <a
                                  href={photo.observationUri}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-link"
                                >
                                  查看原记录
                                </a>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </article>
                  </>
                )}
              </section>
            </div>
          </section>
        </>
      )}
    </>
  )
}
