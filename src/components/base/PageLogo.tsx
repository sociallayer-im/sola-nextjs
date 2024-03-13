import {styled, useStyletron} from 'baseui'
import Link from 'next/link'
import HomePageSwitcher from "../compose/HomePageSwitcher/HomePageSwitcher";
import {ColorSchemeContext} from "@/components/provider/ColorSchemeProvider";
import {useContext, useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import UserContext from "@/components/provider/UserProvider/UserContext";


const isMaodao = process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao'

const Logo = styled('div', ({$theme}: any) => ({
    width: '174px',
    height: '32px',
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    flexDirection: 'row',
}))

function PageLogo() {
    const [css] = useStyletron()
    const {theme} = useContext(ColorSchemeContext)
    const [isMobile, setIsMobile] = useState(false)
    const pathname = usePathname()
    const {user} = useContext(UserContext)

    const imgStyle = {
        height: '32px',
        display: 'block',
        marginRight: '8px',
    }

    const svgStyle = {
        minWidth: '39px',
    }

    const splitStyle = {
        minWidth: '1px',
        height: '12px',
        backgroundColor: '#999',
        marginRight: '8px',
    }

    const seedaoLogo: any = {
        width: '54px',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }

    const setMobile = () => {
        setIsMobile(window.innerWidth <= 450)
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setMobile()
            window.addEventListener('resize', setMobile, false)
            return () => {
                window.removeEventListener('resize', setMobile, false)
            }
        }
    }, [])

    return (<Logo>
        {!isMaodao ?
            <>
                <Link href={'/'}>
                    {process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap' ?
                        <img className={css(imgStyle)}
                             src={"/images/zumap_logo.svg"}
                             style={{height: '20px', marginRight: '20px'}}
                             alt=""/>
                        : <img className={css(imgStyle)}
                               src={theme === 'light' ? "/images/header_logo.svg" : "/images/head_logo_dark.svg"}
                               alt=""/>
                    }
                </Link>
                { process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'seedao' &&
                    <Link className={css(seedaoLogo)} href={'/'}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1L5 5M9 9L5 5M5 5L9 1M5 5L1 9" stroke="#272928" strokeWidth="0.7"/>
                        </svg>
                        <img className={css(imgStyle)} src="/images/seedao.png" alt=""/>
                    </Link>
                }
                { process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'seedao' &&
                    <HomePageSwitcher/>
                }
                {/*<MapEntry/>*/}

                { !process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID &&
                    <Link href={'/'} className={(pathname?.includes('discover') || pathname === '/') ? 'nav-link active' : 'nav-link'}>Discover</Link>
                }

                <Link href={'/my-event'} className={pathname?.includes('my-event') ? 'nav-link active' : 'nav-link'}>My Events</Link>

            </>
            : <>
                <Link href={'/'} className={'maodao-logo'}>
                    <img className={css(imgStyle)}
                         src={theme === 'light' ? "/images/header_logo.svg" : "/images/head_logo_dark.svg"}
                         alt=""/>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1L5 5M9 9L5 5M5 5L9 1M5 5L1 9" stroke="#D6D8D7" strokeWidth="0.7"/>
                    </svg>
                    <img src="/images/maodao/maodao_logo.png" alt="" width={32} height={22}/>
                </Link>
                <HomePageSwitcher/>
            </>
        }
    </Logo>)
}

export default PageLogo
