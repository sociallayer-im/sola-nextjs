import {useRouter, useSearchParams} from "next/navigation";
import {useContext, useEffect, useState} from 'react'
import PageBack from '../../components/base/PageBack'
import LangContext from '../../components/provider/LangProvider/LangContext'
import AppButton, {BTN_KIND} from '../../components/base/AppButton/AppButton'
import solas, {Point} from '../../service/solas'
import DialogsContext from '../../components/provider/DialogProvider/DialogsContext'
import ReasonInput from '../../components/base/ReasonInput/ReasonInput'
import UserContext from '../../components/provider/UserProvider/UserContext'
import DetailPrefillPoint from "../../components/base/DetailPrefillPoint/DetailPrefillPoint";

interface CreateBadgeWithPrefillProp {
    pointId: number
}

function CreateBadgeWithPrefill(props: CreateBadgeWithPrefillProp) {
    const router = useRouter()
    const [reason, setReason] = useState('')
    const {showLoading, showToast} = useContext(DialogsContext)
    const {user} = useContext(UserContext)
    const searchParams = useSearchParams()
    const [preFillBadge, setPreFillBadge] = useState<Point | null>(null)
    const presetAcceptor = searchParams.get('to')

    const {lang} = useContext(LangContext)

    useEffect(() => {
        async function getPointDetail() {
            const unload = showLoading()
            try {
                const pointItem = await solas.queryPointDetail({id: props.pointId})
                setPreFillBadge(pointItem)
                setReason(pointItem.content)
            } finally {
                unload()
            }
        }

        getPointDetail()
    }, [])

    const send = async (acceptorDomain: string) => {
        const unload = showLoading()
        try {
            const nftPass = await solas.issueBatch({
                badgeId: preFillBadge?.id!,
                reason: reason || '',
                issues: [acceptorDomain],
                auth_token: user.authToken || ''
            })
            unload()
            router.push(`/issue-success?nftpass=${nftPass[0].id}`)
        } catch (e: any) {
            console.log('[handleCreateIssue]: ', e)
            unload()
            showToast(e.message || 'Issue fail')
        }
    }

    const handleCreate = async () => {
        if (presetAcceptor) {
            router.push(`/issue-point/${props.pointId}?to=${presetAcceptor}?reason=${encodeURI(reason)}`)
        } else {
            router.push(`/issue-point/${props.pointId}?reason=${encodeURI(reason)}`)
        }
    }

    return (
        <>
            {!!preFillBadge &&
                <div className='create-point-page'>
                    <div className='create-badge-page-wrapper'>
                        <PageBack title={lang['MintBadge_Title']}/>
                        { !!preFillBadge &&
                            <DetailPrefillPoint point={preFillBadge}/>
                        }
                        <div className='create-badge-page-form'>
                            <div className='input-area'>
                                <div className='input-area-title'>{lang['Create_NFT_Name_Des']}</div>
                                <ReasonInput value={reason} onChange={(value) => {
                                    setReason(value)
                                }}/>
                            </div>
                            <AppButton kind={BTN_KIND.primary}
                                       special
                                       onClick={() => {
                                           handleCreate()
                                       }}>
                                {presetAcceptor
                                    ? lang['MintBadge_Submit_To']([presetAcceptor.split('.')[0]])
                                    : lang['MintBadge_Next']
                                }
                            </AppButton>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default CreateBadgeWithPrefill
