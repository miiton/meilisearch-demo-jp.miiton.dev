import React from 'react'
import axios from 'axios'
import { prettyPrintJson } from 'pretty-print-json'

type Props = {}

export const ShowStats = (props: Props) => {
  const [stats, setStats] = React.useState<any>({})
  React.useEffect(() => {
    axios({
      method: 'get',
      url: `${process.env.NEXT_PUBLIC_MEILI_ENDPOINT}/indexes/cultural-properties/stats`,
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MEILI_API_KEY}`,
      },
    }).then((res) => {
      setStats(res.data)
    })
  }, [])
  return (
    <>
      <input type="checkbox" id="stats" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg shrink-0 grow-0 pb-2">Stats</h3>
          <div className="overflow-y-scroll grow">
            <pre
              className="json-container text-sm"
              dangerouslySetInnerHTML={{ __html: prettyPrintJson.toHtml(stats, { indent: 2 }) }}
            />
          </div>
          <div className="modal-action shrink-0 grow-0">
            <label htmlFor="stats" className="btn btn-sm btn-outline">
              Close
            </label>
          </div>
        </div>
      </div>
    </>
  )
}
