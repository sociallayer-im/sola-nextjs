import {useEffect, useRef, useState} from 'react'
import { useInView } from 'react-intersection-observer'

interface useScrollToLoadProps<T> {
    queryFunction: (page: number) => T[] | Promise<T[]>
    immediate?: boolean
}

function useScrollToLoad<T> (props: useScrollToLoadProps<T>) {
    const [list, setList] = useState<any[]>([])
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [isEmpty, setIsEmpty] = useState(false)
    const hasMore = useRef(true)
    const { ref, inView } = useInView({
        threshold: 0
    })


    const query = async (init = false) => {
        const isInit = page === 1
        setLoading(true)

        try {
            const newData = await props.queryFunction(page)
            if (!newData.length) {
                hasMore.current = false
            }

            if ( isInit && !newData.length) {
                setIsEmpty(true)
            }
            setList((pre) => {
                return isInit ? newData : [...pre, ...newData]
            } )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (props.immediate) {
            query(true)
        }
    }, [props.immediate])

    useEffect(() => {
        if (page) {
            query()
        }
    }, [page])

    useEffect(() => {
        if (inView && hasMore.current && !loading) {
            setPage((pre) => pre + 1)
        }
    }, [inView])

    const refresh = () => {
        setIsEmpty(false)
        hasMore.current = true
        setPage(0)
        setTimeout(() => {
            setPage(1)
        }, 300)
    }

    return {
        page,
        loading,
        isEmpty,
        list,
        ref,
        inView,
        refresh
    }
}

export default useScrollToLoad
