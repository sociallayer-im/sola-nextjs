import {useRouter, useSearchParams} from "next/navigation";
import {useContext, useState} from 'react'
import PageBack from '../../components/base/PageBack'
import LangContext from '../../components/provider/LangProvider/LangContext'
import UploadImage from '../../components/compose/UploadBadgeImage/UploadBadgeImage'
import AppInput from '../../components/base/AppInput'
import UserContext from '../../components/provider/UserProvider/UserContext'
import AppButton, {BTN_KIND} from '../../components/base/AppButton/AppButton'
import useVerify from '../../hooks/verify'
import solas, {Group, Profile} from '../../service/solas'
import DialogsContext from '../../components/provider/DialogProvider/DialogsContext'
import ReasonInput from '../../components/base/ReasonInput/ReasonInput'
import SelectCreator from '../../components/compose/SelectCreator/SelectCreator'
import useMintSolanaBadge from "@/hooks/useMintSolanaBadge";

function CreateBadgeNonPrefill() {
    const router = useRouter()
    const [cover, setCover] = useState('')
    const [domainError, setDomainError,] = useState('')
    const [badgeName, setBadgeName] = useState('')
    const [reason, setReason] = useState('')
    const [creator, setCreator] = useState<Group | Profile | null>(null)
    const [badgeNameError, setBadgeNameError] = useState('')
    const enhancer = process.env.NEXT_PUBLIC_SOLAS_DOMAIN
    const {user} = useContext(UserContext)
    const {showLoading, showToast} = useContext(DialogsContext)
    const {verifyDomain} = useVerify()
    const searchParams = useSearchParams()
    const presetAcceptor = searchParams?.get('to')
    const {registBadge, ready} = useMintSolanaBadge()

    const badgeType = 'badge'

    const {lang} = useContext(LangContext)

    const handleCreate = async () => {
        setDomainError('')
        setBadgeNameError('')

        if (!ready) {
            showToast('Please wait for the wallet to connect')
            return
        }

        if (!badgeName) {
            setBadgeNameError('badge name must not empty')
            return
        }

        if (!cover) {
            showToast('please upload a badge picture')
            return
        }

        const unload = showLoading()
        try {
            let groupId = 0
            if (searchParams?.get('group')) {
                const group = await solas.getGroups({id: Number(searchParams?.get('group'))})
                if (group[0]) {
                    groupId = group[0].id
                }
            }

            if ((creator as Group)?.memberships) {
                groupId = creator!.id
            }

            const newBadge = await solas.createBadge({
                name: badgeName,
                title: badgeName,
                image_url: cover,
                auth_token: user.authToken || '',
                content: reason || '',
                group_id: groupId || undefined,
                badge_type: badgeType,
                metadata: JSON.stringify({solanabadge: true})
            })

            const registClassIdOnSolana = await registBadge(newBadge, user.id!)

            if (reason) {
                router.push(`/issue-solanabadge/${newBadge.id}?reason=${encodeURI(reason)}`)
            } else {
                router.push(`/issue-solanabadge/${newBadge.id}`)
            }
            unload()
        } catch (e: any) {
            unload()
            console.log('[handleCreate]: ', e)
            showToast(e.message || 'Create fail')
        }
    }

    return (
        <div className='create-badge-page'>
            <div className='create-badge-page-wrapper'>
                <PageBack title={lang['MintBadge_Title']}/>

                <div className='create-badge-page-form'>
                    <div className='input-area'>
                        <div className='input-area-title'>{lang['MintBadge_Upload']}</div>
                        <UploadImage
                            imageSelect={cover}
                            confirm={(coverUrl) => {
                                setCover(coverUrl)
                            }}/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['MintBadge_Name_Label']}</div>
                        <AppInput
                            clearable
                            maxLength={30}
                            value={badgeName}
                            errorMsg={badgeNameError}
                            endEnhancer={() => <span style={{fontSize: '12px', color: '#999'}}>
                                    {`${badgeName.length}/30`}
                                </span>
                            }
                            placeholder={lang['MintBadge_Name_Placeholder']}
                            onChange={(e) => {
                                setBadgeName(e.target.value)
                            }}/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['IssueBadge_Reason']}</div>
                        <ReasonInput value={reason} onChange={(value) => {
                            setReason(value)
                        }}/>
                    </div>

                    {!searchParams?.get('group') &&
                        <div className='input-area'>
                            <div className='input-area-title'>{lang['BadgeDialog_Label_Creator']}</div>
                            <SelectCreator value={creator} onChange={(res) => {
                                console.log('resres', res);
                                setCreator(res)
                            }}/>
                        </div>
                    }

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
    )
}

export default CreateBadgeNonPrefill
