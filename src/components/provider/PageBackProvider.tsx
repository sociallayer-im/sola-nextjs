import {useEffect, createContext, useRef} from 'react'
import { useRouter ,usePathname } from 'next/navigation'

export const PageBackContext = createContext({
    back: ():any => {},
    cleanCurrentHistory: ():any => {},
    history: [] as string[]
})

interface PageBacProviderProps {
    children: any
}

function PageBacProvider(props: PageBacProviderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const history = useRef<string[]>([pathname])

    useEffect(() => {
        if (history.current[history.current.length - 1] !== pathname) {
            history.current.push(pathname)
        }
    }, [pathname])

    const back = () => {
        if (history.current.length > 1) {
            history.current.pop()
            const target = history.current[history.current.length - 1]
            console.log('navigate target', target)
            router.push(target)
        }
    }

    const cleanCurrentHistory = () => {
        history.current.pop()
    }

    return (<PageBackContext.Provider value={{back, cleanCurrentHistory, history: history.current}}>
        {props.children}
    </PageBackContext.Provider>)
}

export default PageBacProvider
