#!/usr/bin/env node

const API_BASE = 'https://api.inaturalist.org/v1'
const projectId = process.argv[2] ?? 'bfbdd5b3-26b5-4060-96c8-52a7680325dc'
const outputPath = process.argv[3] ?? 'public/data/species-tree.json'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const pickChineseName = (name) => {
  if (!name) {
    return null
  }
  return /[\u4e00-\u9fff]/.test(name) ? name : null
}

const fetchJson = async (url, attempt = 1) => {
  const response = await fetch(url)

  if (response.status === 429 && attempt <= 8) {
    await sleep(attempt * 1200)
    return fetchJson(url, attempt + 1)
  }

  if (!response.ok) {
    throw new Error(`请求失败 ${response.status}: ${url}`)
  }

  return response.json()
}

const fetchSpeciesCounts = async () => {
  const perPage = 200
  const maxPages = 200
  const rows = []

  for (let page = 1; page <= maxPages; page += 1) {
    const query = new URLSearchParams({
      project_id: String(projectId),
      locale: 'zh-CN',
      verifiable: 'any',
      per_page: String(perPage),
      page: String(page),
    })

    const url = `${API_BASE}/observations/species_counts?${query.toString()}`
    const data = await fetchJson(url)
    const results = data.results ?? []
    rows.push(...results)

    if (results.length < perPage) {
      break
    }

    await sleep(250)
  }

  return rows
}

const fetchTaxonDetail = async (taxonId) => {
  const data = await fetchJson(`${API_BASE}/taxa/${taxonId}?locale=zh-CN`)
  return data?.results?.[0] ?? null
}

const rankPriority = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species']

const normalizeNode = (rawTaxon, fallbackCount = 0) => ({
  taxonId: rawTaxon?.id ?? null,
  rank: rawTaxon?.rank ?? 'unknown',
  name: rawTaxon?.name ?? '未知',
  commonName: pickChineseName(rawTaxon?.preferred_common_name),
  observationCount: fallbackCount,
  speciesLeafCount: 0,
  children: new Map(),
})

const buildTree = (speciesRows, taxonDetails) => {
  const roots = new Map()

  for (const row of speciesRows) {
    const speciesTaxonId = row?.taxon?.id
    const detail = taxonDetails.get(speciesTaxonId)
    if (!detail) {
      continue
    }

    const ordered = [...(detail.ancestors ?? []), detail]
      .filter((taxon) => rankPriority.includes(taxon.rank))
      .sort((a, b) => rankPriority.indexOf(a.rank) - rankPriority.indexOf(b.rank))

    if (ordered.length === 0) {
      continue
    }

    let currentMap = roots
    let parentNode = null

    for (const taxon of ordered) {
      const key = `${taxon.rank}:${taxon.id}`
      if (!currentMap.has(key)) {
        currentMap.set(key, normalizeNode(taxon))
      }

      const node = currentMap.get(key)
      if (taxon.rank === 'species') {
        node.observationCount += row.count ?? 0
        node.speciesLeafCount = 1
      }

      parentNode = node
      currentMap = node.children
    }

    if (!parentNode && speciesTaxonId && row?.taxon) {
      const fallbackKey = `species:${speciesTaxonId}`
      if (!roots.has(fallbackKey)) {
        roots.set(
          fallbackKey,
          normalizeNode(
            {
              id: row.taxon.id,
              rank: 'species',
              name: row.taxon.name,
              preferred_common_name: row.taxon.preferred_common_name,
            },
            row.count ?? 0,
          ),
        )
      }
    }
  }

  const finalize = (nodeMap) => {
    const nodes = [...nodeMap.entries()].map(([key, value]) => {
      const children = finalize(value.children)
      const childrenObservation = children.reduce((sum, child) => sum + child.observationCount, 0)
      const childrenSpecies = children.reduce((sum, child) => sum + child.speciesLeafCount, 0)

      return {
        key,
        taxonId: value.taxonId,
        rank: value.rank,
        name: value.name,
        commonName: value.commonName,
        observationCount: value.observationCount + childrenObservation,
        speciesLeafCount: value.speciesLeafCount + childrenSpecies,
        children,
      }
    })

    return nodes.sort((a, b) => {
      if (b.observationCount !== a.observationCount) {
        return b.observationCount - a.observationCount
      }
      return a.name.localeCompare(b.name, 'zh-CN')
    })
  }

  return finalize(roots)
}

const ensureOutputDir = async (path) => {
  const { dirname } = await import('node:path')
  const { mkdir } = await import('node:fs/promises')
  await mkdir(dirname(path), { recursive: true })
}

const writeOutput = async (path, payload) => {
  const { writeFile } = await import('node:fs/promises')
  await ensureOutputDir(path)
  await writeFile(path, JSON.stringify(payload, null, 2), 'utf-8')
}

const run = async () => {
  console.log(`开始生成物种树: project_id=${projectId}`)
  const speciesRows = await fetchSpeciesCounts()
  console.log(`已拉取物种统计条目: ${speciesRows.length}`)

  const taxonDetails = new Map()

  let processed = 0
  for (const row of speciesRows) {
    const speciesTaxonId = row?.taxon?.id
    if (!speciesTaxonId || taxonDetails.has(speciesTaxonId)) {
      continue
    }

    const detail = await fetchTaxonDetail(speciesTaxonId)
    if (detail) {
      taxonDetails.set(speciesTaxonId, detail)
    }

    processed += 1
    if (processed % 50 === 0) {
      console.log(`已处理物种详情 ${processed}`)
    }
    await sleep(180)
  }

  const tree = buildTree(speciesRows, taxonDetails)
  const payload = {
    projectId: String(projectId),
    generatedAt: new Date().toISOString(),
    totalObservations: speciesRows.reduce((sum, row) => sum + (row.count ?? 0), 0),
    totalSpecies: speciesRows.length,
    tree,
  }

  await writeOutput(outputPath, payload)

  console.log(`已生成: ${outputPath}`)
  console.log(`总物种数: ${payload.totalSpecies}`)
  console.log(`总记录数: ${payload.totalObservations}`)
}

run().catch((error) => {
  console.error('生成失败:', error.message)
  process.exit(1)
})
