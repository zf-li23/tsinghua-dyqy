export interface PondSite {
  pondId: string;
  villages: string[];
  years: number[];
  coordinateStatus: 'valid' | 'missing' | 'ambiguous' | 'invalid';
  canonicalCoordinate?: {
    latitude: number;
    longitude: number;
    selectedFromYear?: number;
    selectedFromRawText?: string;
    elevationMeters?: number;
  };
}

export interface PondSitesFile {
  generatedAt?: string;
  source?: unknown;
  summary?: unknown;
  ponds: PondSite[];
}

export interface ManualSpeciesCount {
  year: number;
  speciesName: string;
  count: string;
}

export interface PondRecordEntry {
  pondId: string;
  villages: string[];
  years: number[];
  hasCanonicalCoordinate: boolean;
  latestInatSync: {
    radiusMeters: number;
    syncedAt: string | null;
    observationsCount: number;
  };
  manualSpeciesCounts: ManualSpeciesCount[];
  surveyEvents: unknown[];
  notes: unknown[];
  attachments: unknown[];
}

export interface PondRecordSpaceFile {
  generatedAt?: string;
  sourcePondSitesFile?: string;
  schemaVersion?: number;
  records: PondRecordEntry[];
}

export interface PondInatObservation {
  observationId: number;
  uri: string;
  observedOn: string;
  latitude: number;
  longitude: number;
  userLogin: string;
  taxonId: number;
  speciesName: string;
  commonName: string | null;
  distanceMeters: number;
}

export interface PondInatAssignment {
  pondId: string;
  villages: string[];
  radiusMeters: number;
  observations: PondInatObservation[];
}

export interface PondInatAssignmentsFile {
  generatedAt?: string;
  source?: unknown;
  summary?: unknown;
  ponds: PondInatAssignment[];
}
