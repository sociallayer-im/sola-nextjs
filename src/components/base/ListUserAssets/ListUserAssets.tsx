import React, {ReactNode, useEffect, useImperativeHandle, useState} from 'react'
import useScrollToLoad from "../../../hooks/scrollToLoad";
import Empty from "../EmptySmall";
import AppButton from "../AppButton/AppButton";

export interface ListUserAssetsMethods {
    refresh: (msg?: string) => any
}

export interface ListUserAssetsProps<T> {
    queryFcn: (page: number) => Promise<T[]>,
    child: (item: T, key: any) => ReactNode
    onRef?: React.RefObject<ListUserAssetsMethods>
    queryFunction?: (page: number) => Promise<T[]>
    sortFunction?: (list: T[]) => T[]
    emptyText?: string
    immediate?: boolean
    endEnhancer?: () => ReactNode
    preEnhancer?: () => ReactNode
    compact?: boolean
    onload?: (data:T[]) => any
    previewCount?: number,
    manual?: boolean
}

function ListUserAssets<T>(props: ListUserAssetsProps<T>) {
    const {isEmpty, list, ref, refresh, loading} = useScrollToLoad<T>({
        queryFunction: props.queryFcn || function (page: number) {
            return Promise.resolve([])
        },
        immediate: props.immediate
    })

    const [isPreview, setIsPreview] = useState<boolean>(true)
    const [listData, setListData] = useState<T[]>(list)
    const previewCount = typeof window === 'undefined'
        ? (props.previewCount || 4)
        : (window.innerWidth <= 450 ? (props.previewCount || 4) : (props.previewCount || 6))

    useImperativeHandle(props.onRef, () => {
        // 需要将暴露的接口返回出去
        return {refresh}
    })


    useEffect(() => {
        // 处理排序
        const sortedList = props.sortFunction ? props.sortFunction(list) : list

        // 如果是preview，只显示前四个
        setListData(isPreview ? sortedList.slice(0, previewCount) : sortedList)
        props.onload && props.onload(sortedList)
    }, [list])


    return <>
        {isEmpty && !props.preEnhancer && !props.endEnhancer
            ? <Empty text={props.emptyText || 'No data'}/>
            : <div className={props.compact ? 'user-assets-list compact' : 'user-assets-list'}>
                <div className={'list-content'}>
                    { !!props.preEnhancer && props.preEnhancer()}

                    {
                        listData.map((item, index) => {
                            return props.child(item, index)
                        })
                    }

                    <div ref={ isPreview ? undefined : ref}></div>

                    { !!props.endEnhancer && props.endEnhancer() }
                </div>
                { isPreview && list.length > previewCount &&
                    <div className={'list-action'}>
                        <AppButton kind={'secondary'} size={'compact'} onClick={() => {
                            setIsPreview(false)
                        }}>Show more</AppButton>
                    </div>
                }
            </div>
        }
    </>
}

export default ListUserAssets
