#!/usr/bin/env node

import xlsx from 'xlsx'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const sourcePath = process.argv[2] ?? '2023-2026鸟塘信息.xlsx'
const pondSitesOutputPath = process.argv[3] ?? 'public/data/ponds/pond-sites.json'
const pondRecordSpaceOutputPath = process.argv[4] ?? 'public/data/ponds/pond-record-space.json'

const toTrimmedString = (value) => String(value ?? '').trim()

const toYear = (value) => {
  const text = toTrimmedString(value)
  if (!text) {
    return null
  }
  const year = Number.parseInt(text, 10)
  return Number.isFinite(year) ? year : null
}

const normalizeHemisphere = (segment) => {
  const text = toTrimmedString(segment).toUpperCase()
  if (text.includes('N') || text.includes('北')) {
    return 'N'
  }
  if (text.includes('S') || text.includes('南')) {
    return 'S'
  }
  if (text.includes('E') || text.includes('东')) {
    return 'E'
  }
  if (text.includes('W') || text.includes('西')) {
    return 'W'
  }
  return null
}

const parseSingleCoordinate = (segment, axis) => {
  const match = toTrimmedString(segment).match(/[-+]?\d+(?:\.\d+)?/)
  if (!match) {
    return null
  }

  const numeric = Number.parseFloat(match[0])
  if (!Number.isFinite(numeric)) {
    return null
  }

  const hemisphere = normalizeHemisphere(segment)
  let value = numeric

  if (axis === 'lat') {
    if (hemisphere === 'S') {
      value = -Math.abs(value)
    } else if (hemisphere === 'N') {
      value = Math.abs(value)
    }
    if (value < -90 || value > 90) {
      return null
    }
    return value
  }

  if (hemisphere === 'W') {
    value = -Math.abs(value)
  } else if (hemisphere === 'E') {
    value = Math.abs(value)
  }
  if (value < -180 || value > 180) {
    return null
  }
  return value
}

const parseLatLng = (raw) => {
  const text = toTrimmedString(raw)
  if (!text) {
    return {
      status: 'missing',
      latitude: null,
      longitude: null,
      normalizedText: '',
      error: null,
    }
  }

  const normalized = text.replace(/，/g, ',').replace(/\s+/g, ' ')
  const segments = normalized
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (segments.length >= 2) {
    const latitude = parseSingleCoordinate(segments[0], 'lat')
    const longitude = parseSingleCoordinate(segments[1], 'lng')
    if (latitude !== null && longitude !== null) {
      return {
        status: 'valid',
        latitude,
        longitude,
        normalizedText: `${latitude.toFixed(8)},${longitude.toFixed(8)}`,
        error: null,
      }
    }
  }

  const numericParts = [...normalized.matchAll(/[-+]?\d+(?:\.\d+)?/g)].map((item) =>
    Number.parseFloat(item[0]),
  )

  if (numericParts.length >= 2) {
    const latitude = numericParts[0]
    const longitude = numericParts[1]
    if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
      return {
        status: 'valid',
        latitude,
        longitude,
        normalizedText: `${latitude.toFixed(8)},${longitude.toFixed(8)}`,
        error: null,
      }
    }
  }

  return {
    status: 'invalid',
    latitude: null,
    longitude: null,
    normalizedText: '',
    error: '无法解析经纬度',
  }
}

const toRadians = (value) => (value * Math.PI) / 180

const haversineMeters = (a, b) => {
  const radius = 6371000
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)
  const dLat = lat2 - lat1
  const dLon = toRadians(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * radius * Math.asin(Math.sqrt(h))
}

