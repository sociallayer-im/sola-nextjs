import {useState, useContext, useEffect} from 'react'
import LangContext from '../../provider/LangProvider/LangContext'
import { useRef } from 'react'

interface ProfileBioProps {
    text?: string
}
function ProfileBio(props:ProfileBioProps) {
    const { lang } = useContext(LangContext)
    const refWrapper = useRef<HTMLDivElement | null>(null)
    const refInner = useRef<HTMLDivElement | null>(null)
    const [showMoreBtn, setShowMoreBtn] = useState(false)
    const [active, setActive] = useState(false)

    useEffect(() => {
        setActive(false)
    }, [props.text])

    useEffect(() => {
        if (refWrapper.current && refInner.current) {
            const height = refInner.current.clientHeight
            setShowMoreBtn(height >= 54)
        }
    }, [refWrapper.current, refInner.current])

    useEffect(() => {
        if (refWrapper.current && refInner.current) {
            refWrapper.current.style.maxHeight = active ? refInner.current?.clientHeight + 18 + 'px' : '54px'
        }
    }, [active, refWrapper.current, refInner.current])

    return (<div className={ active ? 'profile-bio active' : 'profile-bio'} ref={ refWrapper }>
        <div ref={ refInner }>{ props.text }</div>
        { showMoreBtn &&
            <div className='show-more-btn'
                 onClick={ () => { setActive(!active)} }>
                { active ? lang['Profile_Bio_Less'] : lang['Profile_Bio_More'] }
            </div>
        }
    </div>)
}

export default ProfileBio
