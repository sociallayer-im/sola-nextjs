import './PageHeader.sass'
import LangSwitch from '../../base/LangSwitch'
import PageLogo from '../../base/PageLogo'
import LoginBtn from '../../base/LoginBtn'
import ProfileMenu from '../../base/ProfileMenu'
import HeaderSearch from '../../base/HeaderSearch/HeaderSearch'
import {useContext, useEffect, useState} from 'react'
import UserContext from '../../provider/UserProvider/UserContext'

function PageHeader () {
    const { user } = useContext(UserContext)
    const [showSearch, setShowSearch] = useState(false)

    useEffect(() => {
        if(window.location.href.includes('/search/')) {
            setShowSearch(true)
        }
    })

    return (
        <header className="pager-header">
            <PageLogo />
            <div className='pager-header-right-menu'>

                { showSearch &&
                    <div className="header-search">
                        <HeaderSearch onClose={() => { setShowSearch(false) }} />
                    </div>
                }

                { !showSearch &&
                    <>
                        <div className="header-search">
                            <i className='icon-search' onClick={() => { setShowSearch(true) } }></i>
                        </div>

                        <div className='split'></div>

                        <LangSwitch />

                        <div className='split'></div>

                        { !user.id ? <LoginBtn /> : <ProfileMenu />}
                    </>
                }
            </div>
        </header>
    )
}

export default PageHeader
