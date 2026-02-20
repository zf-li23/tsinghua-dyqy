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
  photos: Array<{
    url: string
  }>
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

  return data.results.map((item) => ({
    id: item.id,
    uri: item.uri,
    observedOn: item.observed_on,
    speciesName: item.taxon?.name || item.species_guess || '未识别物种',
    commonName: pickChineseName(item.taxon?.preferred_common_name),
    userLogin: item.user.login,
    photos: item.photos ?? [],
  }))
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

export const formatObservedDate = (dateText: string): string => {
  const date = new Date(dateText)
  if (Number.isNaN(date.getTime())) {
    return dateText
  }
  return date.toLocaleDateString('zh-CN')
}
