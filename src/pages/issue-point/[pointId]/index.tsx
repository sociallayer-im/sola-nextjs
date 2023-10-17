import {useRouter, useParams, useSearchParams} from "next/navigation";
import {useContext, useEffect, useState} from 'react'
import PageBack from '@/components/base/PageBack'
import LangContext from '@/components/provider/LangProvider/LangContext'
import solas, {Badge, getProfile, sendPoint} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import UserContext from '@/components/provider/UserProvider/UserContext'
import IssueTypeSelectorPoint, {
    IssueTypeSelectorData
} from "@/components/compose/IssueTypeSelectorPoint/IssueTypeSelectorPoint";

function Issue() {
    const {user} = useContext(UserContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const [badge, setBadge] = useState<Badge | null>(null)
    const params = useParams()
    const SearchParams = useSearchParams()
    const router = useRouter()
    const enhancer = process.env.NEXT_PUBLIC_SOLAS_DOMAIN

    // 处理预填接受者
    const presetAcceptor = SearchParams.get('to')
    const initIssueType = presetAcceptor ? 'issue' : ''
    const initIssues = presetAcceptor ? [presetAcceptor, ''] : ['']

    const {lang} = useContext(LangContext)

    useEffect(() => {
        async function getBadgeInfo() {
            const badge = await solas.queryBadgeDetail({id: Number(params.pointId)})
            setBadge(badge)
        }

        if (params?.badgeId) {
            getBadgeInfo()
        }
    }, [params])

    const handleCreate = async (data: IssueTypeSelectorData) => {
        const checkedIssues = data.issues.filter(item => !!item)
        if (!checkedIssues.length) {
            showToast('Please type in issues')
            return
        }

        if (!data.points || data.points === '0' || Number(data.points) <= 0) {
            showToast('Please type in points')
            return
        }

        console.log('checkedIssues', checkedIssues)

        const unload = showLoading()
        let wallet: string[] = []
        let domain: string[] = []
        checkedIssues.forEach(e => {
            if (e.startsWith('Ox')) {
                wallet.push(e)
            } else if (e.endsWith(enhancer!)) {
                domain.push(e)
            } else {
                domain.push(e + enhancer)
            }
        })

        if (wallet.length) {
            for(let i = 0 ;i< wallet.length; i++) {
                const profile = await getProfile({address: wallet[i]})
                if (!profile?.domain) {
                    showToast('profile no exist')
                    throw new Error('profile no exist: ' + wallet[i])
                }

                domain.push(profile?.domain)
            }
        }

        try {
            const pointItems = await sendPoint({
                point_id: Number(params.pointId),
                value: Number(data.points),
                auth_token: user.authToken || '',
                receivers: domain.map((item) => {
                    return {
                        receiver: item,
                        value: Number(data.points)
                    }
                })
            })
            router.push(`/issue-success?point=${params.pointId}&pointitem=${pointItems[0].id}`)
        } catch (e: any) {
            console.error(e)
            showToast(e.message || 'Issue fail')
        } finally {
            unload()
        }
    }

    const fallBackPath = badge?.group
        ? `/group/${badge?.group.username}`
        : user.userName ?
            `/profile/${user.userName}`
            : '/'

    return (
        <>
            <div className='issue-point-page'>
                <div className='issue-page-wrapper'>
                    <PageBack historyReplace to={fallBackPath}/>
                    <div className={'issue-text'}>
                        <div className={'title'}>{lang['Create_Point_success']}</div>
                        <div className={'des'}>{lang['Create_Point_success_des']}</div>
                    </div>
                    <IssueTypeSelectorPoint
                        initIssueType={initIssueType}
                        initIssues={initIssues}
                        onConfirm={handleCreate}
                        onCancel={() => {
                            router.replace(fallBackPath)
                        }}
                    />
                </div>
            </div>
        </>
    )
}

export default Issue
