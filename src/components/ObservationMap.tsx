import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import type { InatAreaBounds } from '../config'
import type { InatObservation } from '../services/inat'

interface ObservationMapProps {
  bounds: InatAreaBounds
  observations: InatObservation[]
}

export function ObservationMap({ bounds, observations }: ObservationMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layersRef = useRef<L.LayerGroup | null>(null)
  const initializedRef = useRef(false)

  const points = useMemo(
    () =>
      observations.filter(
        (item) => item.latitude !== null && item.longitude !== null,
      ),
    [observations],
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

    map.fitBounds([
      [bounds.swLat, bounds.swLng],
      [bounds.neLat, bounds.neLng],
    ])
  }, [bounds])

  useEffect(() => {
    const map = mapInstanceRef.current
    const markerLayer = layersRef.current

    if (!map || !markerLayer) {
      return
    }

    markerLayer.clearLayers()

    points.forEach((item) => {
      const marker = L.circleMarker([item.latitude as number, item.longitude as number], {
        radius: 5,
        color: '#f36d00',
        fillColor: '#f36d00',
        fillOpacity: 0.85,
      })

      marker.bindPopup(
        `<strong>${item.speciesName}</strong><br/>${item.commonName || '暂无中文名'}<br/>观察者：${item.userLogin}<br/><a href="${item.uri}" target="_blank" rel="noreferrer">打开 iNat 记录</a>`,
      )

      marker.addTo(markerLayer)
    })
  }, [bounds, points])

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
