const INAT_API_BASE = 'https://api.inaturalist.org/v1'

const pickChineseName = (name: string | null | undefined): string | null => {
  if (!name) {
    return null
  }
  return /[\u4e00-\u9fff]/.test(name) ? name : null
}

interface RawObservation {
  id: number
  uri: string
  observed_on: string
  species_guess: string | null
  geojson: {
    coordinates: [number, number]
  } | null
  user: {
    login: string
  }
  taxon: {
    name: string
    preferred_common_name: string | null
  } | null
  photos: Array<{
    url: string
  }>
}

interface RawTaxonDetail {
  id: number
  name: string
  rank: string
  preferred_common_name: string | null
  wikipedia_summary: string | null
  default_photo: {
    medium_url: string | null
    attribution: string | null
  } | null
}

interface RawProject {
  id: number
  title: string
  observations_count: number
  observed_taxa_count: number
  user_count: number
}

interface RawSpeciesCount {
  count: number
  taxon: {
    id: number
    name: string
    preferred_common_name: string | null
  }
}

interface InatListResponse<T> {
  results: T[]
}

export interface InatObservation {
  id: number
  uri: string
  observedOn: string
  speciesName: string
  commonName: string | null
  userLogin: string
  latitude: number | null
  longitude: number | null
  photos: Array<{
    url: string
  }>
}

export interface ObservationBounds {
  swLat: number
  swLng: number
  neLat: number
  neLng: number
}

export interface InatProjectOverview {
  id: number
  title: string
  observationsCount: number
  speciesCount: number
  observersCount: number
}

export interface InatSpeciesCount {
  taxonId: number
  name: string
  preferredCommonName: string | null
  count: number
}

export interface InatSpeciesDetail {
  taxonId: number
  rank: string
  name: string
  commonName: string | null
  wikipediaSummary: string | null
  defaultPhotoUrl: string | null
  defaultPhotoAttribution: string | null
}

export interface InatSpeciesPhoto {
  observationId: number
  observationUri: string
  observedOn: string
  userLogin: string
  photoUrl: string
}

const fetchInat = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`iNaturalist request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export const fetchProjectOverview = async (
  projectId: string,
): Promise<InatProjectOverview | null> => {
  const data = await fetchInat<InatListResponse<RawProject>>(
    `${INAT_API_BASE}/projects/${projectId}`,
  )
  const project = data.results[0]

  if (!project) {
    return null
  }

  return {
    id: project.id,
    title: project.title,
    observationsCount: project.observations_count,
    speciesCount: project.observed_taxa_count,
    observersCount: project.user_count,
  }
}

export const fetchRecentObservations = async (projectId: string): Promise<InatObservation[]> => {
  const query = new URLSearchParams({
    project_id: projectId,
    per_page: '12',
    page: '1',
    order_by: 'observed_on',
    order: 'desc',
    locale: 'zh-CN',
  })

  const data = await fetchInat<InatListResponse<RawObservation>>(
    `${INAT_API_BASE}/observations?${query.toString()}`,
  )

  return data.results.map((item) => {
    const [longitude, latitude] = item.geojson?.coordinates ?? [null, null]

    return {
      id: item.id,
      uri: item.uri,
      observedOn: item.observed_on,
      speciesName: item.taxon?.name || item.species_guess || '未识别物种',
      commonName: pickChineseName(item.taxon?.preferred_common_name),
      userLogin: item.user.login,
      latitude,
      longitude,
      photos: item.photos ?? [],
    }
  })
}

export const fetchObservationsByBounds = async (
  projectId: string,
  bounds: ObservationBounds,
): Promise<InatObservation[]> => {
  const perPage = 200
  const maxPages = 20
  const all: InatObservation[] = []

  for (let page = 1; page <= maxPages; page += 1) {
    const query = new URLSearchParams({
      project_id: projectId,
      per_page: String(perPage),
      page: String(page),
      locale: 'zh-CN',
      order_by: 'observed_on',
      order: 'desc',
      swlat: String(bounds.swLat),
      swlng: String(bounds.swLng),
      nelat: String(bounds.neLat),
      nelng: String(bounds.neLng),
    })

    const data = await fetchInat<InatListResponse<RawObservation>>(
      `${INAT_API_BASE}/observations?${query.toString()}`,
    )

    const mapped = data.results.map((item) => {
      const [longitude, latitude] = item.geojson?.coordinates ?? [null, null]

      return {
        id: item.id,
        uri: item.uri,
        observedOn: item.observed_on,
        speciesName: item.taxon?.name || item.species_guess || '未识别物种',
        commonName: pickChineseName(item.taxon?.preferred_common_name),
        userLogin: item.user.login,
        latitude,
        longitude,
        photos: item.photos ?? [],
      }
    })

    all.push(...mapped)

    if (data.results.length < perPage) {
      break
    }
  }

  return all
}

export const fetchSpeciesCounts = async (projectId: string): Promise<InatSpeciesCount[]> => {
  const query = new URLSearchParams({
    project_id: projectId,
    per_page: '10',
    page: '1',
    locale: 'zh-CN',
  })

  const data = await fetchInat<InatListResponse<RawSpeciesCount>>(
    `${INAT_API_BASE}/observations/species_counts?${query.toString()}`,
  )

  return data.results.map((item) => ({
    taxonId: item.taxon.id,
    name: item.taxon.name,
    preferredCommonName: pickChineseName(item.taxon.preferred_common_name),
    count: item.count,
  }))
}

export const fetchSpeciesDetail = async (taxonId: number): Promise<InatSpeciesDetail | null> => {
  const data = await fetchInat<InatListResponse<RawTaxonDetail>>(
    `${INAT_API_BASE}/taxa/${taxonId}?locale=zh-CN`,
  )

  const taxon = data.results[0]
  if (!taxon) {
    return null
  }

  return {
    taxonId: taxon.id,
    rank: taxon.rank,
    name: taxon.name,
    commonName: pickChineseName(taxon.preferred_common_name),
    wikipediaSummary: taxon.wikipedia_summary,
    defaultPhotoUrl: taxon.default_photo?.medium_url ?? null,
    defaultPhotoAttribution: taxon.default_photo?.attribution ?? null,
  }
}

export const fetchSpeciesPhotos = async (
  projectId: string,
  taxonId: number,
): Promise<InatSpeciesPhoto[]> => {
  const query = new URLSearchParams({
    project_id: projectId,
    taxon_id: String(taxonId),
    per_page: '12',
    page: '1',
    order_by: 'observed_on',
    order: 'desc',
    locale: 'zh-CN',
    verifiable: 'any',
  })

  const data = await fetchInat<InatListResponse<RawObservation>>(
    `${INAT_API_BASE}/observations?${query.toString()}`,
  )

  const photos: InatSpeciesPhoto[] = []

  for (const item of data.results) {
    const imageUrl = item.photos?.[0]?.url
    if (!imageUrl) {
      continue
    }

    photos.push({
      observationId: item.id,
      observationUri: item.uri,
      observedOn: item.observed_on,
      userLogin: item.user.login,
      photoUrl: imageUrl.replace('square', 'medium'),
    })
  }

  return photos
}

export const formatObservedDate = (dateText: string): string => {
  const date = new Date(dateText)
  if (Number.isNaN(date.getTime())) {
    return dateText
  }
  return date.toLocaleDateString('zh-CN')
}
