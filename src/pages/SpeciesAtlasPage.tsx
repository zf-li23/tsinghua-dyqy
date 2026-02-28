import { useEffect, useMemo, useState } from 'react'

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

const formatTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString('zh-CN')
}

function AtlasNode({ node, depth }: { node: SpeciesTreeNode; depth: number }) {
  const label = rankLabel[node.rank] || node.rank
  const commonName = node.commonName ? `（${node.commonName}）` : ''

  if (node.children.length === 0) {
    return (
      <li className="atlas-item atlas-leaf">
        <div className="atlas-line">
          <span className="atlas-rank">{label}</span>
          <strong>{node.name}</strong>
          <span className="atlas-common">{commonName}</span>
          <b>{node.observationCount}</b>
        </div>
      </li>
    )
  }

  return (
    <li className="atlas-item">
      <details open={depth < 2}>
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
            <AtlasNode key={child.key} node={child} depth={depth + 1} />
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
            <ul className="atlas-tree atlas-root">
              {data.tree.map((node) => (
                <AtlasNode key={node.key} node={node} depth={0} />
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  )
}
