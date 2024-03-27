import Layout from '@/components/Layout/Layout'
import AppButton, {BTN_KIND} from "@/components/base/AppButton/AppButton";
import {useContext, useEffect} from 'react'
import UserContext from '@/components/provider/UserProvider/UserContext'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import solas, {queryVoucherDetail} from '@/service/solas'
import useIssueBadge from '@/hooks/useIssueBadge'
import LangContext from '@/components/provider/LangProvider/LangContext'
import {useRouter, useParams} from "next/navigation";
import useSafePush  from "@/hooks/useSafePush";

function Home() {
    const {user} = useContext(UserContext)
    const {
        showBadgelet,
        showPresend,
        clean,
        openConnectWalletDialog,
        showInvite,
        showLoading,
        showNftpasslet,
        showNftpass,
        showPoint,
        showPointItem,
        showGift,
        showGiftItem,
        showVoucher
    } = useContext(DialogsContext)
    const router = useRouter()
    const params = useParams()
    const startIssueBadge = useIssueBadge()
    const {lang} = useContext(LangContext)
    const {safePush} = useSafePush()

    useEffect(() => {
        async function showBadgeletDetail() {
            const newBadgelet = await solas.queryBadgeletDetail({id: Number(params!.badgeletId)})
            showBadgelet(newBadgelet)
        }

        async function showPresendDetail() {
            const id = (params!.presendId as string)?.split('_')[0]
            const code = (params!.presendId as string)?.split('_')[1]
            const vourcher = await solas.queryVoucherDetail(Number(id))
            showPresend(vourcher, code)
        }

        async function showInviteDetail() {
            const item = await solas.queryInviteDetail({group_id: Number(params!.groupId), invite_id: Number(params!.inviteId)})
            showInvite(item)
        }

        async function showNftpassletDetail() {
            const item = await solas.queryBadgeletDetail({id: Number(params!.nftpassletId)})
            showNftpasslet(item)
        }

        async function showNftpassDetail() {
            const item = await solas.queryNftPassDetail({id: Number(params!.nftpassId)})
            showNftpass(item)
        }

        async function showPointDetail() {
            const item = await solas.queryPointDetail({id: Number(params!.pointId)})
            showPoint(item)
        }

        async function showPointItemDetail() {
            const item = await solas.queryPointItemDetail({id: Number(params!.pointItemId)})
            showPointItem(item)
        }

        async function showGiftDetail() {
            const item = await solas.queryBadgeDetail({id: Number(params!.giftId)})
            showGift(item)
        }

        async function showGiftItemDetail() {
            const item = await solas.queryBadgeletDetail({id: Number(params!.giftitemId)})
            showGiftItem(item)
        }

        if (params?.badgeletId) {
            clean('show badgelet detail')
            setTimeout(() => {
                showBadgeletDetail()
            }, 500)
        }

        if (params?.presendId) {
            clean('show presend detail')
            setTimeout(() => {
                showPresendDetail()
            }, 500)
        }

        if (params?.inviteId) {
            clean('show invite detail')
            setTimeout(() => {
                showInviteDetail()
            }, 500)
        }

        if (params?.nftpassletId) {
            setTimeout(() => {
                showNftpassletDetail()
            }, 500)
        }

        if (params?.nftpassId) {
            setTimeout(() => {
                showNftpassDetail()
            }, 500)
        }

        if (params?.pointId) {
            setTimeout(() => {
                showPointDetail()
            }, 500)
        }

        if (params?.pointItemId) {
            setTimeout(() => {
                showPointItemDetail()
            }, 500)
        }

        if (params?.giftId) {
            setTimeout(() => {
                showGiftDetail()
            }, 500)
        }

        if (params?.giftitemId) {
            setTimeout(() => {
                showGiftItemDetail()
            }, 500)
        }

        if (params?.voucherId) {
            const unload = showLoading()
            let code: undefined | string = undefined
            let _voucherId = ''
            if (params?.voucherId.includes('_')) {
                code = (params?.voucherId as string).split('_')[1]
                _voucherId = (params?.voucherId as string).split('_')[0]
            } else {
                _voucherId = params?.voucherId as string
            }

            const voucher = queryVoucherDetail(Number(_voucherId))
                .then(res => {
                    if (res!.badge.badge_type === 'badge') {
                        showVoucher(res, code)
                    }
                })
                .finally(() => {
                    unload()
                })
        }
    }, [params])

    const start = async () => {
        if (user.userName && user.authToken) {
            const unload = showLoading()
            const badges = await solas.queryBadge({sender_id: user.id!, page: 1})
            unload()
            startIssueBadge({badges: badges.data})
        } else if (!user.userName && user.authToken) {
            safePush('/regist')
        } else {
            openConnectWalletDialog()
        }
    }

    // useEffect(() => {
    //     if (user.domain && user.userName && (!params?.badgeletId && !params?.presendId && !params?.inviteId)) {
    //         router.replace(`/profile/${user.userName}`)
    //     }
    // }, [user.userName, user.userName, params?.badgeletId, params?.presendId, params?.inviteId])

    return <div className='home-page'>
        <div className='circle-1'></div>
        <div className='circle-2'></div>
        <div className='circle-3'></div>
        <div className='wrapper'>
            <img className='cover' src="/images/home/home_1.png" alt=""/>
            <div className='text'>
                <h1>{lang['Home_Page_New_Title']}</h1>
                <p>{lang['Home_Page_New_Des']}</p>
                <AppButton onClick={start}
                           kind={BTN_KIND.primary} special>{lang['Home_Page_New_Btn']}</AppButton>
            </div>
        </div>
    </div>
}

export default Home
