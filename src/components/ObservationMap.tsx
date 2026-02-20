import { useEffect, useRef } from 'react'
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

  const points = observations.filter(
    (item) => item.latitude !== null && item.longitude !== null,
  )

  useEffect(() => {
    if (!mapElementRef.current) {
      return
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapElementRef.current)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      layersRef.current = L.layerGroup().addTo(map)
    }

    const map = mapInstanceRef.current
    const markerLayer = layersRef.current

    if (!map || !markerLayer) {
      return
    }

    map.fitBounds([
      [bounds.swLat, bounds.swLng],
      [bounds.neLat, bounds.neLng],
    ])

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
