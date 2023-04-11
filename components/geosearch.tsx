import React from 'react'
import { useConnector } from 'react-instantsearch-hooks-web'
import connectGeoSearch from 'instantsearch.js/es/connectors/geo-search/connectGeoSearch'

import type { BaseHit } from 'instantsearch.js'
import type {
  GeoSearchConnector,
  GeoSearchConnectorParams,
  GeoSearchWidgetDescription,
} from 'instantsearch.js/es/connectors/geo-search/connectGeoSearch'

export function useGeoSearch<THit extends BaseHit>(props?: any) {
  return useConnector<GeoSearchConnectorParams<THit>, GeoSearchWidgetDescription<THit>>(
    connectGeoSearch as GeoSearchConnector<THit>,
    props,
  )
}

type Props = {}

export const Geosearch = (props: Props) => {
  const g = useGeoSearch({ attribute: '_geo' })
  console.log(g)
  const searchByCurrentPosition = React.useCallback(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position.coords.latitude, position.coords.longitude)
    })
  }, [])

  if (!navigator.geolocation) return <></>
  return (
    <div className="p-4">
      <div className="font-bold mb-2">位置検索(Geosearch)</div>
      <button type="button" className="btn btn-sm" onClick={searchByCurrentPosition}>
        現在地(Current Pos)
      </button>
    </div>
  )
}
