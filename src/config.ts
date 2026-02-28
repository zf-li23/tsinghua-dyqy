export const DYQY_PROJECT_NAME = '滇羽奇缘'
export const DYQY_INAT_PROJECT_ID = 'bfbdd5b3-26b5-4060-96c8-52a7680325dc'
export const DYQY_INAT_PROJECT_URL =
  'https://www.inaturalist.org/observations?project_id=bfbdd5b3-26b5-4060-96c8-52a7680325dc&verifiable=any&place_id=any'

export interface InatAreaBounds {
  key: string
  label: string
  swLat: number
  swLng: number
  neLat: number
  neLng: number
}

export const DYQY_INAT_AREAS: InatAreaBounds[] = [
  {
    key: 'shiticun',
    label: '石梯村',
    swLat: 24.368396272100135,
    swLng: 97.41173149005336,
    neLat: 24.612095034022097,
    neLng: 97.73720146075648,
  },
  {
    key: 'baihualing',
    label: '百花岭',
    swLat: 25.16091653207397,
    swLng: 98.6452325442706,
    neLat: 25.466307537478116,
    neLng: 98.8924249270831,
  },
]
