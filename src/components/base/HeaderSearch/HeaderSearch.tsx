import { useState, useContext, useEffect } from 'react'
import AppInput from '../AppInput'
import LangContext from '../../provider/LangProvider/LangContext'
import {useRouter, useParams} from "next/navigation";

interface HeaderSearchProps {
    onClose?: () => any
}


function HeaderSearch(props: HeaderSearchProps) {
    const router = useRouter()
    const [keyword, setKeyword] = useState('')
    const params = useParams()
    const { lang } = useContext(LangContext)

    useEffect(() => {
        params?.keyword && setKeyword(params?.keyword as string || '')
    }, [])

    const onConfirm = () => {
        if (!window.location.href.includes('/search/')) {
            window.localStorage.setItem('searchfallback', window.location.pathname + window.location.search)
        }

        router.push(`/search/${encodeURIComponent(keyword)}`)
    }

    const cancel = () => {
        !!props.onClose && props.onClose()
    }


    const ConfirmBtn = <div className='search-confirm-btn' onClick={ onConfirm }>
        <i className='icon-search'></i>
    </div>

    return (<div className='header-search'>
        <AppInput
            autoFocus={ true }
            value={ keyword }
            onKeyUp={ (e) => { if (e.keyCode === 13) { onConfirm() } } }
            endEnhancer={ () => ConfirmBtn }
            onChange={ (e) => { setKeyword(e.target.value) } }
        />
        <div className='search-cancel-btn' onClick={ cancel }>{ lang['Search_Cancel'] }</div>
    </div>)
}

export default HeaderSearch
