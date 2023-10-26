import PageHeader from '../compose/PageHeader'
import { useStyletron } from 'baseui'
import {useEffect, useContext} from 'react'
import usePageHeight from '../../hooks/pageHeight'
import userContext from "../provider/UserProvider/UserContext";
import { useRouter } from 'next/navigation'
import {ColorSchemeContext} from "@/components/provider/ColorSchemeProvider";



function Layout(props?: any) {
    const [css] = useStyletron()
    const { windowHeight, heightWithoutNav } = usePageHeight()
    const { user } = useContext(userContext)
    const { theme } = useContext(ColorSchemeContext)
    const router = useRouter()

    const wrapper = {
        width: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        height: `${windowHeight}px`
    }

    const content: any = {
        width: '100%',
        flex: 1,
        overflowX: 'hidden',
        height: `${heightWithoutNav}px`,
        touchAction: 'pan-y' as const
    }

    useEffect(() => {
        const watchSoftKeyboard = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
            window.scroll(0, scrollTop)
        }

        window.addEventListener('focusout', watchSoftKeyboard)
        window.addEventListener('orientationchange', watchSoftKeyboard)

        return () => {
            window.removeEventListener('focusout', watchSoftKeyboard)
            window.removeEventListener('orientationchange', watchSoftKeyboard)
        }
    }, [])

    // 如果用户已经登录，离开注册域名页面，将会被强制回到注册页面
    useEffect(() => {
        if (!user.domain && user.authToken && !window.location.href.includes('regist')) {
            router.push('/regist')
        }
    })

    useEffect(() => {
        document.getElementById('PageWrapper')!.style.height = `${windowHeight}px`
        document.getElementById('PageContent')!.style.height = `${heightWithoutNav}px`
    }, [windowHeight, heightWithoutNav])

    return (
        <div className={theme}>
            <div className={ css(wrapper) } id={'PageWrapper'}>
                <PageHeader />
                <div className={css(content)} id={'PageContent'}>
                    {props.children}
                </div>
            </div>
        </div>
    )
}

export default Layout
