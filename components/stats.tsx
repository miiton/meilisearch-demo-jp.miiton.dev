import { useEffect, useState } from 'react'
import { useConnector, useInstantSearch } from 'react-instantsearch-hooks-web'
import connectStats from 'instantsearch.js/es/connectors/stats/connectStats'

import type { StatsConnectorParams, StatsWidgetDescription } from 'instantsearch.js/es/connectors/stats/connectStats'

export type UseStatsProps = StatsConnectorParams

export function useStats(props?: UseStatsProps) {
  return useConnector<StatsConnectorParams, StatsWidgetDescription>(connectStats, props)
}

export function Stats(props: UseStatsProps) {
  const [statusIndicator, setStatusIndicator] = useState(<></>)
  const { status } = useInstantSearch()
  useEffect(() => {
    switch (status) {
      case 'idle':
        setStatusIndicator(<span className="badge badge-ghost">idle</span>)
        return
      case 'loading':
        setStatusIndicator(<span className="badge badge-info">loading</span>)
        return
      case 'stalled':
        setStatusIndicator(<span className="badge badge-success">stalled</span>)
        return
      case 'error':
        setStatusIndicator(<span className="badge badge-error">error</span>)
        return
    }
  }, [status])
  const { nbHits, areHitsSorted, nbSortedHits, nbPages, page, processingTimeMS, query } = useStats(props)

  return (
    <div className="px-2 font-mono flex">
      <div className="px-1 mr-2">{statusIndicator}</div>
      <span className="mr-2">nbHits: {nbHits}, </span>
      <span className="mr-2">processingTimeMS: {processingTimeMS}, </span>
      {/* <span className="mr-2">areHitsSorted: {areHitsSorted}, </span>
      <span className="mr-2">nbSortedHits: {nbSortedHits}, </span>
      <span className="mr-2">nbPages: {nbPages}, </span>
      <span className="mr-2">page: {page}, </span> */}
      <span className="mr-2">query: {query}</span>
    </div>
  )
}
