import React from 'react'
import { LatLng } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
const DefaultIcon = L.icon({
  iconRetinaUrl: iconRetina.src,
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
})
import { useHits } from 'react-instantsearch-hooks-web'

L.Marker.prototype.options.icon = DefaultIcon

type Toriaezu = {
  id: string
  name: string
  _geo: {
    lat: number
    lng: number
  }
}

const Map = () => {
  const [bounds, setBounds] = React.useState<number[][]>([])
  const map = useMap()
  const { hits } = useHits()
  React.useEffect(() => {
    setBounds(
      hits
        .filter((hit) => {
          const item = hit as unknown as any
          if (item._geo) {
            return item._geo.lat !== '' && item._geo.lng !== ''
          }
          return false
        })
        .map((hit) => {
          const item = hit as unknown as Toriaezu
          return [Number(item._geo.lat), Number(item._geo.lng)]
        }),
    )
  }, [hits])

  React.useEffect(() => {
    if (bounds.length > 0 && map) {
      map.fitBounds(bounds as L.LatLngBoundsExpression)
    }
  }, [map, bounds])
  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
        url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
      />
      {hits
        .filter((hit) => {
          const item = hit as unknown as Toriaezu
          if (item._geo) {
            return true
          }
          return false
        })
        .map((hit) => {
          const item = hit as unknown as Toriaezu
          const pos = new LatLng(item._geo.lat, item._geo.lng)
          return (
            <Marker key={item.id} position={pos}>
              <Popup>{item.name}</Popup>
            </Marker>
          )
        })}
    </>
  )
}

const MapComponent = () => {
  const position = new LatLng(35.68, 139.76)
  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '360px', width: '100%' }}>
      <Map />
    </MapContainer>
  )
}

export default MapComponent
