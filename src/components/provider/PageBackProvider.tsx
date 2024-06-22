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
        scroll: number
    }[]>([])


    useEffect(() => {
        const handleRouteChangeStart = () => {
            const scrollHeight = document.querySelector('#PageContent')!.scrollTop
            if (scrollHeight === 0) return
            const path = location.href.replace(location.origin, '')
            const _scroll = scrollRef.current.find(item => item.path !== path)

            if (!_scroll) {
                scrollRef.current = [...scrollRef.current, {
                    path: path,
                    scroll: scrollHeight
                }]

                console.log('setScroll', scrollRef.current)
            }
        }

        clientRouter.events.on('routeChangeStart', handleRouteChangeStart);

        return () => {
            clientRouter.events.off('routeChangeStart', handleRouteChangeStart);
        };
    }, [clientRouter]);

    const applyScroll = () => {
        const pageContent = document.querySelector('#PageContent')
        const path = location.href.replace(location.origin, '')
        if (scrollRef.current.length && !!pageContent) {
            const scrollHeight = scrollRef.current.find(item => item.path === path)
            console.log('target scrollHeight', scrollRef.current, scrollHeight)
            if (scrollHeight) {
                pageContent.scrollTop = scrollHeight.scroll
                scrollRef.current = scrollRef.current.filter(item => item.path !== path)
                console.log('applyScroll', scrollRef.current)
            }
        }
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
