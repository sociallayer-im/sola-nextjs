import {useParams, useRouter, useSearchParams} from "next/navigation";
import {useContext, useEffect, useRef, useState} from 'react'
import PageBack from '@/components/base/PageBack'
import LangContext from '@/components/provider/LangProvider/LangContext'
import solas, {Badge, getProfile, Profile} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import UserContext from '@/components/provider/UserProvider/UserContext'
import useMintSolana from "@/hooks/useMintSolanaBadge";
import IssuesInput from "@/components/base/IssuesInput/IssuesInput";
import AppButton from "@/components/base/AppButton/AppButton";
import styles from './IssueBadge.module.scss'

function Issue() {
    const {user} = useContext(UserContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const [badge, setBadge] = useState<Badge | null>(null)
    const params = useParams()
    const SearchParams = useSearchParams()
    const router = useRouter()
    const {mintBadge} = useMintSolana()

    // 处理预填接受者
    const [target, setTarget] = useState<Profile | null>(null)
    const presetAcceptor = SearchParams?.get('to')
    const [initIssues, setInitIssues] = useState(presetAcceptor ? [presetAcceptor] : [''])
    const initIssuesRef = useRef(initIssues)
    const [err, setErr] = useState('')

    const {lang} = useContext(LangContext)

    useEffect(() => {
        if (!initIssues[0]) {
            setErr('')
            return
        }

        if (initIssuesRef.current[0] !== initIssues[0]) {
            initIssuesRef.current = initIssues
            getProfile({username: initIssues[0]})
                .then((res) => {
                    if (!res) {
                        setErr('User not found')
                        setTarget(null)
                        return
                    }

                    if (!res.sol_address) {
                        setErr('Badges cannot be issued to users who have not provided their Solana public key. ')
                        setTarget(null)
                        return
                    }

                    setTarget(res)
                    setErr('')
                })
        }
    }, [initIssues])

    useEffect(() => {
        async function getBadgeInfo() {
            const badge = await solas.queryBadgeDetail({id: Number(params!.badgeId)})
            setBadge(badge)
        }

        if (params?.badgeId) {
            getBadgeInfo()
        }
    }, [params])

    const handleMint = async () => {
        const unload = showLoading()
        try {
            const mintBadgeTx = await mintBadge(badge!, user.id!, target?.sol_address!, target?.username!)
            console.log('tx=> ', mintBadgeTx)
            showToast('Success')
            setTimeout(() => {
                router.push(`/profile/${user.userName}`)
            }, 1000)
        } catch (e: any) {
            console.error(e)
            showToast(e.message)
        } finally {
            unload()
        }
    }

    const fallBackPath = badge?.group
        ? `/group/${badge?.group.username}`
        : user.userName
            ? `/profile/${user.userName}`
            : '/'

    return (
        <>
            <div className='issue-badge-page'>
                <div className='issue-page-wrapper'>
                    <PageBack historyReplace to={fallBackPath}/>
                    <div className={'issue-text'}>
                        <div className={'title'}>{lang['Create_Badge_Success_Title']}</div>
                        <div className={'des'}>{lang['Create_Badge_Success_Des']}</div>
                    </div>

                    <div className={'issue-type-select'}>
                        <div className={'title'} style={{marginBottom: '30px'}}>{'Select a user to issue badge'}</div>

                        <IssuesInput
                            placeholder={'Input username or keywords to search'}
                            value={initIssues}
                            allowSearch={true}
                            allowAddressList={false}
                            isSingle={true}
                            onChange={(issues) => {
                                setInitIssues(issues)
                            }}
                        />
                        <div className={styles['error']}>{err}</div>

                        <div className={'actions'}>
                            <AppButton
                                onClick={e => {
                                    handleMint()
                                }}
                                special={true} size={'compact'}
                                disabled={!target || !badge || !!err || !initIssues[0]}>Issue</AppButton>
                            <div className={'send-later'}
                                 onClick={e => {
                                     router.push(`/profile/${user.userName}`)
                                 }}
                            >{lang['IssueBadge_Mint_later']}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Issue
