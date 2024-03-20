import {useSearchParams} from 'next/navigation'
import {useContext, useEffect, useState} from 'react'
import solas, {Group} from '../../service/solas'
import LangContext from '../../components/provider/LangProvider/LangContext'
import UserContext from '../../components/provider/UserProvider/UserContext'
import copy from '../../utils/copy'
import PageBack from '../../components/base/PageBack'
import usePicture from '../../hooks/pictrue'
import usePageHeight from '../../hooks/pageHeight'
import DialogsContext from "../../components/provider/DialogProvider/DialogsContext";
import ShareQrcode, {ShareQrcodeProp} from "../../components/compose/ShareQrcode/ShareQrcode";
import AppButton from "@/components/base/AppButton/AppButton";

function IssueSuccessPage(props: any) {
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
    const voucher_id = props.voucher || searchParams?.get('voucher')
    const code = props.code || searchParams?.get('code')

    const inviteId = props.invite || searchParams?.get('invite')

    useEffect(() => {
        async function fetchInfo() {
            if (voucher_id) {
                const voucher = await solas.queryVoucherDetail(Number(voucher_id))

                setInfo({
                    sender: voucher!.sender,
                    name: voucher!.badge.name,
                    cover: voucher!.badge.image_url,
                    link: genShareLink(voucher!.id, code || undefined),
                })

                setGroup(voucher!.badge.group || null)
            }

            // if (presendId) {
            //     const presendDetail = await solas.queryPresendDetail({
            //         id: Number(presendId),
            //         auth_token: user.authToken || ''
            //     })
            //     let code: string | undefined = undefined
            //     if (user.id) {
            //         try {
            //             code = await solas.getVoucherCode({id: Number(presendId), auth_token: user.authToken || ''})
            //         } catch (e) {
            //             console.log(e)
            //         }
            //     }
            //
            //     const sender = presendDetail.badge.sender
            //     setInfo({
            //         name: presendDetail.badge.name,
            //         cover: presendDetail.badge.image_url,
            //         limit: presendDetail.badgelets.length + presendDetail.counter,
            //         expires: presendDetail.expires_at,
            //         link: genShareLink(code || undefined),
            //         sender: sender as ProfileSimple
            //     })
            //
            //     setGroup(presendDetail.group)
            // }
            //
            if (inviteId) {
                const inviteDetail = await solas.queryInviteDetail({
                    invite_id: Number(inviteId),
                })
                if (!inviteDetail) return

                const group = await solas.queryGroupDetail(Number(inviteDetail.group_id))
                if (!group) return

                setInfo({
                    sender: group as any,
                    name: group.username,
                    cover: group.image_url || defaultAvatar(group.id),
                    link: genInviteShareLink(inviteId),
                })

                setGroup(group)
            }
            //
            // if (nftpassletId) {
            //     const badgeletDetail = await solas.queryBadgeletDetail({id: Number(nftpassletId)})
            //
            //     setInfo({
            //         sender: badgeletDetail.sender,
            //         name: badgeletDetail.badge.name,
            //         cover: badgeletDetail.badge.image_url,
            //         link: genShareLink(),
            //         start: badgeletDetail.starts_at || undefined,
            //         expires: badgeletDetail.expires_at || undefined,
            //         title: lang['Badgebook_Dialog_NFT_Pass']
            //     })
            //
            //     setGroup(badgeletDetail.group)
            // }
            //
            // if (pointId && pointitemId) {
            //     const point = await solas.queryPointDetail({id: Number(pointId)})
            //     const pointItem = await solas.queryPointItemDetail({id: Number(pointitemId)})
            //
            //     setInfo({
            //         sender: point.sender,
            //         name: point.title,
            //         cover: point.image_url,
            //         link: genShareLink(),
            //         points: pointItem.value,
            //         title: lang['Badgebook_Dialog_Points']
            //     })
            //
            //     setGroup(point.group)
            // }
            //
            // if (giftItemId) {
            //     const badgeletDetail = await solas.queryBadgeletDetail({id: Number(giftItemId)})
            //
            //     setInfo({
            //         sender: badgeletDetail.sender,
            //         name: badgeletDetail.badge.name,
            //         cover: badgeletDetail.badge.image_url,
            //         link: genShareLink(),
            //         start: badgeletDetail.starts_at || undefined,
            //         expires: badgeletDetail.expires_at || undefined,
            //         title: lang['Badgebook_Dialog_Gift'],
            //     })
            //
            //     setGroup(badgeletDetail.badge.group || null)
            // }
        }

        fetchInfo()
    }, [user.authToken])

    const genShareLink = (id: number, code?: string) => {
        const base = `${window.location.protocol}//${window.location.host}`
        let path = ''

        path = `${base}/voucher/${id}`
        if (code) {
            path = path + '_' + code
        }

        return path
    }

    const genInviteShareLink = (id: string) => {
        const base = `${window.location.protocol}//${window.location.host}`
        let path = ''

        path = `${base}/invite/${id}`
        return path
    }

    useEffect(() => {
        const shareUrl = info?.link || ''
        let text = lang['IssueFinish_share']
            .replace('#1', group?.nickname || group?.username || user.nickname || user.domain!)
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
                              to={ props.invite ? `/group/${group?.username}` : (user.userName ?  `/profile/${user.userName}` : '/')}/>
                </div>
                <div className='background'>
                    <div className='ball1'></div>
                    <div className='ball2'></div>
                    <div className='ball3'></div>
                </div>
                <div className='cards'>
                    <div className={'title'}>{lang['IssueFinish_Share_By_Qrcode']}</div>
                    {!!info && <ShareQrcode {...info} isGroup={group || undefined}/>}
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
                <div className='cards'>
                    {!!info && <AppButton special onClick={e => {
                        window.location.href = group ? `/group/${group?.username}` : (user.userName ? `/profile/${user.userName}` : '/')
                    }}>{group ? lang['Back_To_Group_Page'] : lang['Back_To_Profile_Page']}</AppButton> }
                </div>
            </div>
        </>
    )
}

export default IssueSuccessPage

export const getServerSideProps: any = (async (context: any) => {
    const voucher = context.query?.voucher || null
    const invite = context.query?.invite || null
    const code = context.query?.code || null


    return {
        props: {
            invite,
            voucher,
            code,
        }
    }
})

