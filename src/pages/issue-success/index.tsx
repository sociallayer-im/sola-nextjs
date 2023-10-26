import {useSearchParams} from 'next/navigation'
import {useContext, useEffect, useState} from 'react'
import solas, {ProfileSimple, Group} from '../../service/solas'
import LangContext from '../../components/provider/LangProvider/LangContext'
import UserContext from '../../components/provider/UserProvider/UserContext'
import copy from '../../utils/copy'
import PageBack from '../../components/base/PageBack'
import usePicture from '../../hooks/pictrue'
import usePageHeight from '../../hooks/pageHeight'
import DialogsContext from "../../components/provider/DialogProvider/DialogsContext";
import ShareQrcode, {ShareQrcodeProp} from "../../components/compose/ShareQrcode/ShareQrcode";

function IssueSuccessPage() {
    const searchParams = useSearchParams()
    const [info, setInfo] = useState<ShareQrcodeProp | null>(null)
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const {defaultAvatar} = usePicture()
    const {heightWithoutNav} = usePageHeight()
    const {showToast} = useContext(DialogsContext)
    const [linkContent, setLinkContent] = useState('')
    const [group, setGroup] = useState<Group | null>(null)

    // presend成功传参
    const presendId = searchParams.get('presend')

    // 颁发成功传参
    const badgeletId = searchParams.get('badgelet')

    // 邀请成功传参
    const inviteId = searchParams.get('invite')
    const groupId = searchParams.get('group')

    // nftpass 颁发成功传参
    const nftpassletId = searchParams.get('nftpasslet')

    // presend成功传参
    const pointId = searchParams.get('point')
    const pointitemId = searchParams.get('pointitem')

    // gift成功传参
    const giftItemId = searchParams.get('giftitem')


    useEffect(() => {
        async function fetchInfo() {
            if (badgeletId) {
                const badgeletDetail = await solas.queryBadgeletDetail({id: Number(badgeletId)})

                setInfo({
                    sender: badgeletDetail.sender,
                    name: badgeletDetail.badge.name,
                    cover: badgeletDetail.badge.image_url,
                    link: genShareLink()
                })

                setGroup(badgeletDetail.badge.group || null)
            }

            if (presendId) {
                const presendDetail = await solas.queryPresendDetail({ id: Number(presendId), auth_token: user.authToken || '' })
                const sender = presendDetail.badge.sender
                setInfo({
                    name: presendDetail.badge.name,
                    cover: presendDetail.badge.image_url,
                    limit: presendDetail.badgelets.length + presendDetail.counter,
                    expires: presendDetail.expires_at,
                    link: genShareLink(presendDetail.code || undefined),
                    sender: sender as ProfileSimple
                })

                setGroup(presendDetail.group)
            }

            if (inviteId && groupId) {
                const inviteDetail = await solas.queryInviteDetail({
                    invite_id: Number(inviteId),
                    group_id: Number(groupId),
                    auth_token: user?.authToken || ''
                })
                if (!inviteDetail) return

                const receiver = await solas.getProfile({id: inviteDetail?.receiver_id})
                if (!receiver) return

                const group = await solas.queryGroupDetail(Number(groupId))
                if (!group) return

                setInfo({
                    sender: group as any,
                    name: group.username,
                    cover: group.image_url || defaultAvatar(group.id),
                    link: genShareLink(),
                })

                setGroup(group)
            }

            if (nftpassletId) {
                const badgeletDetail = await solas.queryBadgeletDetail({id: Number(nftpassletId)})

                setInfo({
                    sender: badgeletDetail.sender,
                    name: badgeletDetail.badge.name,
                    cover: badgeletDetail.badge.image_url,
                    link: genShareLink(),
                    start: badgeletDetail.starts_at || undefined,
                    expires: badgeletDetail.expires_at || undefined,
                    title: lang['Badgebook_Dialog_NFT_Pass']
                })

                setGroup(badgeletDetail.group)
            }

            if (pointId && pointitemId) {
                const point = await solas.queryPointDetail({id: Number(pointId)})
                const pointItem = await solas.queryPointItemDetail({id: Number(pointitemId)})

                setInfo({
                    sender: point.sender,
                    name: point.title,
                    cover: point.image_url,
                    link: genShareLink(),
                    points: pointItem.value,
                    title: lang['Badgebook_Dialog_Points']
                })

                setGroup(point.group)
            }

            if (giftItemId) {
                const badgeletDetail = await solas.queryBadgeletDetail({id: Number(giftItemId)})

                setInfo({
                    sender: badgeletDetail.sender,
                    name: badgeletDetail.badge.name,
                    cover: badgeletDetail.badge.image_url,
                    link: genShareLink(),
                    start: badgeletDetail.starts_at || undefined,
                    expires: badgeletDetail.expires_at || undefined,
                    title: lang['Badgebook_Dialog_Gift'],
                })

                setGroup(badgeletDetail.badge.group || null)
            }
        }

        fetchInfo()
    }, [user.authToken])

    const genShareLink = (presendCode?: string) => {
        const base = `${window.location.protocol}//${window.location.host}`
        let path = ''

        if (badgeletId) {
            path = `${base}/badgelet/${badgeletId}`
        }

        if (presendId) {
            path = `${base}/presend/${presendId}`
            if (presendCode) {
                path = path + '_' + presendCode
            }
        }

        if (inviteId && groupId) {
            path = `${base}/invite/${groupId}/${inviteId}`
        }

        if (nftpassletId) {
            path = `${base}/nftpasslet/${nftpassletId}`
        }

        if (pointId && pointitemId) {
            path = `${base}/pointitem/${pointitemId}`
        }

        if (giftItemId) {
            path = `${base}/giftitem/${giftItemId}`
        }

        return path
    }

    useEffect(() => {
        const shareUrl = info?.link || ''
        let text = lang['IssueFinish_share']
            .replace('#1', user.domain!)
            .replace('#2', info?.name || '')
            .replace('#3', shareUrl)

        if (group) {
            text = lang['Presend_Qrcode_isGroup'] + text
        }
        setLinkContent(text)
    }, [info?.link, group])

    const handleCopy = () => {
        copy(linkContent)
        showToast('Copied')
    }


    return (
        <>
            <div className='send-badge-success' style={{minHeight: `${heightWithoutNav}px`}}>
                <div className='center-box header'>
                    <PageBack backBtnLabel={lang['Page_Back_Done']}
                              title={lang['IssueFinish_Title']}
                              to={user.userName ? `/profile/${user.userName}` : '/'}/>
                </div>
                <div className='background'>
                    <div className='ball1'></div>
                    <div className='ball2'></div>
                    <div className='ball3'></div>
                </div>
                <div className='cards'>
                    <div className={'title'}>{lang['IssueFinish_Share_By_Qrcode']}</div>
                    {!!info && <ShareQrcode {...info} isGroup={group || undefined} />}
                </div>
                <div className='cards'>
                    <div className={'title'}>{lang['IssueFinish_Share_By_Link']}</div>
                    {!!info && <div className={'link-content'}>
                        {linkContent}
                        <div className={'copy-link-btn'} onClick={handleCopy}>
                            <i className='icon-copy'></i>
                            <span>{lang['IssueFinish_CopyLink']}</span>
                        </div>
                    </div>}
                </div>
            </div>
        </>
    )
}

export default IssueSuccessPage
