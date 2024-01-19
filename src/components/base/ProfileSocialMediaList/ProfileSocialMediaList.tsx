import {useEffect, useState} from 'react'
import {Profile} from '../../../service/solas'
import useSocialMedia from "../../../hooks/socialMedia";
import fetch from "@/utils/fetch";

interface ProfileSocialMediaListProps {
    profile: Profile
}

function ProfileSocialMediaList(props: ProfileSocialMediaListProps) {
    const [sns, setSns] = useState('')
    const [active, setActive] = useState(false)
    const {url2Id, id2Url} = useSocialMedia()

    useEffect(() => {
        if (props.profile.address) {
            fetch.get({
                url: `https://sola.deno.dev/seedao/getname/${props.profile.address}`,
                data: {}
            })
                .then(res => {
                    if (res.data.domain) {
                        setSns(res.data.domain)
                    }
                })
                .catch(e => {
                })
        }
    }, [props.profile])


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
                && !sns
            )
            || (
                !props.profile.twitter
                && !!props.profile.telegram
                && !props.profile.github
                && !props.profile.website
                && !props.profile.discord
                && !props.profile.nostr
                && !props.profile.ens
                && !sns
            )
            || (
                !props.profile.twitter
                && !props.profile.telegram
                && !!props.profile.github
                && !props.profile.website
                && !props.profile.discord
                && !props.profile.nostr
                && !props.profile.ens
                && !sns
            )
            || (
                !props.profile.twitter
                && !props.profile.telegram
                && !props.profile.github
                && !!props.profile.website
                && !props.profile.discord
                && !props.profile.nostr
                && !props.profile.ens
                && !sns
            ) || (
                !props.profile.twitter
                && !props.profile.telegram
                && !props.profile.github
                && !props.profile.website
                && !!props.profile.discord
                && !props.profile.nostr
                && !props.profile.ens
                && !sns
            ) || (
                !props.profile.twitter
                && !props.profile.telegram
                && !props.profile.github
                && !props.profile.website
                && !props.profile.discord
                && !!props.profile.nostr
                && !props.profile.ens
                && !sns
            ) || (
                !props.profile.twitter
                && !props.profile.telegram
                && !props.profile.github
                && !props.profile.website
                && !props.profile.discord
                && !props.profile.nostr
                && !!props.profile.ens
                && !sns
            ) || (
                !props.profile.twitter
                && !props.profile.telegram
                && !props.profile.github
                && !props.profile.website
                && !props.profile.discord
                && !props.profile.nostr
                && !props.profile.ens
                && !!sns
            )
        setActive(isOnlyOne)
    }, [props.profile, sns])

    return (<div className={active ? 'profile-social-media-list active' : 'profile-social-media-list'} onClick={() => {
        setActive(true)
    }}>
        {!!props.profile.twitter &&
            <div className='list-item'>
                <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden="true">
                    <g>
                        <path
                            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </g>
                </svg>
                <a href={id2Url(props.profile.twitter, 'twitter')}
                   target='_blank'>{url2Id(props.profile.twitter, 'twitter')}</a>
            </div>
        }
        {!!props.profile.telegram &&
            <div className='list-item'>
                <i className='icon-tg'></i>
                <a href={id2Url(props.profile.telegram, 'telegram')}
                   target='_blank'>{url2Id(props.profile.telegram, 'telegram')}</a>
            </div>
        }
        {!!props.profile.github &&
            <div className='list-item'>
                <i className='icon-github'></i>
                <a href={id2Url(props.profile.github, 'github')}
                   target='_blank'>{url2Id(props.profile.github, 'github')}</a>
            </div>
        }
        {!!props.profile.discord &&
            <div className='list-item'>
                <i className='icon-discord'></i>
                <a href={props.profile.discord} target='_blank'>{props.profile.discord}</a>
            </div>
        }
        {!!props.profile.website &&
            <div className='list-item'>
                <i className='icon-web'></i>
                <a href={props.profile.website} target='_blank'>{props.profile.website}</a>
            </div>
        }
        {!!props.profile.ens &&
            <div className='list-item'>
                <i className='icon-ens'></i>
                <a href={id2Url(props.profile.ens, 'ens')} target='_blank'>{url2Id(props.profile.ens, 'ens')}</a>
            </div>
        }
        {!!props.profile.nostr &&
            <div className='list-item'>
                <i className='icon-web'></i>
                <a href={props.profile.nostr} target='_blank'>{props.profile.nostr}</a>
            </div>
        }
        {!!props.profile.lens &&
            <div className='list-item'>
                <i className='icon-lens'></i>
                <a href={id2Url(props.profile.lens, 'lens')} target='_blank'>{url2Id(props.profile.lens, 'lens')}</a>
            </div>
        }

        {!!sns &&
            <div className='list-item'>
                <svg fill="none" width="20" height="16"  viewBox="0 0 54 38"  xmlns="http://www.w3.org/2000/svg"
                     xmlnsXlink="http://www.w3.org/1999/xlink">
                    <clipPath id="a">
                        <path d="m0 0h182v38h-182z"/>
                    </clipPath>
                    <g clipPath="url(#a)">
                        <path
                            d="m53.0948 2.26654c-1.3362-2.457782-5.2984-2.926386-11.4614-1.357996-2.7093.688566-5.7053 1.735746-8.8492 3.079406-4.1194-1.64968-8.6134-1.5684-12.6727.24386-4.101 1.83138-7.2726 5.20247-8.9232 9.49639-.8322 2.1661-1.22518 4.4326-1.1882 6.6944-1.80311 1.511-3.42593 3.0172-4.82219 4.4852-4.443085 4.6813-6.075144 8.4444-4.711242 10.8879 1.363902 2.4434 5.330772 2.8642 11.475232 1.2241 5.0858-1.358 11.1748-3.9975 17.3424-7.4977.4022-.2295.8784-.2678 1.3038-.0956.5687.2295 1.1142.6359 1.7291 1.2384l1.1004 1.3819-.6057-1.6783c-.4808-2.0562-.1895-3.1799 1.2206-4.7148l1.3362-1.138-1.6182.6312c-1.9881.4973-3.0746.196-4.5587-1.2624l-1.1003-1.3819.6056 1.6784c.2543 1.0902.2913 1.9174.0601 2.6873-.1156.3825-.3837.6933-.7258.8846-3.3289 1.8792-6.6254 3.4954-9.7369 4.7817-2.1499-1.5589-3.9207-3.7297-5.0349-6.4075-3.2086-7.6937.2219-16.6211 7.661-19.93958-3.7172 1.65924-5.4325 6.12058-3.8282 9.96978 1.6043 3.8445 5.9179 5.6185 9.6398 3.9592 3.7727-1.6831 8.1649.1674 9.7091 4.1362 1.5304 3.9305-.5039 8.411-4.3136 9.9746-2.8249 1.1571-5.807 1.3436-8.581.6981-.9848.459-1.9557.8942-2.9082 1.3006 1.9742.7986 4.0363 1.2002 6.0983 1.2002 2.247 0 4.4939-.4734 6.6207-1.4249 7.0923-3.1655 10.9944-10.8353 9.9264-18.3904 1.8633-1.5157 3.5369-3.0315 4.9748-4.5139 4.4986-4.62384 6.1722-8.37268 4.8361-10.83046zm-37.0612 31.15746c-1.6089.5977-3.1577 1.0997-4.6187 1.4918-5.7839 1.5445-8.50708.9086-9.12661-.2056-.61954-1.1141.20805-3.8731 4.39222-8.2771 1.05876-1.1141 2.2516-2.2473 3.55999-3.3949.222 1.334.6011 2.6538 1.1328 3.9305 1.0633 2.5438 2.6584 4.7386 4.6603 6.4553zm26.751-18.18c-.1895-.6646-.4161-1.3245-.6889-1.9796-1.0634-2.5439-2.6584-4.74342-4.665-6.46005-2.4365.90852-5.021 2.04178-7.6748 3.37105-.6704.3348-1.2067.9038-1.5072 1.6067-.5502 1.291-.5502 2.6395-.111 4.5139l.8969 2.4769-1.6228-2.037c-2.1868-2.1518-3.7912-2.5965-6.7224-1.8649l-2.3949.9277 1.9696-1.6784c2.0805-2.2617 2.5105-3.921 1.8031-6.95254l-.897-2.48169 1.6228 2.03699c1.2669 1.24802 2.3349 1.91746 3.5832 2.12307.6288.10041 1.2714-.02869 1.8447-.31559 2.4412-1.24324 4.8361-2.33346 7.1293-3.24198-.0046-.00478-.0093-.00478-.0139-.00956 2.4042-.95634 4.6928-1.72141 6.7964-2.25695 5.8024-1.47754 8.5163-.80811 9.1266.3108.6103 1.11892-.2497 3.86838-4.4847 8.22445-1.1743 1.2098-2.5151 2.4483-3.99 3.6867z"
                            fill="#000"/>
                    </g>
                </svg>
                <a>{sns}</a>
            </div>
        }
    </div>)
}

export default ProfileSocialMediaList
