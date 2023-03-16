import { useState, useEffect } from 'react'
import Head from 'next/head'
import { InstantSearch, SearchBox, RefinementList, InfiniteHits, Highlight } from 'react-instantsearch-hooks-web'
import { instantMeiliSearch, InstantMeiliSearchInstance } from '@meilisearch/instant-meilisearch'
import { Stats } from '@/components/stats'
import dayjs from 'dayjs'

export default function Home() {
  const [searchClient, setSearchClient] = useState<InstantMeiliSearchInstance>()

  useEffect(() => {
    const meiliEndpoint = process.env.NEXT_PUBLIC_MEILI_ENDPOINT
    const meiliApiKey = process.env.NEXT_PUBLIC_MEILI_API_KEY
    if (meiliEndpoint && meiliApiKey) {
      const c = instantMeiliSearch(meiliEndpoint, meiliApiKey)
      setSearchClient(c)
    }
  }, [])

  if (!searchClient) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Meilisearch example in Japanese</title>
        <meta name="description" content="Example of Meilisearch in Japanese" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="max-h-screen overflow-hidden">
        <header className="flex items-start justify-between shadow-sm h-[80px]">
          <div className="flex items-start">
            <h1 className="font-bold p-4">Example of Meiliseach in Japanese</h1>
            <p className="p-4 text-xs">
              データの出典:{' '}
              <a href="https://kunishitei.bunka.go.jp/bsys/index" className="link link-primary">
                国指定文化財等データベース
              </a>
              <br />
              <span>The source of the data is the Agency for Cultural Affairs in Japan</span> <br />
              <span>35,578 documents available</span>
            </p>
          </div>
          <div className="font-mono p-4 text-sm">
            [Meilisearch docker image]
            <br />
            getmeili/meilisearch:prototype-japanese-0
          </div>
        </header>
        <InstantSearch indexName="cultural-properties" searchClient={searchClient}>
          <div className="flex">
            <div className="basis-[400px] shrink-0 overflow-y-scroll" style={{ height: 'calc(100vh - 80px)' }}>
              <SearchBox
                classNames={{
                  root: 'p-4',
                  input: 'input input-bordered w-full',
                  submitIcon: 'hidden',
                  resetIcon: 'hidden',
                  loadingIcon: 'hidden',
                }}
                placeholder="keyword"
              />
              <div className="p-4">
                <div className="font-bold">文化財種類(Cultural property type)</div>
                <RefinementList
                  attribute="category_1"
                  classNames={{
                    label: 'flex items-center',
                    labelText: 'text-sm',
                    checkbox: 'checkbox checkbox-xs rounded-sm mr-1',
                    count: 'badge badge-sm badge-outline text-xs ml-1',
                    showMore: 'text-sm btn btn-ghost btn-xs',
                    root: 'flex flex-col items-center',
                    list: 'w-full',
                  }}
                  showMore={true}
                />
              </div>
              <div className="p-4">
                <div className="font-bold">種別1(Categoty1)</div>
                <RefinementList
                  attribute="category_2"
                  classNames={{
                    label: 'flex items-center',
                    labelText: 'text-sm',
                    checkbox: 'checkbox checkbox-xs rounded-sm mr-1',
                    count: 'badge badge-sm badge-outline text-xs ml-1',
                    showMore: 'text-sm btn btn-ghost btn-xs',
                    root: 'flex flex-col items-center',
                    list: 'w-full',
                  }}
                  showMore={true}
                />
              </div>
              <div className="p-4">
                <div className="font-bold">種別2(Category2)</div>
                <RefinementList
                  attribute="category_3"
                  classNames={{
                    label: 'flex items-center',
                    labelText: 'text-sm',
                    checkbox: 'checkbox checkbox-xs rounded-sm mr-1',
                    count: 'badge badge-sm badge-outline text-xs ml-1',
                    showMore: 'text-sm btn btn-ghost btn-xs',
                    root: 'flex flex-col items-center',
                    list: 'w-full',
                  }}
                  showMore={true}
                />
              </div>
              <div className="p-4">
                <div className="font-bold">国(Country)</div>
                <RefinementList
                  attribute="country"
                  classNames={{
                    label: 'flex items-center',
                    labelText: 'text-sm',
                    checkbox: 'checkbox checkbox-xs rounded-sm mr-1',
                    count: 'badge badge-sm badge-outline text-xs ml-1',
                    showMore: 'text-sm btn btn-ghost btn-xs',
                    root: 'flex flex-col items-center',
                    list: 'w-full',
                  }}
                  showMore={true}
                />
              </div>
              <div className="p-4">
                <div className="font-bold">時代(Age)</div>
                <RefinementList
                  attribute="age"
                  classNames={{
                    label: 'flex items-center',
                    labelText: 'text-sm',
                    checkbox: 'checkbox checkbox-xs rounded-sm mr-1',
                    count: 'badge badge-sm badge-outline text-xs ml-1',
                    showMore: 'text-sm btn btn-ghost btn-xs',
                    root: 'flex flex-col items-center',
                    list: 'w-full',
                  }}
                  showMore={true}
                />
              </div>
            </div>
            <div className="grow overflow-y-scroll px-4" style={{ height: 'calc(100vh - 80px)' }}>
              <Stats />
              <InfiniteHits
                hitComponent={Hit}
                classNames={{
                  root: 'w-full flex flex-col items-center',
                  list: 'w-full',
                  loadMore: 'btn btn-outline w-[200px] my-8',
                }}
                showPrevious={false}
                translations={{ showMoreButtonText: 'Load More' }}
              />
            </div>
          </div>
        </InstantSearch>
      </main>
    </>
  )
}
const Hit = ({ hit }: any) => {
  return (
    <a href={hit.link} target="_blank" rel="noopener noreferrer">
      <div className="px-2 py-4 hover:bg-base-300 border-t">
        <Highlight attribute="name" hit={hit} className="font-bold" />
        <p className="text-sm py-2">{hit.explain && <Highlight attribute="explain" hit={hit} />}</p>
        <div className="flex flex-wrap">
          {hit.building && hit.building !== null && (
            <Attribute label="棟名" value={<Highlight attribute="building" hit={hit} />} />
          )}
          {hit.category_1 && hit.category_1 !== null && (
            <Attribute label="文化財種類" value={<Highlight attribute="category_1" hit={hit} />} />
          )}
          {hit.category_2 && hit.category_2 !== null && (
            <Attribute label="種別1" value={<Highlight attribute="category_2" hit={hit} />} />
          )}
          {hit.category_3 && hit.category_3 !== null && (
            <Attribute label="種別2" value={<Highlight attribute="category_3" hit={hit} />} />
          )}
          {hit.country && hit.country !== null && (
            <Attribute label="国" value={<Highlight attribute="country" hit={hit} />} />
          )}
          {hit.age && hit.age !== null && <Attribute label="時代" value={<Highlight attribute="age" hit={hit} />} />}
          {hit.important_cultural_property_timestamp && hit.important_cultural_property_timestamp !== null && (
            <Attribute
              label="重文指定年月"
              value={dayjs.unix(hit.important_cultural_property_timestamp).format('YYYY年MM月')}
            />
          )}
          {hit.national_treasure_date && hit.national_treasure_date !== null && (
            <Attribute label="国宝指定年月" value={dayjs.unix(hit.national_treasure_timestamp).format('YYYY年MM月')} />
          )}
          {hit.prefecture && hit.prefecture !== null && (
            <Attribute label="都道府県" value={<Highlight attribute="prefecture" hit={hit} />} />
          )}
          {hit.address && hit.address !== null && (
            <Attribute label="所在地" value={<Highlight attribute="address" hit={hit} />} />
          )}
          {hit.storage && hit.storage !== null && (
            <Attribute label="保管施設の名称" value={<Highlight attribute="storage" hit={hit} />} />
          )}
          {hit.owner && hit.owner !== null && (
            <Attribute label="所有者名" value={<Highlight attribute="owner" hit={hit} />} />
          )}
          {hit.administrator && hit.administrator !== null && (
            <Attribute label="管理者団体又は責任者" value={<Highlight attribute="administrator" hit={hit} />} />
          )}
          {hit._geo && hit._geo !== null && <Attribute label="緯度経度" value={hit._geo} />}
        </div>
      </div>
    </a>
  )
}

const Attribute = ({ label, value }: { label: string; value: any }) => {
  return (
    <div className="text-sm my-1">
      <strong className="p-1 border bg-base-200 whitespace-nowrap">{label}:</strong>
      <span className="p-1 border mr-1 whitespace-nowrap">{value}</span>
    </div>
  )
}
