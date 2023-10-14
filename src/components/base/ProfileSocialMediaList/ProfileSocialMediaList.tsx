import {useStyletron} from 'baseui'
import {useState, useContext, useEffect} from 'react'
import { Profile } from '../../../service/solas'
import useSocialMedia from "../../../hooks/socialMedia";

interface ProfileSocialMediaListProps {
    profile: Profile
}

function ProfileSocialMediaList(props: ProfileSocialMediaListProps) {
    const [css] = useStyletron()
    const [active, setActive] = useState(false)
    const {url2Id, id2Url} = useSocialMedia()


    useEffect(() => {
        // 判断是否只有一个社交媒体，是的话直接展开，否则收起
        const isOnlyOne =
            (
                !!props.profile.twitter
                && !props.profile.telegram
                && !props.profile.github
                && !props.profile.website
                && !props.profile.discord
                && !props.profile.nostr
                && !props.profile.ens
            )
            || (
                !props.profile.twitter
                && !!props.profile.telegram
                && !props.profile.github
                && !props.profile.website
                && !props.profile.discord
                && !props.profile.nostr
                && !props.profile.ens
            )
            || (
                !props.profile.twitter
                && !props.profile.telegram
                && !!props.profile.github
                && !props.profile.website
                && !props.profile.discord
                && !props.profile.nostr
                && !props.profile.ens
            )
            || (
                !props.profile.twitter
                && !props.profile.telegram
                && !props.profile.github
                && !!props.profile.website
                && !props.profile.discord
                && !props.profile.nostr
                && !props.profile.ens
            ) || (
                !props.profile.twitter
                && !props.profile.telegram
                && !props.profile.github
                && !props.profile.website
                && !!props.profile.discord
                && !props.profile.nostr
                && !props.profile.ens
            ) || (
                !props.profile.twitter
                && !props.profile.telegram
                && !props.profile.github
                && !props.profile.website
                && !props.profile.discord
                && !!props.profile.nostr
                && !props.profile.ens
            ) || (
                !props.profile.twitter
                && !props.profile.telegram
                && !props.profile.github
                && !props.profile.website
                && !props.profile.discord
                && !props.profile.nostr
                && !!props.profile.ens
            )
        setActive(isOnlyOne)
    }, [props.profile])

    return (<div className={ active ? 'profile-social-media-list active': 'profile-social-media-list' } onClick={() => { setActive(true)}}>
        { !!props.profile.twitter &&
            <div className='list-item' >
                <i className='icon-twitter'></i>
                <a href={id2Url(props.profile.twitter, 'twitter')} target='_blank'>{url2Id(props.profile.twitter, 'twitter')}</a>
            </div>
        }
        { !!props.profile.telegram &&
            <div className='list-item' >
                <i className='icon-tg'></i>
                <a href={id2Url(props.profile.telegram, 'telegram')} target='_blank'>{url2Id(props.profile.telegram, 'telegram')}</a>
            </div>
        }
        { !!props.profile.github &&
            <div className='list-item'>
                <i className='icon-github'></i>
                <a href={id2Url(props.profile.github, 'github')} target='_blank'>{ url2Id(props.profile.github, 'github') }</a>
            </div>
        }
        { !!props.profile.discord &&
            <div className='list-item'>
                <i className='icon-discord'></i>
                <a href={ props.profile.discord } target='_blank'>{ props.profile.discord }</a>
            </div>
        }
        { !!props.profile.website &&
            <div className='list-item'>
                <i className='icon-web'></i>
                <a href={ props.profile.website } target='_blank'>{ props.profile.website }</a>
            </div>
        }
        { !!props.profile.ens &&
            <div className='list-item'>
                <i className='icon-ens'></i>
                <a href={ id2Url(props.profile.ens, 'ens') } target='_blank'>{ url2Id(props.profile.ens, 'ens') }</a>
            </div>
        }
        { !!props.profile.nostr &&
            <div className='list-item'>
                <i className='icon-web'></i>
                <a href={ props.profile.nostr } target='_blank'>{ props.profile.nostr }</a>
            </div>
        }
        { !!props.profile.lens &&
            <div className='list-item'>
                <i className='icon-lens'></i>
                <a href={ id2Url(props.profile.lens, 'lens') } target='_blank'>{ url2Id(props.profile.lens, 'lens') }</a>
            </div>
        }
    </div>)
}

export default ProfileSocialMediaList
