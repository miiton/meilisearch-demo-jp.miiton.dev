import dynamic from 'next/dynamic'
import React from 'react'
import 'leaflet/dist/leaflet.css'

export const Map = () => {
  const MapComponent = React.useMemo(
    () =>
      dynamic(() => import('./map-component'), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    [],
  )
  return <MapComponent />
}
