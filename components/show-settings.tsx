import React from 'react'
import axios from 'axios'
import { prettyPrintJson } from 'pretty-print-json'

type Props = {}

export const ShowSettings = (props: Props) => {
  const [settings, setSettings] = React.useState<any>({})
  React.useEffect(() => {
    axios({
      method: 'get',
      url: `${process.env.NEXT_PUBLIC_MEILI_ENDPOINT}/indexes/cultural-properties/settings`,
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MEILI_API_KEY}`,
      },
    }).then((res) => {
      setSettings(res.data)
    })
  }, [])
  return (
    <>
      <input type="checkbox" id="settings" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Settings</h3>
          <pre
            className="json-container text-sm"
            dangerouslySetInnerHTML={{ __html: prettyPrintJson.toHtml(settings, { indent: 2 }) }}
          />
          <div className="modal-action">
            <label htmlFor="settings" className="btn btn-sm btn-outline">
              Close
            </label>
          </div>
        </div>
      </div>
    </>
  )
}
