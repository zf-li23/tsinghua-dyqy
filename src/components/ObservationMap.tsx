import { MapContainer, Popup, TileLayer, CircleMarker } from 'react-leaflet'
import type { InatAreaBounds } from '../config'
import type { InatObservation } from '../services/inat'

interface ObservationMapProps {
  bounds: InatAreaBounds
  observations: InatObservation[]
}

export function ObservationMap({ bounds, observations }: ObservationMapProps) {
  const points = observations.filter(
    (item) => item.latitude !== null && item.longitude !== null,
  )

  return (
    <div className="map-wrap">
      <MapContainer
        key={bounds.key}
        bounds={[
          [bounds.swLat, bounds.swLng],
          [bounds.neLat, bounds.neLng],
        ]}
        scrollWheelZoom
        className="inat-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((item) => (
          <CircleMarker
            key={item.id}
            center={[item.latitude as number, item.longitude as number]}
            radius={5}
            pathOptions={{ color: '#f36d00', fillColor: '#f36d00', fillOpacity: 0.85 }}
          >
            <Popup>
              <strong>{item.speciesName}</strong>
              <br />
              {item.commonName || '暂无中文名'}
              <br />
              观察者：{item.userLogin}
              <br />
              <a href={item.uri} target="_blank" rel="noreferrer">
                打开 iNat 记录
              </a>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
