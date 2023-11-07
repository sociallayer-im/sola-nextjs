import React, {ReactNode, useEffect, useState} from 'react'
import {NftDetail} from "@/service/alchemy/alchemy";
import AppButton from "@/components/base/AppButton/AppButton";
import Empty from "@/components/base/EmptySmall";

function MaodaoNftList<T>(props: {
    hasPageKey?: boolean,
    queryFn: (props: { page: number, pageKey: string }) => any,
    item: (item: T, key: any) => ReactNode
}) {
    const [page, setPage] = useState(1)
    const [isEmpty, setIsEmpty] = useState(false)
    const [isLoadAll, setIsLoadAll] = useState(false)
    const [list, setList] = useState<T[]>([])
    const [pageKey, setPagekey] = useState('')

    const getNft = async () => {
        if (props.hasPageKey) {
            const res = await props.queryFn({pageKey: pageKey, page} as any) as { list: T[], pageKey: string }
            if (res.list.length === 0 && !pageKey) {
                setIsEmpty(true)
            }
            if (res.list.length === 0 && pageKey) {
                setIsEmpty(true)
            }

            setPagekey(res.pageKey)
            setList([...list, ...res.list])
        } else {
            const res = await props.queryFn({page: page, pageKey: ''} as any) as T[]
            if (res.length === 0 && page === 1) {
                setIsEmpty(true)
            }
            if (res.length === 0 && page !== 1) {
                setIsLoadAll(true)
            }
            setList([...list, ...res])
        }
    }

    useEffect(() => {
        getNft()
    }, [page])

    return (<div className={'user-assets-list'}>
        <div className={'list-content'}>
            {
                list.map((item: any, index: number) => {
                    return props.item(item, index)
                })
            }
            {!isEmpty && !isLoadAll &&
                <div className={'list-action'} style={{maxWidth: 'initial'}}>
                    <AppButton kind={'secondary'} size={'compact'} onClick={() => {
                        setPage(page + 1)
                    }}>Show more</AppButton>
                </div>
            }
            {
                isEmpty && <Empty/>
            }
        </div>
    </div>)
}

export default MaodaoNftList
