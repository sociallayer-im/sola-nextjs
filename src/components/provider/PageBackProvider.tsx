import {createContext, useEffect, useRef} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useRouter as useClientRouter} from 'next/router';

export const PageBackContext = createContext({
    back: (): any => {
    },
    applyScroll: (): any => {
    }
})

interface PageBacProviderProps {
    children: any
}

function PageBacProvider(props: PageBacProviderProps) {
    const router = useRouter()
    const clientRouter = useClientRouter()
    const routerPathname = usePathname()
    const searchParams = useSearchParams()
    const currPathnameRef = useRef('')
    const scrollRef = useRef<{
        path: string,
        scroll: number,
        scheduleScroll: number
    }[]>([])


    useEffect(() => {
        const handleRouteChangeStart = () => {

            const path = location.href.replace(location.origin, '')
            const scheduleContent = document.querySelector('.event-wrapper')
            const pageContent  = document.querySelector('#PageContent')

            let scrollRecord = {
                path: path,
                scroll: 0,
                scheduleScroll: 0
            }

            if (!!pageContent) {
                scrollRecord.scroll = pageContent.scrollTop
                console.log('setScroll', scrollRef.current)
            }

            if (!!scheduleContent) {
                scrollRecord.scheduleScroll = scheduleContent!.scrollTop
                console.log('set schedule Scroll', scrollRef.current)
            }

            scrollRef.current = [...scrollRef.current, scrollRecord]
            console.log('set schedule Scroll', scrollRef.current)
        }

        clientRouter.events.on('routeChangeStart', handleRouteChangeStart);

        return () => {
            clientRouter.events.off('routeChangeStart', handleRouteChangeStart);
        };
    }, [clientRouter]);

    const applyScroll = () => {
        const pageContent = document.querySelector('#PageContent')
        const scheduleContent = document.querySelector('.event-wrapper')
        const path = location.href.replace(location.origin, '')
        const scrollHeight = scrollRef.current.find(item => item.path === path)

        if (!scrollHeight) return

        if (scrollRef.current.length && !!pageContent) {
            console.log('target scrollHeight', scrollRef.current, scrollHeight)
            pageContent.scrollTop = scrollHeight.scroll
            console.log('applyScroll', scrollRef.current)
        }

        if (scrollRef.current.length && !!scheduleContent) {
            scheduleContent.scrollTop = scrollHeight.scheduleScroll
            console.log('apply schedule Scroll', scrollRef.current)
        }

        scrollRef.current = scrollRef.current.filter(item => item.path !== path)
    }

    const readHistory = () => {
        if (typeof window === 'undefined') return []
        try {
            const history = window.sessionStorage.getItem('history')
            if (history) {
                return JSON.parse(history)
            } else {
                return []
            }
        } catch (e) {
            window.sessionStorage.setItem('history', '[]')
            return []
        }
    }
    const history = useRef<string[]>(readHistory())

    // 监听路由，获得浏览历史
    useEffect(() => {
        const watchPopState = () => {
            const patch = location.href.replace(location.origin, '')
            router.push(patch)
        }
        window.addEventListener('popstate', watchPopState)

        if (routerPathname !== currPathnameRef.current) {
            currPathnameRef.current = routerPathname as string
            const pageContent = document.querySelector('#PageContent')
            pageContent?.scrollTo(0, 0)
        }

       return () => {
           window.removeEventListener('popstate', watchPopState)
       }

    }, [routerPathname, searchParams])

    // 返回上一页
    const back = () => {
        if (window.history.length < 2) {
            router.push('/')
        } else {
            router.back()
        }
    }

    return (<PageBackContext.Provider value={{applyScroll, back}}>
        {props.children}
    </PageBackContext.Provider>)
}

export default PageBacProvider