const pickCanonicalCoordinate = (coordinateHistory) => {
  const valid = coordinateHistory.filter((item) => item.coordinate.status === 'valid')

  if (valid.length === 0) {
    return {
      coordinateStatus: coordinateHistory.some((item) => item.coordinate.status === 'invalid')
        ? 'invalid_or_missing'
        : 'missing',
      canonical: null,
      candidates: [],
      maxSpreadMeters: null,
    }
  }

  const grouped = new Map()
  for (const item of valid) {
    const key = `${item.coordinate.latitude.toFixed(8)},${item.coordinate.longitude.toFixed(8)}`
    if (!grouped.has(key)) {
      grouped.set(key, {
        latitude: item.coordinate.latitude,
        longitude: item.coordinate.longitude,
        years: new Set(),
        rawSamples: new Set(),
      })
    }
    const group = grouped.get(key)
    if (item.year !== null) {
      group.years.add(item.year)
    }
    if (item.rawCoordinate) {
      group.rawSamples.add(item.rawCoordinate)
    }
  }

  const candidates = [...grouped.values()].map((item) => ({
    latitude: item.latitude,
    longitude: item.longitude,
    years: [...item.years].sort((a, b) => a - b),
    rawSamples: [...item.rawSamples],
  }))

  const sortedValid = [...valid].sort((left, right) => {
    const leftYear = left.year ?? -1
    const rightYear = right.year ?? -1
    if (leftYear !== rightYear) {
      return rightYear - leftYear
    }
    return right.sourceRow - left.sourceRow
  })

  const canonicalSource = sortedValid[0]
  let maxSpreadMeters = 0

  for (let indexA = 0; indexA < candidates.length; indexA += 1) {
    for (let indexB = indexA + 1; indexB < candidates.length; indexB += 1) {
      const distance = haversineMeters(candidates[indexA], candidates[indexB])
      if (distance > maxSpreadMeters) {
        maxSpreadMeters = distance
      }
    }
  }

  const coordinateStatus = candidates.length > 1 ? 'multiple_valid_candidates' : 'valid'

  return {
    coordinateStatus,
    canonical: {
      latitude: canonicalSource.coordinate.latitude,
      longitude: canonicalSource.coordinate.longitude,
      selectedFromYear: canonicalSource.year,
      selectedFromRawText: canonicalSource.rawCoordinate,
    },
    candidates,
    maxSpreadMeters,
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
  const workbook = xlsx.readFile(sourcePath)
  const firstSheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[firstSheetName]
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' })

  const pondMap = new Map()
  const cleanedRows = []

  rows.forEach((row, index) => {
    const pondId = toTrimmedString(row['编号']).toUpperCase()
    const village = toTrimmedString(row['所属村镇'])
    const year = toYear(row['年份'])
    const rawCoordinate = toTrimmedString(row['经纬度'])
    const coordinate = parseLatLng(rawCoordinate)

    if (!pondId) {
      return
    }

    const cleanedRow = {
      sourceRow: index + 2,
      pondId,
      village: village || null,
      year,
      rawCoordinate,
      coordinate,
    }
    cleanedRows.push(cleanedRow)

    if (!pondMap.has(pondId)) {
      pondMap.set(pondId, {
        pondId,
        villages: new Set(),
        years: new Set(),
        coordinateHistory: [],
      })
    }

    const pond = pondMap.get(pondId)
    if (village) {
      pond.villages.add(village)
    }
    if (year !== null) {
      pond.years.add(year)
    }
    pond.coordinateHistory.push(cleanedRow)
  })

  const ponds = [...pondMap.values()]
    .map((pond) => {
      const coordinateMeta = pickCanonicalCoordinate(pond.coordinateHistory)

      return {
        pondId: pond.pondId,
        villages: [...pond.villages].sort((left, right) => left.localeCompare(right, 'zh-CN')),
        years: [...pond.years].sort((left, right) => left - right),
        coordinateStatus: coordinateMeta.coordinateStatus,
        canonicalCoordinate: coordinateMeta.canonical,
        coordinateCandidates: coordinateMeta.candidates,
        coordinateSpreadMeters:
          coordinateMeta.maxSpreadMeters === null
            ? null
            : Number.parseFloat(coordinateMeta.maxSpreadMeters.toFixed(2)),
        coordinateHistory: pond.coordinateHistory,
        displayRecordSpace: {
          inatAssignments: [],
          manualSpeciesCounts: [],
          surveyEvents: [],
          notes: [],
          attachments: [],
        },
      }
    })
    .sort((left, right) => left.pondId.localeCompare(right.pondId, 'en'))

  const pondSitesPayload = {
    generatedAt: new Date().toISOString(),
    source: {
      workbookPath: sourcePath,
      worksheet: firstSheetName,
      totalRows: rows.length,
    },
    summary: {
      uniquePondCount: ponds.length,
      rowsWithValidCoordinate: cleanedRows.filter((item) => item.coordinate.status === 'valid').length,
      rowsWithMissingCoordinate: cleanedRows.filter((item) => item.coordinate.status === 'missing').length,
      rowsWithInvalidCoordinate: cleanedRows.filter((item) => item.coordinate.status === 'invalid').length,
      pondsWithCanonicalCoordinate: ponds.filter((item) => item.canonicalCoordinate !== null).length,
      pondsMissingCanonicalCoordinate: ponds.filter((item) => item.canonicalCoordinate === null).length,
    },
    ponds,
  }

  const pondRecordSpacePayload = {
    generatedAt: new Date().toISOString(),
    sourcePondSitesFile: pondSitesOutputPath,
    schemaVersion: 1,
    records: ponds.map((pond) => ({
      pondId: pond.pondId,
      villages: pond.villages,
      years: pond.years,
      hasCanonicalCoordinate: pond.canonicalCoordinate !== null,
      latestInatSync: {
        radiusMeters: 50,
        syncedAt: null,
        observationsCount: 0,
      },
      manualSpeciesCounts: [],
      surveyEvents: [],
      notes: [],
      attachments: [],
    })),
  }

  await writeJson(pondSitesOutputPath, pondSitesPayload)
  await writeJson(pondRecordSpaceOutputPath, pondRecordSpacePayload)

  console.log(`已写入: ${pondSitesOutputPath}`)
  console.log(`已写入: ${pondRecordSpaceOutputPath}`)
  console.log(`唯一点位数: ${pondSitesPayload.summary.uniquePondCount}`)
  console.log(`可用坐标点位数: ${pondSitesPayload.summary.pondsWithCanonicalCoordinate}`)
}

run().catch((error) => {
  console.error('处理失败:', error.message)
  process.exit(1)
})