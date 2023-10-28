import {createContext, useEffect, useRef} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'

export const PageBackContext = createContext({
    back: (): any => {
    },
    cleanCurrentHistory: (): any => {
    },
    history: [] as string[]
})

interface PageBacProviderProps {
    children: any
}

function PageBacProvider(props: PageBacProviderProps) {
    const router = useRouter()
    const routerPathname = usePathname()
    const searchParams = useSearchParams()
    const history = useRef<string[]>([])

    // 监听路由，获得浏览历史
    useEffect(() => {
        const currPathname = location.href.replace(location.origin, '')
        // console.log('==== currPathname', currPathname)
        if (currPathname === '/') {
            // 首页没有返回按钮, 返回首页将会清空历史记录，防止历史记录过长
            history.current = ['/']
        } else if (history.current.length === 0) {
            history.current.push(currPathname)
            // console.log('page change to=====>', currPathname, history.current)
        } else if (history.current[history.current.length - 1] !== currPathname) {
            history.current.push(currPathname)
            // console.log('page change to=====>', currPathname, history.current)
        } else {
            // console.log('same page=====>', currPathname, history.current)
        }
    }, [routerPathname, searchParams])

    // 返回上一页
    const back = () => {
        const _history = [...history.current]

        // 点击返回时候处理上一页
        const findLastPage = (historyList: string[]) => {
            // 如果当前页面是第一个页面，就返回首页。比如直接访问活动详情页，点击返回则返回首页
            if (historyList.length === 1) {
                history.current = []
                router.push('/')
                return
            }

            const currPathname = location.href.replace(location.origin, '')
            const index = historyList.findLastIndex((item, index) => {
                // 下面列表的页面不能通过返回按钮访问
                return item !== currPathname
                    && !item.includes('create')
                    && !item.includes('edit')
                    && !item.includes('regist')
                    && !item.includes('login')
                    && !item.includes('checkin')
                    && !item.includes('success')
            })

            if (index === -1) {
                history.current = []
                router.push('/')
                return
            } else {
                const lastPage = historyList[index]
                history.current = historyList.slice(0, index)
                router.push(lastPage)
            }
        }

        findLastPage(_history)
    }

    const cleanCurrentHistory = () => {
        history.current.pop()
    }

    return (<PageBackContext.Provider value={{back, cleanCurrentHistory, history: history.current}}>
        {props.children}
    </PageBackContext.Provider>)
}

export default PageBacProvider
