import styles from './IssueBadge.module.scss'
import PageBack from "@/components/base/PageBack";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {useContext, useEffect, useState} from "react";
import AppInput from "@/components/base/AppInput";
import AddressList from "@/components/base/AddressList/AddressList";
import {issueBatch, Profile, queryBadgeDetail, searchDomain} from "@/service/solas";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {useParams, useRouter} from 'next/navigation'
import userContext from "@/components/provider/UserProvider/UserContext";


export function IssueBadge() {
    const {lang} = useContext(LangContext)
    const [sendType, setSendType] = useState(0)
    const [inputIssuesType, setInputIssuesType] = useState(0)
    const [domainSearchKey, setDomainSearchKey] = useState('')
    const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([])
    const [searchRes, setSearchRes] = useState<Profile[]>([])
    const [reason, setReason] = useState('')
    const {showToast, showLoading} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        if (domainSearchKey) {
            searchDomain({username: domainSearchKey, page: 1}).then(res => {
                if (res) {
                    setSearchRes(res)
                }
            })
        }
    }, [domainSearchKey])

    useEffect(() => {
        if (params?.badgeId) {
            const badge = queryBadgeDetail({id: Number(params.badgeId)})
                .then(res => {
                    setReason(res?.content || '')
                })
        }
    }, [params?.badgeId])

    const handleSend = async () => {
        if (!selectedProfiles.length) {
            showToast('Please select at least one receiver')
            return
        }

        if (!params.badgeId) {
            showToast('Invalid badge id')
            return
        }

        const unload = showLoading()
        try {
            const vouchers = await issueBatch({
                badgeId: Number(params.badgeId!),
                issues: selectedProfiles.map(item => item.username!),
                auth_token: user.authToken || '',
                reason: reason
            })
            unload()
            router.push(`/issue-success?voucher=${vouchers[0].id}`)
        } catch (e: any) {
            console.log('[handleCreateIssue]: ', e)
            unload()
            showToast(e.message || 'Issue fail')
        }
    }

    return (
        <div className={styles['page']}>
            <div className={styles['center']}><PageBack/></div>
            <div className={styles['center']}>
                <div className={'column'}>
                    <div className={styles['title']}>{lang['Send_The_Badge']}</div>
                    <div className={styles['tab1']}>
                        <div className={styles['tab1-item']} onClick={e => {
                            setSendType(0)
                        }}>
                            <div
                                className={sendType === 0 ? styles['tab1-item-text-active'] : styles['tab1-item-text']}>{lang['Select_Receivers']}</div>
                        </div>
                        <div className={styles['tab1-item']} onClick={e => {
                            setSendType(1)
                        }}>
                            <div
                                className={sendType === 1 ? styles['tab1-item-text-active'] : styles['tab1-item-text']}>
                                {lang['Badge_Amount']}
                            </div>
                        </div>
                    </div>

                    {
                        sendType === 0 &&
                        <div className={styles['content']}>
                            <div className={styles['tab2']}>
                                <div
                                    className={inputIssuesType === 0 ? styles['tab2-item-active'] : styles['tab2-item']}
                                    onClick={e => {
                                        setInputIssuesType(0)
                                    }}>
                                    {lang['From_Domain']}
                                </div>
                                <div
                                    className={inputIssuesType === 1 ? styles['tab2-item-active'] : styles['tab2-item']}
                                    onClick={e => {
                                        setInputIssuesType(1)
                                    }}>
                                    {lang['From_Csv']}
                                </div>
                            </div>

                            {
                                inputIssuesType === 0 &&
                                <div className={styles['sub-content']}>
                                    <AppInput value={domainSearchKey}
                                              onChange={e => {
                                                  setDomainSearchKey(e.target.value)
                                              }}
                                              clearable={true}
                                              placeholder={'Please input the domain/username/email to search'}/>
                                    {!!searchRes.length && domainSearchKey &&
                                        <div className={styles['search-res']}>
                                            <AddressList data={searchRes}
                                                         selected={selectedProfiles.map((item) => item.id) as any}
                                                         onClick={(target) => {
                                                             const targetIndex = selectedProfiles.findIndex(item => item.id === target.id)//
                                                             // is selected, remove
                                                             if (targetIndex > -1) {
                                                                 const newSelectedProfiles = [...selectedProfiles]
                                                                 newSelectedProfiles.splice(targetIndex, 1)
                                                                 setSelectedProfiles(newSelectedProfiles)
                                                             } else {
                                                                 {
                                                                     setSelectedProfiles([...selectedProfiles, target])
                                                                 }
                                                             }
                                                         }
                                                         }/>
                                        </div>
                                    }

                                    {!!selectedProfiles.length &&
                                        <div className={styles['selected']}>
                                            <div className={styles['selected-title']}>
                                                <div>{'Send to:'}</div>
                                                <div>{selectedProfiles.length} {lang['Group_invite_receiver']}</div>
                                            </div>
                                            <AddressList deletedOnly data={selectedProfiles} selected={[] as any}
                                                         onClick={(target) => {
                                                                const targetIndex = selectedProfiles.findIndex(item => item.id === target.id)//
                                                                // is selected, remove
                                                                if (targetIndex > -1) {
                                                                    const newSelectedProfiles = [...selectedProfiles]
                                                                    newSelectedProfiles.splice(targetIndex, 1)
                                                                    setSelectedProfiles(newSelectedProfiles)
                                                                } else {
                                                                    {
                                                                        setSelectedProfiles([...selectedProfiles, target])
                                                                    }
                                                                }
                                                         }}
                                            />
                                        </div>
                                    }

                                    <div className={styles['action']}>
                                        <AppButton special onClick={e => {
                                            handleSend()
                                        }}>{lang['Send_The_Badge']}</AppButton>
                                        <div className={styles['later']} onClick={e => {
                                            user.userName ? router.push(`/user/${user.userName}`)
                                                : router.push(`/`)
                                        }}>
                                            {lang['MintFinish_Button_Later']}
                                        </div>
                                    </div>
                                </div>
                            }

                            {
                                inputIssuesType === 1 &&
                                <div className={styles['sub-content']}>s 2</div>
                            }
                        </div>
                    }

                    {
                        sendType === 1 &&
                        <div className={'content'}>2</div>
                    }
                </div>
            </div>

        </div>
    )
}

export default IssueBadge
