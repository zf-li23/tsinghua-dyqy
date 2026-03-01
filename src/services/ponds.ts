import type {
  PondInatAssignmentsFile,
  PondRecordSpaceFile,
  PondSitesFile,
} from '../types/ponds'

const getBaseUrl = () => import.meta.env.BASE_URL || '/'

const fetchJson = async <T>(path: string): Promise<T> => {
  // ensure no double slashes if path starts with / and baseUrl ends with /
  const fullPath = (getBaseUrl() + path).replace(/\/\//g, '/')
  const response = await fetch(fullPath)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export const fetchPondSites = async (): Promise<PondSitesFile> =>
  fetchJson<PondSitesFile>('data/ponds/pond-sites.json')

export const fetchPondRecordSpace = async (): Promise<PondRecordSpaceFile> =>
  fetchJson<PondRecordSpaceFile>('data/ponds/pond-record-space.json')

export const fetchPondInatAssignments = async (): Promise<PondInatAssignmentsFile> =>
  fetchJson<PondInatAssignmentsFile>('data/ponds/inat-observations-by-pond-50m.json')
