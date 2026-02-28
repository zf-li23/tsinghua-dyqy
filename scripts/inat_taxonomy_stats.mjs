#!/usr/bin/env node

const DEFAULT_URL =
  'https://www.inaturalist.org/observations?project_id=bfbdd5b3-26b5-4060-96c8-52a7680325dc&verifiable=any&place_id=any'

const inputUrl = process.argv[2] ?? DEFAULT_URL
const parsed = new URL(inputUrl)

const projectId = parsed.searchParams.get('project_id')
const taxonId = parsed.searchParams.get('taxon_id')
const verifiable = parsed.searchParams.get('verifiable') ?? 'any'

if (!projectId) {
  throw new Error('URL 缺少必要参数：project_id')
}

const API_BASE = 'https://api.inaturalist.org/v1'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchJson = async (url, attempt = 1) => {
  const response = await fetch(url)

  if (response.status === 429 && attempt <= 6) {
    const waitMs = attempt * 1200
    await sleep(waitMs)
    return fetchJson(url, attempt + 1)
  }

  if (!response.ok) {
    throw new Error(`请求失败 ${response.status}: ${url}`)
  }

  return response.json()
}

const speciesTaxonIds = new Set()

const fetchSpeciesCounts = async () => {
  const perPage = 200
  const maxPages = 50

  for (let page = 1; page <= maxPages; page += 1) {
    const query = new URLSearchParams({
      project_id: projectId,
      verifiable,
      per_page: String(perPage),
      page: String(page),
    })

    if (taxonId) {
      query.set('taxon_id', taxonId)
    }

    const url = `${API_BASE}/observations/species_counts?${query.toString()}`
    const data = await fetchJson(url)

    const results = data.results ?? []
    for (const row of results) {
      if (row?.taxon?.id) {
        speciesTaxonIds.add(row.taxon.id)
      }
    }

    if (results.length < perPage) {
      break
    }
  }
}

const familyIds = new Set()
const genusIds = new Set()

const collectTaxonRanks = (taxon) => {
  if (!taxon) {
    return
  }

  if (taxon.rank === 'family' && taxon.id) {
    familyIds.add(taxon.id)
  }

  if (taxon.rank === 'genus' && taxon.id) {
    genusIds.add(taxon.id)
  }
}

const fetchTaxonHierarchy = async (id) => {
  const url = `${API_BASE}/taxa/${id}`
  const data = await fetchJson(url)
  const taxon = data?.results?.[0]

  if (!taxon) {
    return
  }

  collectTaxonRanks(taxon)

  const ancestors = taxon.ancestors ?? []
  for (const ancestor of ancestors) {
    collectTaxonRanks(ancestor)
  }
}

const run = async () => {
  console.log('统计条件：')
  console.log(`- project_id: ${projectId}`)
  console.log(`- taxon_id: ${taxonId ?? 'ALL'}`)
  console.log(`- verifiable: ${verifiable}`)

  await fetchSpeciesCounts()
  console.log(`- 物种层级 taxon 数: ${speciesTaxonIds.size}`)

  let done = 0
  for (const id of speciesTaxonIds) {
    await fetchTaxonHierarchy(id)
    await sleep(250)
    done += 1
    if (done % 50 === 0) {
      console.log(`  已处理 ${done}/${speciesTaxonIds.size}`)
    }
  }

  console.log('\n统计结果：')
  console.log(`- 覆盖科数: ${familyIds.size}`)
  console.log(`- 覆盖属数: ${genusIds.size}`)
}

run().catch((error) => {
  console.error('统计失败:', error.message)
  process.exit(1)
})
