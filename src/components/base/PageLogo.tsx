import { styled, useStyletron } from 'baseui'
import Link from 'next/link'
import HomePageSwitcher from "../compose/HomePageSwitcher/HomePageSwitcher";

const Logo = styled('div', ({ $theme }) => ({
    width: '174px',
    height: '32px',
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: $theme.colors.contentPrimary,
    flexDirection: 'row',
}))

function PageLogo () {
    const [css] = useStyletron()
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

    const home = process.env.NEXT_PUBLIC_SOLAS_HOME
    return (<Logo>
        <Link href={'/'}><img className={css(imgStyle)} src="/images/header_logo.svg" alt=""/></Link>
        <HomePageSwitcher />
    </Logo>)
}

export default PageLogo
