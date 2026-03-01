#!/usr/bin/env node

import fs from 'fs/promises'
import xlsx from 'xlsx'
import path from 'path'

const recordSpacePath = 'public/data/ponds/pond-record-space.json'

const parse2023Excel = async (filePath, prefix) => {
  const content = await fs.readFile(filePath)
  const wb = xlsx.read(content, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '' })

  const observations = []

  for (const row of rows) {
    const speciesName = String(row['中名'] || '').trim()
    const pondsRaw = String(row['出现鸟塘'] || '').trim()

    if (!speciesName || !pondsRaw) continue

    const pondNumbers = pondsRaw.split(/[、，,]/).map(p => p.trim()).filter(Boolean)

    for (const pNum of pondNumbers) {
      let canonicalPondId = `${prefix}-${pNum.padStart(2, '0')}` // Just basic formatting
      if (pNum === '11') canonicalPondId = `${prefix}-11` // keep format

      observations.push({
        year: 2023,
        pondId: canonicalPondId,
        speciesName,
        count: '-'
      })
    }
  }

  return observations
}

const parse2025Html = async (filePath) => {
  const html = await fs.readFile(filePath, 'utf-8')
  const match = html.match(/<tbody>([\s\S]*?)<\/tbody>/)
  if (!match) return []

  const tbody = match[1]
  const rows = tbody.match(/<tr>([\s\S]*?)<\/tr>/g) || []

  const observations = []
  
  for (const r of rows) {
    const tds = r.match(/<td[^>]*>(.*?)<\/td>/g)?.map(td => td.replace(/<[^>]*>?/gm, '').trim())
    if (!tds || tds.length < 7) continue

    const siteRaw = tds[0]
    const speciesName = tds[2]
    const countRaw = tds[6]
    
    // Parse site name like "2.10 石梯23号" -> "ST-23" or "2.11 百花岭27号" -> "BHL-27"
    let canonicalPondId = null
    const siteMatch = siteRaw.match(/(石梯|百花岭|保护区|雪梨)(\d+)号/)
    if (siteMatch) {
       const prefix = siteMatch[1] === '石梯' ? 'ST' : 
                      siteMatch[1] === '百花岭' ? 'BHL' :
                      siteMatch[1] === '保护区' ? 'BHQ' :
                      siteMatch[1] === '雪梨' ? 'XL' : 'UNK'
       canonicalPondId = `${prefix}-${siteMatch[2].padStart(2, '0')}`
    } else {
       // skip if no pond number
       continue
    }

    if (canonicalPondId && speciesName) {
        observations.push({
            year: 2025,
            pondId: canonicalPondId,
            speciesName,
            count: countRaw || '-'
        })
    }
  }

  return observations
}

const run = async () => {
    console.log('Loading existing record space...')
    const prsRaw = await fs.readFile(recordSpacePath, 'utf8')
    const prs = JSON.parse(prsRaw)

    const manualObs = []
    manualObs.push(...await parse2023Excel('2023百花岭鸟种数据.xlsx', 'BHL'))
    manualObs.push(...await parse2023Excel('2023石梯村鸟种数据.xlsx', 'ST'))
    manualObs.push(...await parse2025Html('data_2025.html'))

    console.log(`Parsed ${manualObs.length} manual observations.`)

    // Reset existing manual records
    prs.records.forEach(r => r.manualSpeciesCounts = [])

    // Add valid ponds to prs if missing (some 2025 ponds might not be in the original Excel)
    const existingPondIds = new Set(prs.records.map(r => r.pondId))

    let newPondsCount = 0
    let addedObsCount = 0

    for (const obs of manualObs) {
        if (!existingPondIds.has(obs.pondId)) {
            // It might be a new pond like BHQ-05, XL-01. Create a dummy record.
            prs.records.push({
                pondId: obs.pondId,
                villages: [],
                years: [obs.year],
                hasCanonicalCoordinate: false,
                latestInatSync: { radiusMeters: 50, syncedAt: null, observationsCount: 0 },
                manualSpeciesCounts: [],
                surveyEvents: [],
                notes: [],
                attachments: []
            })
            existingPondIds.add(obs.pondId)
            newPondsCount++
        }

        const pondRecord = prs.records.find(r => r.pondId === obs.pondId)
        
        // Add year to pond metadata if not present
        if (!pondRecord.years.includes(obs.year)) {
             pondRecord.years.push(obs.year)
             pondRecord.years.sort((a,b) => a-b)
        }

        pondRecord.manualSpeciesCounts.push({
            year: obs.year,
            speciesName: obs.speciesName,
            count: obs.count
        })
        addedObsCount++
    }

    // Sort records by pondId
    prs.records.sort((a, b) => a.pondId.localeCompare(b.pondId, 'en'))

    await fs.writeFile(recordSpacePath, JSON.stringify(prs, null, 2))
    console.log(`Successfully merged manual observation data into ${recordSpacePath}.`)
    console.log(`Added ${addedObsCount} species records across ponds.`)
    if (newPondsCount > 0) {
        console.log(`Created ${newPondsCount} auto-inferred new ponds from 2025 dataset.`)
    }
}

run().catch(err => {
    console.error(err)
    process.exit(1)
})

