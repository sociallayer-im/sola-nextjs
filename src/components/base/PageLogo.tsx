import { styled, useStyletron } from 'baseui'
import Link from 'next/link'
import HomePageSwitcher from "../compose/HomePageSwitcher/HomePageSwitcher";
import {ColorSchemeContext} from "@/components/provider/ColorSchemeProvider";
import {useContext} from "react";

const Logo = styled('div', ({ $theme }) => ({
    width: '174px',
    height: '32px',
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    flexDirection: 'row',
}))

function PageLogo () {
    const [css] = useStyletron()
    const {theme} = useContext(ColorSchemeContext)

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

    return (<Logo>
        <Link href={'/'}><img className={css(imgStyle)} src={theme=== 'light' ? "/images/header_logo.svg" : "/images/head_logo_dark.svg"} alt=""/></Link>
        <HomePageSwitcher />
    </Logo>)
}

export default PageLogo
