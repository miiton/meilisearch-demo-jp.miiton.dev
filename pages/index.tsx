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
    if (meiliEndpoint) {
      const c = instantMeiliSearch(meiliEndpoint, 'fb6faf8e3a411e656e1ec3515968556d1ed35711b6d7e92a7528425eac9520c7')
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
        <meta name="description" content="Meilisearch example in Japanese" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="max-h-screen overflow-hidden">
        <header className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="font-bold p-4">Meiliseach example in Japanese</h1>
            <p className="p-4 text-xs">
              データの出典:{' '}
              <a href="https://kunishitei.bunka.go.jp/bsys/index" className="link link-primary">
                国指定文化財等データベース
              </a>
              ( The source of the data is the Agency for Cultural Affairs in Japan )
              <span className="mx-4">35,578 documents available</span>
            </p>
          </div>
          <div className="font-mono px-4">Meilisearch docker image: getmeili/meilisearch:prototype-japanese-0</div>
        </header>
        <InstantSearch indexName="cultural-properties" searchClient={searchClient}>
          <div className="flex">
            <div className="basis-[400px] shrink-0 overflow-y-scroll" style={{ height: 'calc(100vh - 50px)' }}>
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
                  attribute="category1"
                  classNames={{
                    label: 'flex items-center',
                    labelText: 'text-sm',
                    checkbox: 'checkbox checkbox-xs rounded-sm mr-1',
                    count: 'badge badge-sm badge-outline text-xs ml-1',
                  }}
                />
              </div>
              <div className="p-4">
                <div className="font-bold">種別1(Categoty1)</div>
                <RefinementList
                  attribute="category2"
                  classNames={{
                    label: 'flex items-center',
                    labelText: 'text-sm',
                    checkbox: 'checkbox checkbox-xs rounded-sm mr-1',
                    count: 'badge badge-sm badge-outline text-xs ml-1',
                  }}
                />
              </div>
              <div className="p-4">
                <div className="font-bold">種別2(Category2)</div>
                <RefinementList
                  attribute="category3"
                  classNames={{
                    label: 'flex items-center',
                    labelText: 'text-sm',
                    checkbox: 'checkbox checkbox-xs rounded-sm mr-1',
                    count: 'badge badge-sm badge-outline text-xs ml-1',
                  }}
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
                  }}
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
                  }}
                />
              </div>
            </div>
            <div className="grow overflow-y-scroll px-4" style={{ height: 'calc(100vh - 50px)' }}>
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
      <div className="p-2 hover:bg-base-300">
        <Highlight attribute="name" hit={hit} className="font-bold" />
        <div className="flex">
          {hit.building !== null && <Attribute label="棟名" value={<Highlight attribute="building" hit={hit} />} />}
          {hit.category1 !== null && (
            <Attribute label="文化財種類" value={<Highlight attribute="category1" hit={hit} />} />
          )}
          {hit.category2 !== null && <Attribute label="種別1" value={<Highlight attribute="category2" hit={hit} />} />}
          {hit.category3 !== null && <Attribute label="種別2" value={<Highlight attribute="category3" hit={hit} />} />}
          {hit.country !== null && <Attribute label="国" value={<Highlight attribute="country" hit={hit} />} />}
          {hit.age !== null && <Attribute label="時代" value={<Highlight attribute="age" hit={hit} />} />}
          {hit.important_cultural_property_timestamp !== null && (
            <Attribute
              label="重文指定年月"
              value={dayjs.unix(hit.important_cultural_property_timestamp).format('YYYY年MM月')}
            />
          )}
          {hit.national_treasure_date !== null && (
            <Attribute label="国宝指定年月" value={dayjs.unix(hit.national_treasure_timestamp).format('YYYY年MM月')} />
          )}
          {hit.prefecture !== null && (
            <Attribute label="都道府県" value={<Highlight attribute="prefecture" hit={hit} />} />
          )}
          {hit.address !== null && <Attribute label="所在地" value={<Highlight attribute="address" hit={hit} />} />}
          {hit.storage !== null && (
            <Attribute label="保管施設の名称" value={<Highlight attribute="storage" hit={hit} />} />
          )}
          {hit.owner !== null && <Attribute label="所有者名" value={<Highlight attribute="owner" hit={hit} />} />}
          {hit.administrator !== null && (
            <Attribute label="管理者団体又は責任者" value={<Highlight attribute="administrator" hit={hit} />} />
          )}
          {hit._geo !== null && <Attribute label="緯度経度" value={hit._geo} />}
        </div>
      </div>
    </a>
  )
}

const Attribute = ({ label, value }: { label: string; value: any }) => {
  return (
    <div className="text-sm">
      <strong className="p-1 border bg-base-200">{label}:</strong>
      <span className="p-1 border mr-1">{value}</span>
    </div>
  )
}
