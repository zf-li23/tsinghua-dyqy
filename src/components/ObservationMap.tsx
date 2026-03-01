import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import type { InatAreaBounds } from '../config'
import type { InatObservation } from '../services/inat'

interface PondMarker {
  pondId: string
  label: string
  latitude: number
  longitude: number
  manualCount: number
  inatCount: number
}

interface ObservationMapProps {
  bounds: InatAreaBounds
  ponds: PondMarker[]
  inatPoints?: InatObservation[]
}

export function ObservationMap({ bounds, ponds, inatPoints = [] }: ObservationMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layersRef = useRef<L.LayerGroup | null>(null)
  const initializedRef = useRef(false)

  const pondMarkers = useMemo(
    () => ponds.filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)),
    [ponds],
  )

  const inatPointsWithCoords = useMemo(
    () =>
      inatPoints.filter(
        (item) => item.latitude !== null && item.longitude !== null,
      ),
    [inatPoints],
  )

  useEffect(() => {
    if (!mapElementRef.current) {
      return
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapElementRef.current)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map)

      layersRef.current = L.layerGroup().addTo(map)
    }

    initializedRef.current = true
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !initializedRef.current) {
      return
    }
    map.fitBounds(
      [
        [bounds.swLat, bounds.swLng],
        [bounds.neLat, bounds.neLng],
      ],
      { padding: [12, 12] },
    )
  }, [bounds])

  useEffect(() => {
    const map = mapInstanceRef.current
    const markerLayer = layersRef.current

    if (!map || !markerLayer) {
      return
    }

    markerLayer.clearLayers()

    pondMarkers.forEach((item) => {
      const totalCount = item.manualCount + item.inatCount
      const radius = Math.max(6, Math.min(14, 6 + Math.log1p(totalCount)))
      const marker = L.circleMarker([item.latitude, item.longitude], {
        radius,
        color: '#0f766e',
        fillColor: '#0f766e',
        fillOpacity: 0.85,
      })

      marker.bindPopup(
        `<strong>${item.label}</strong><br/>鸟塘：${item.pondId}<br/>人工记录：${item.manualCount} 条<br/>iNat 归并：${item.inatCount} 条`,
      )

      marker.addTo(markerLayer)
    })

    inatPointsWithCoords.forEach((item) => {
      const marker = L.circleMarker([item.latitude as number, item.longitude as number], {
        radius: 4,
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.8,
      })

      marker.bindPopup(
        `<strong>${item.speciesName}</strong><br/>${item.commonName || '暂无中文名'}<br/>观察者：${item.userLogin}<br/><a href="${item.uri}" target="_blank" rel="noreferrer">打开 iNat 记录</a>`,
      )

      marker.addTo(markerLayer)
    })
  }, [bounds, pondMarkers, inatPointsWithCoords])

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="map-wrap">
      <div ref={mapElementRef} className="inat-map" />
    </div>
  )
}
