#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

const API_BASE = 'https://api.inaturalist.org/v1'

const projectId = process.argv[2] ?? 'bfbdd5b3-26b5-4060-96c8-52a7680325dc'
const radiusMeters = Number.parseFloat(process.argv[3] ?? '50')
const pondSitesPath = process.argv[4] ?? 'public/data/ponds/pond-sites.json'
const outputPath = process.argv[5] ?? 'public/data/ponds/inat-observations-by-pond-50m.json'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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

const toRadians = (value) => (value * Math.PI) / 180

const haversineMeters = (a, b) => {
  const earthRadius = 6371000
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)
  const dLat = lat2 - lat1
  const dLon = toRadians(b.longitude - a.longitude)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2

  return 2 * earthRadius * Math.asin(Math.sqrt(h))
}

const fetchAllObservations = async (inatProjectId) => {
  const perPage = 200
  const maxPages = 400
  const rows = []

  for (let page = 1; page <= maxPages; page += 1) {
    const query = new URLSearchParams({
      project_id: String(inatProjectId),
      per_page: String(perPage),
      page: String(page),
      locale: 'zh-CN',
      verifiable: 'any',
      order_by: 'observed_on',
      order: 'desc',
    })

    const url = `${API_BASE}/observations?${query.toString()}`
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

const mapObservation = (item) => {
  const coordinates = item?.geojson?.coordinates ?? []
  const longitude = Number.isFinite(coordinates[0]) ? coordinates[0] : null
  const latitude = Number.isFinite(coordinates[1]) ? coordinates[1] : null

  return {
    observationId: item.id,
    uri: item.uri,
    observedOn: item.observed_on,
    latitude,
    longitude,
    userLogin: item?.user?.login ?? null,
    taxonId: item?.taxon?.id ?? null,
    speciesName: item?.taxon?.name ?? item?.species_guess ?? '未识别物种',
    commonName: item?.taxon?.preferred_common_name ?? null,
  }
}

const ensureParentDir = async (filePath) => {
  await mkdir(dirname(filePath), { recursive: true })
}

const writeJson = async (filePath, payload) => {
  await ensureParentDir(filePath)
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8')
}

const run = async () => {
  if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
    throw new Error('半径参数必须是正数')
  }

  const pondSitesRaw = await readFile(pondSitesPath, 'utf-8')
  const pondSites = JSON.parse(pondSitesRaw)
  const ponds = (pondSites.ponds ?? [])
    .filter((item) => item?.canonicalCoordinate)
    .map((item) => ({
      pondId: item.pondId,
      villages: item.villages ?? [],
      latitude: item.canonicalCoordinate.latitude,
      longitude: item.canonicalCoordinate.longitude,
    }))

  if (ponds.length === 0) {
    throw new Error('没有可用于归入的点位坐标，请先运行 clean:pond-sites')
  }

  console.log(`开始拉取 iNat 观察: project_id=${projectId}`)
  const rawObservations = await fetchAllObservations(projectId)
  const observations = rawObservations.map(mapObservation)
  console.log(`已拉取观察数: ${observations.length}`)

  const assignmentsByPond = new Map(
    ponds.map((pond) => [
      pond.pondId,
      {
        pondId: pond.pondId,
        villages: pond.villages,
        radiusMeters,
        observations: [],
      },
    ]),
  )

  const unassigned = []
  let assignedCount = 0
  let missingCoordinateObservationCount = 0

  for (const observation of observations) {
    if (observation.latitude === null || observation.longitude === null) {
      missingCoordinateObservationCount += 1
      unassigned.push({
        ...observation,
        reason: 'observation_missing_coordinate',
      })
      continue
    }

    let best = null

    for (const pond of ponds) {
      const distance = haversineMeters(
        { latitude: observation.latitude, longitude: observation.longitude },
        { latitude: pond.latitude, longitude: pond.longitude },
      )

      if (distance <= radiusMeters) {
        if (!best || distance < best.distanceMeters) {
          best = {
            pondId: pond.pondId,
            distanceMeters: distance,
          }
        }
      }
    }

    if (!best) {
      unassigned.push({
        ...observation,
        reason: 'no_pond_within_radius',
      })
      continue
    }

    const target = assignmentsByPond.get(best.pondId)
    target.observations.push({
      ...observation,
      distanceMeters: Number.parseFloat(best.distanceMeters.toFixed(2)),
    })
    assignedCount += 1
  }

  const assignedByPond = [...assignmentsByPond.values()]
    .map((pond) => {
      const speciesCountMap = new Map()

      for (const item of pond.observations) {
        const key = item.taxonId ? `taxon:${item.taxonId}` : `name:${item.speciesName}`
        if (!speciesCountMap.has(key)) {
          speciesCountMap.set(key, {
            taxonId: item.taxonId,
            speciesName: item.speciesName,
            commonName: item.commonName,
            count: 0,
          })
        }
        speciesCountMap.get(key).count += 1
      }

      return {
        ...pond,
        observationCount: pond.observations.length,
        speciesCount: speciesCountMap.size,
        topSpecies: [...speciesCountMap.values()]
          .sort((left, right) => right.count - left.count)
          .slice(0, 30),
      }
    })
    .sort((left, right) => right.observationCount - left.observationCount)

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      projectId: String(projectId),
      radiusMeters,
      pondSitesPath,
      fetchedObservationCount: observations.length,
      assignablePondCount: ponds.length,
    },
    summary: {
      assignedCount,
      unassignedCount: unassigned.length,
      missingCoordinateObservationCount,
      assignedRatio: observations.length
        ? Number.parseFloat((assignedCount / observations.length).toFixed(4))
        : 0,
    },
    ponds: assignedByPond,
    unassigned,
  }

  await writeJson(outputPath, payload)

  console.log(`已写入: ${outputPath}`)
  console.log(`归入成功: ${assignedCount}`)
  console.log(`未归入: ${unassigned.length}`)
}

run().catch((error) => {
  console.error('归入失败:', error.message)
  process.exit(1)
})