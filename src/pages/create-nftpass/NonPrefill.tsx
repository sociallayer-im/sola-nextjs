import {useRouter, useSearchParams} from "next/navigation";
import { useState, useContext, useEffect } from 'react'
import PageBack from '../../components/base/PageBack'
import LangContext from '../../components/provider/LangProvider/LangContext'
import UploadImage from '../../components/compose/UploadImage/UploadImage'
import AppInput from '../../components/base/AppInput'
import UserContext from '../../components/provider/UserProvider/UserContext'
import AppButton, { BTN_KIND } from '../../components/base/AppButton/AppButton'
import useVerify from '../../hooks/verify'
import solas, { Group, Profile } from '../../service/solas'
import DialogsContext from '../../components/provider/DialogProvider/DialogsContext'
import ReasonInput from '../../components/base/ReasonInput/ReasonInput'
import SelectCreator from '../../components/compose/SelectCreator/SelectCreator'
import Toggle from "../../components/base/Toggle/Toggle"
import AppTips from "../../components/base/AppTips/AppTips";

function CreateBadgeNonPrefill() {
    const router = useRouter()
    const [cover, setCover] = useState('')
    const [badgeName, setBadgeName] = useState('')
    const [reason, setReason] = useState('')
    const [creator, setCreator] = useState<Group | Profile | null>(null)
    const [badgeNameError, setBadgeNameError] = useState('')
    const enhancer = process.env.NEXT_PUBLIC_SOLAS_DOMAIN
    const { user } = useContext(UserContext)
    const { showLoading, showToast } = useContext(DialogsContext)
    const { verifyDomain } = useVerify()
    const searchParams = useSearchParams()
    const presetAcceptor = searchParams?.get('to')

    const { lang } = useContext(LangContext)

    const handleCreate = async () => {
        setBadgeNameError('')

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
                const group = await solas.getGroups({ id: Number(searchParams?.get('group')) })
                if (group[0]) {
                    groupId = group[0].id
                }
            }

            if ((creator as Group)?.creator) {
                groupId = (creator as Group).creator.id
            }

            const newNftPass = await solas.createBadge({
                name: badgeName,
                title: badgeName,
                image_url: cover,
                auth_token: user.authToken || '',
                content: reason || '',
                group_id:  groupId || undefined,
                badge_type: 'nftpass',
            })

            if (presetAcceptor) {
                const badgelets = await solas.issueBatch({
                    badgeId: newNftPass.id!,
                    reason: reason || '',
                    issues: [presetAcceptor],
                    auth_token: user.authToken || ''
                })
                unload()
                router.push(`/issue-success?voucher=${badgelets[0].id}`)
            } else {
                router.push(`/issue-nftpass/${newNftPass.id}?reason=${encodeURI(reason)}`)
            }
            unload()
        } catch (e: any) {
            unload()
            console.log('[handleCreate]: ', e)
            showToast(e.message || 'Create fail')
        }
    }

    return (
        <>
            <div className='create-badge-page'>
                <div className='create-badge-page-wrapper'>
                    <PageBack title={ lang['Create_NFT_Title'] }/>

                    <div className='create-badge-page-form'>
                        <div className='input-area'>
                            <div className='input-area-title'>{ lang['Create_NFT_Image'] }</div>
                            <UploadImage
                                imageSelect={ cover }
                                confirm={(coverUrl) => { setCover(coverUrl) } }/>
                        </div>

                        <div className='input-area'>
                            <div className='input-area-title'>{lang['Create_NFT_Name']}</div>
                            <AppInput
                                clearable
                                maxLength={ 30 }
                                value={ badgeName }
                                errorMsg={ badgeNameError }
                                endEnhancer={() => <span style={ { fontSize: '12px', color: '#999' } }>
                                    { `${badgeName.length}/30` }
                                </span>
                                }
                                placeholder={ lang['Create_NFT_Name_Placeholder'] }
                                onChange={ (e) => { setBadgeName(e.target.value) } } />
                        </div>

                        <div className='input-area'>
                            <div className='input-area-title'>{ lang['Create_NFT_Name_Des'] }</div>
                            <ReasonInput value={reason}  onChange={ (value) => { setReason(value) }} />
                        </div>

                        {
                            !searchParams?.get('group') &&
                            <div className='input-area'>
                                <div className='input-area-title'>{ lang['BadgeDialog_Label_Creator'] }</div>
                                <SelectCreator value={ creator } onChange={(res) => { console.log('resres', res);setCreator(res) }}/>
                            </div>
                        }

                        <AppButton kind={ BTN_KIND.primary }
                                   special
                                   onClick={ () => { handleCreate() } }>
                            { presetAcceptor
                                ? lang['MintBadge_Submit_To']([presetAcceptor.split('.')[0]])
                                : lang['MintBadge_Next']
                            }
                        </AppButton>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateBadgeNonPrefill
