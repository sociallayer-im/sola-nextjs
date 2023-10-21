import {useRouter, useSearchParams, useParams} from "next/navigation";
import {useStyletron} from 'baseui'
import {useContext, useEffect, useState} from 'react'
import PageBack from "../../components/base/PageBack";
import LangContext from "../../components/provider/LangProvider/LangContext";
import AppInput from "../../components/base/AppInput";
import AppTextArea from "../../components/base/AppTextArea/AppTextArea";
import AppVoteOptionsInput, {VoteOption} from "../../components/base/AppVoteOptionsInput/AppVoteOptionsInput";
import Toggle from "../../components/base/Toggle/Toggle";
import AppDateInput from "../../components/base/AppDateInput/AppDateInput";
import AppButton from "../../components/base/AppButton/AppButton";
import {Badge, createVote, getVoteDetail, Group, queryBadgeDetail, queryGroupDetail, Vote, updateVote} from "../../service/solas";
import DialogsContext from "../../components/provider/DialogProvider/DialogsContext";
import UserContext from "../../components/provider/UserProvider/UserContext";
import userSelectBadge from "../../hooks/selectBadge";
import {Delete} from "baseui/icon";

const getNearestTime = () => {
    const now = new Date()
    const minutes = now.getMinutes()
    const minuteRange = [0, 15, 30, 45, 60]
    const nearestMinute = minuteRange.find((item) => {
        return item >= minutes
    })

    const initStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), nearestMinute || 0)
    const initEndTime = new Date(initStartTime.getTime() + 60 * 60 * 1000)

    return [initStartTime, initEndTime]
}

function ComponentName() {
    const [css] = useStyletron()
    const router = useRouter()
    const [a, seta] = useState('')
    const {lang} = useContext(LangContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const {user} = useContext(UserContext)
    const searchParams = useSearchParams()
    const params = useParams()
    const {showSelectedBadge} = userSelectBadge()

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [options, setOptions] = useState<VoteOption[]>([])
    const [multipleChoice, setMultipleChoice] = useState(false)
    const [showVoter, setShowVoter] = useState(false)
    const [auth, setAuth] = useState<'has_group_membership' | 'has_badge' | 'badge_count'>('has_group_membership')
    const [enableMembership, setEnableMembership] = useState(false)
    const [enableBadge, setEnableBadge] = useState(false)
    const [enableBadgeCount, setEnableBadgeCount] = useState(false)

    const [expireAble, setExpireAble] = useState(false)
    const [expireDate, setExpireDate] = useState(getNearestTime()[1].toISOString())
    const [startDate, setStartDate] = useState(getNearestTime()[0].toISOString())
    const [voteDetail, setVoteDetail] = useState<Vote | null>(null)
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
    const [group, setGroup] = useState<Group | null>(null)


    const create = async () => {
        if (!group) {
            showToast('Please Select Group')
            return
        }

        if (!title) {
            showToast('Please input title')
            return
        }

        if (!options.length) {
            showToast('Please input options')
            return
        }

        const groupId = group.id

        const modifyOptions = options.filter((item) => item.title || item.link)
        if (!modifyOptions.length) {
            showToast('Please input options')
            return
        }

        const unload = showLoading()
        try {
            const create = await createVote({
                title,
                content,
                vote_options: modifyOptions,
                show_voter: showVoter,
                eligibile_group_id: Number(groupId),
                eligibility_strategy: auth,
                start_time: startDate,
                ending_time: expireAble ? expireDate : null,
                auth_token: user.authToken || '',
                group_id: Number(groupId),
                eligibile_badge_id: selectedBadge?.id || undefined,
                max_choice: multipleChoice ? options.length : 1
            })

            unload()
            showToast('Create Success')
            router.push(`/group/${group.username}?tab=3`)
        } catch (e: any) {
            unload()
            console.error(e)
            showToast(e.message || 'Create Failed')
        }
    }

    const save = async () => {
        const groupId = voteDetail?.group_id

        if (!groupId) {
            showToast('Please Select Group')
            return
        }

        if (!title) {
            showToast('Please input title')
            return
        }

        const unload = showLoading()
        try {
            let deletedOptions: any = []
            const oldOptions = voteDetail?.options || []
            const currentOptions = options.filter((item) => item.title || item.link)

            // 处理删除的选项
            oldOptions.forEach((item, index) => {
                const option = currentOptions.find(o => o.id === item.id)
                if (!option) {
                    (item as any)._destroy = true
                    deletedOptions.push(item)
                }
            })


            const modifyOptions = [...deletedOptions, ...currentOptions]

            console.log('modifyOptionsmodifyOptions', modifyOptions)
            if (!modifyOptions.length) {
                showToast('Please input options')
                return
            }


            const save = await updateVote({
                id: Number(voteDetail?.id),
                title,
                content,
                vote_options: modifyOptions,
                show_voter: showVoter,
                eligibile_group_id: Number(groupId),
                eligibility_strategy: auth,
                start_time: startDate,
                ending_time: expireAble ? expireDate : null,
                auth_token: user.authToken || '',
                group_id: Number(groupId),
                eligibile_badge_id: selectedBadge?.id || undefined,
                max_choice: multipleChoice ? options.length : 1
            })

            const groupName = await queryGroupDetail(Number(groupId))
            unload()
            showToast('Save Success')
            router.push(`/group/${groupName.username}?tab=3`)
        } catch (e: any) {
            unload()
            console.error(e)
            showToast(e.message || 'Create Failed')
        }
    }

    useEffect(() => {
        const getDetail = async () => {
            if (params?.vote) {
                const unload = showLoading()
                const voteData = await getVoteDetail(Number(params!.vote))
                if (!voteData) {
                    router.push('/error')
                    return
                }

                setVoteDetail(voteData)

                const groupDetail = await queryGroupDetail(Number(voteData.group_id))
                setGroup(groupDetail)

                setTitle(voteData.title)
                setContent(voteData.content)
                setOptions(voteData.options as VoteOption[])
                setShowVoter(voteData.show_voter)
                setStartDate(voteData.start_time)

                if (voteData.max_choice > 1) {
                    setMultipleChoice(true)
                }

                if (voteData.ending_time) {
                    setExpireAble(true)
                    setExpireDate(voteData.ending_time)
                }

                if (voteData.eligibile_badge_id && voteData.eligibility_strategy === 'has_badge') {
                    const badge = await queryBadgeDetail({id: voteData.eligibile_badge_id})
                    setSelectedBadge(badge)
                    setAuth('has_badge')
                    setEnableMembership(false)
                    setEnableBadge(true)
                    setEnableBadgeCount(false)
                } else if (voteData.eligibile_badge_id && voteData.eligibility_strategy === 'badge_count') {
                    const badge = await queryBadgeDetail({id: voteData.eligibile_badge_id})
                    setSelectedBadge(badge)
                    setAuth('badge_count')
                    setEnableMembership(false)
                    setEnableBadge(true)
                    setEnableBadgeCount(true)
                } else {
                    setAuth(voteData.eligibility_strategy)
                    setEnableMembership(true)
                    setEnableBadge(false)
                    setEnableBadgeCount(false)
                }
                unload()
            } else {
                const groupId = searchParams.get('group')
                if (groupId) {
                    const groupDetail = await queryGroupDetail(Number(groupId))
                    setGroup(groupDetail)
                }
                setEnableMembership(true)
            }
        }

        getDetail()

    }, [params?.vote])

    const changeAuth = (auth: string) => {
        if (auth === 'enableMembership') {
            setEnableMembership(true)
            setEnableBadge(false)
            setEnableBadgeCount(false)
            setAuth('has_group_membership')
        }  else if (auth === 'enableBadge') {
            if (enableBadgeCount) {
                return
            } else {
                setEnableMembership(false)
                setEnableBadge(true)
                setAuth('has_badge')
            }
        } else if (auth === 'enableBadgeCount') {
            if (enableBadgeCount) {
                setEnableBadgeCount(false)
                setAuth('has_badge')
            } else {
                setEnableMembership(false)
                setEnableBadgeCount(true)
                setAuth('badge_count')
            }

        }
    }

    return (<>
        <div className='create-vote-page'>
            <div className={'create-vote-page-wrapper'}>
                <PageBack onClose={() => router.back()}
                          title={lang['Vote_Create_Page_Title']}/>

                <div className='create-badge-page-form'>
                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Vote_Create_Title']}</div>
                        <AppInput
                            clearable
                            maxLength={30}
                            value={title}
                            errorMsg={''}
                            endEnhancer={() => <span style={{fontSize: '12px', color: '#999'}}>
                                    {`${title.length}/30`}
                                </span>
                            }
                            placeholder={lang['Vote_Create_Title_Placeholder']}
                            onChange={(e) => {
                                setTitle(e.target.value)
                            }}/>
                    </div>
                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Vote_Create_Des']}</div>
                        <AppTextArea
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value)
                            }}
                            placeholder={lang['Vote_Create_Content_Placeholder']}
                            maxLength={1000}
                        />
                    </div>

                    <div className='input-area'>
                        <AppVoteOptionsInput value={options}
                                             onChange={(value) => {
                                                 setOptions(value)
                                             }}/>
                    </div>

                    <div className='input-area'>
                        <div className={'toggle'}>
                            <div className={'item-title'}>{lang['Vote_Create_Multiple_Choice']}</div>
                            <div className={'item-value'}>
                                <Toggle checked={multipleChoice} onChange={e => {
                                    setMultipleChoice(e.target.checked)
                                }}/>
                            </div>
                        </div>
                    </div>

                    <div className='input-area'>
                        <div className={'toggle'}>
                            <div className={'item-title'}>{lang['Vote_Create_Show_Voter']}</div>
                            <div className={'item-value'}>
                                <Toggle checked={showVoter} onChange={e => {
                                    setShowVoter(e.target.checked)
                                }}/>
                            </div>
                        </div>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Vote_Create_Auth']}</div>
                        <div className={'input-area-select'}>
                            <div className={'item'} onClick={e => {
                                changeAuth('enableMembership')
                            }}>
                                {
                                    enableMembership
                                        ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                               xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14.72 8.79L10.43 13.09L8.78 11.44C8.69036 11.3353 8.58004 11.2503 8.45597 11.1903C8.33191 11.1303 8.19678 11.0965 8.05906 11.0912C7.92134 11.0859 7.78401 11.1091 7.65568 11.1594C7.52736 11.2096 7.41081 11.2859 7.31335 11.3833C7.2159 11.4808 7.13964 11.5974 7.08937 11.7257C7.03909 11.854 7.01589 11.9913 7.02121 12.1291C7.02653 12.2668 7.06026 12.4019 7.12028 12.526C7.1803 12.65 7.26532 12.7604 7.37 12.85L9.72 15.21C9.81344 15.3027 9.92426 15.376 10.0461 15.4258C10.1679 15.4755 10.2984 15.5008 10.43 15.5C10.6923 15.4989 10.9437 15.3947 11.13 15.21L16.13 10.21C16.2237 10.117 16.2981 10.0064 16.3489 9.88458C16.3997 9.76272 16.4258 9.63201 16.4258 9.5C16.4258 9.36799 16.3997 9.23728 16.3489 9.11542C16.2981 8.99356 16.2237 8.88296 16.13 8.79C15.9426 8.60375 15.6892 8.49921 15.425 8.49921C15.1608 8.49921 14.9074 8.60375 14.72 8.79ZM12 2C10.0222 2 8.08879 2.58649 6.4443 3.6853C4.79981 4.78412 3.51809 6.3459 2.76121 8.17317C2.00433 10.0004 1.8063 12.0111 2.19215 13.9509C2.578 15.8907 3.53041 17.6725 4.92894 19.0711C6.32746 20.4696 8.10929 21.422 10.0491 21.8079C11.9889 22.1937 13.9996 21.9957 15.8268 21.2388C17.6541 20.4819 19.2159 19.2002 20.3147 17.5557C21.4135 15.9112 22 13.9778 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7363 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM12 20C10.4178 20 8.87104 19.5308 7.55544 18.6518C6.23985 17.7727 5.21447 16.5233 4.60897 15.0615C4.00347 13.5997 3.84504 11.9911 4.15372 10.4393C4.4624 8.88743 5.22433 7.46197 6.34315 6.34315C7.46197 5.22433 8.88743 4.4624 10.4393 4.15372C11.9911 3.84504 13.5997 4.00346 15.0615 4.60896C16.5233 5.21447 17.7727 6.23984 18.6518 7.55544C19.5308 8.87103 20 10.4177 20 12C20 14.1217 19.1572 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20Z"
                                                fill="#6CD7B2"/>
                                        </svg>
                                        : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                               viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="9" stroke="#7B7C7B" strokeWidth="2"/>
                                        </svg>
                                }
                                <span>{lang['Vote_Create_Auth_Member']}</span>
                            </div>
                            <div className={'item'} onClick={e => {
                                changeAuth('enableBadge')
                            }}>
                                {
                                    enableBadge
                                        ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                               xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14.72 8.79L10.43 13.09L8.78 11.44C8.69036 11.3353 8.58004 11.2503 8.45597 11.1903C8.33191 11.1303 8.19678 11.0965 8.05906 11.0912C7.92134 11.0859 7.78401 11.1091 7.65568 11.1594C7.52736 11.2096 7.41081 11.2859 7.31335 11.3833C7.2159 11.4808 7.13964 11.5974 7.08937 11.7257C7.03909 11.854 7.01589 11.9913 7.02121 12.1291C7.02653 12.2668 7.06026 12.4019 7.12028 12.526C7.1803 12.65 7.26532 12.7604 7.37 12.85L9.72 15.21C9.81344 15.3027 9.92426 15.376 10.0461 15.4258C10.1679 15.4755 10.2984 15.5008 10.43 15.5C10.6923 15.4989 10.9437 15.3947 11.13 15.21L16.13 10.21C16.2237 10.117 16.2981 10.0064 16.3489 9.88458C16.3997 9.76272 16.4258 9.63201 16.4258 9.5C16.4258 9.36799 16.3997 9.23728 16.3489 9.11542C16.2981 8.99356 16.2237 8.88296 16.13 8.79C15.9426 8.60375 15.6892 8.49921 15.425 8.49921C15.1608 8.49921 14.9074 8.60375 14.72 8.79ZM12 2C10.0222 2 8.08879 2.58649 6.4443 3.6853C4.79981 4.78412 3.51809 6.3459 2.76121 8.17317C2.00433 10.0004 1.8063 12.0111 2.19215 13.9509C2.578 15.8907 3.53041 17.6725 4.92894 19.0711C6.32746 20.4696 8.10929 21.422 10.0491 21.8079C11.9889 22.1937 13.9996 21.9957 15.8268 21.2388C17.6541 20.4819 19.2159 19.2002 20.3147 17.5557C21.4135 15.9112 22 13.9778 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7363 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM12 20C10.4178 20 8.87104 19.5308 7.55544 18.6518C6.23985 17.7727 5.21447 16.5233 4.60897 15.0615C4.00347 13.5997 3.84504 11.9911 4.15372 10.4393C4.4624 8.88743 5.22433 7.46197 6.34315 6.34315C7.46197 5.22433 8.88743 4.4624 10.4393 4.15372C11.9911 3.84504 13.5997 4.00346 15.0615 4.60896C16.5233 5.21447 17.7727 6.23984 18.6518 7.55544C19.5308 8.87103 20 10.4177 20 12C20 14.1217 19.1572 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20Z"
                                                fill="#6CD7B2"/>
                                        </svg>
                                        : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                               viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="9" stroke="#7B7C7B" strokeWidth="2"/>
                                        </svg>
                                }
                                <span>{lang['Vote_Create_Auth_Badge']}</span>
                            </div>
                        </div>
                    </div>
                    { enableBadge &&
                        <>
                            {!!selectedBadge ?
                                <div className={'selected-badge'}>
                                    <img src={selectedBadge.image_url} alt={''}/>
                                    <div className={'name'}>{selectedBadge.name}</div>
                                    <Delete size={16} onClick={e => {
                                        setSelectedBadge(null)
                                    }}/>
                                </div>
                                : <div className={'selected-badge-btn'} onClick={e => {
                                    showSelectedBadge({
                                        groupId: group ? group.id : 0,
                                        onConfirm: (badge, close) => {
                                            setSelectedBadge(badge)
                                            close()
                                        }
                                    })
                                }}>{'Select badge'}</div>
                            }
                        </>
                    }
                    { enableBadge &&
                        <div className={'input-area'}>
                            <div className={'input-area-select'}>
                                <div className={'item'} onClick={e => {
                                    changeAuth('enableBadgeCount')
                                }}>
                                    {
                                         enableBadgeCount
                                            ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                   xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M14.72 8.79L10.43 13.09L8.78 11.44C8.69036 11.3353 8.58004 11.2503 8.45597 11.1903C8.33191 11.1303 8.19678 11.0965 8.05906 11.0912C7.92134 11.0859 7.78401 11.1091 7.65568 11.1594C7.52736 11.2096 7.41081 11.2859 7.31335 11.3833C7.2159 11.4808 7.13964 11.5974 7.08937 11.7257C7.03909 11.854 7.01589 11.9913 7.02121 12.1291C7.02653 12.2668 7.06026 12.4019 7.12028 12.526C7.1803 12.65 7.26532 12.7604 7.37 12.85L9.72 15.21C9.81344 15.3027 9.92426 15.376 10.0461 15.4258C10.1679 15.4755 10.2984 15.5008 10.43 15.5C10.6923 15.4989 10.9437 15.3947 11.13 15.21L16.13 10.21C16.2237 10.117 16.2981 10.0064 16.3489 9.88458C16.3997 9.76272 16.4258 9.63201 16.4258 9.5C16.4258 9.36799 16.3997 9.23728 16.3489 9.11542C16.2981 8.99356 16.2237 8.88296 16.13 8.79C15.9426 8.60375 15.6892 8.49921 15.425 8.49921C15.1608 8.49921 14.9074 8.60375 14.72 8.79ZM12 2C10.0222 2 8.08879 2.58649 6.4443 3.6853C4.79981 4.78412 3.51809 6.3459 2.76121 8.17317C2.00433 10.0004 1.8063 12.0111 2.19215 13.9509C2.578 15.8907 3.53041 17.6725 4.92894 19.0711C6.32746 20.4696 8.10929 21.422 10.0491 21.8079C11.9889 22.1937 13.9996 21.9957 15.8268 21.2388C17.6541 20.4819 19.2159 19.2002 20.3147 17.5557C21.4135 15.9112 22 13.9778 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7363 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM12 20C10.4178 20 8.87104 19.5308 7.55544 18.6518C6.23985 17.7727 5.21447 16.5233 4.60897 15.0615C4.00347 13.5997 3.84504 11.9911 4.15372 10.4393C4.4624 8.88743 5.22433 7.46197 6.34315 6.34315C7.46197 5.22433 8.88743 4.4624 10.4393 4.15372C11.9911 3.84504 13.5997 4.00346 15.0615 4.60896C16.5233 5.21447 17.7727 6.23984 18.6518 7.55544C19.5308 8.87103 20 10.4177 20 12C20 14.1217 19.1572 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20Z"
                                                    fill="#6CD7B2"/>
                                            </svg>
                                            : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                   viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="9" stroke="#7B7C7B" strokeWidth="2"/>
                                            </svg>
                                    }
                                    <span>{lang['Vote_Create_Auth_Badge_count']}</span>
                                </div>
                            </div>
                        </div>
                    }

                    <div className='input-area'>
                        <div className={'input-area-title'}>{lang['Vote_Create_Has_Start']}</div>
                        <AppDateInput value={startDate} onChange={e => {
                            typeof (e) === 'object' ? setStartDate(e[0]) : setStartDate(e)
                        }}/>
                    </div>

                    <div className='input-area'>
                        <div className={'toggle'}>
                            <div className={'item-title'}>{lang['Vote_Create_Has_Expire']}</div>
                            <div className={'item-value'}>
                                <Toggle checked={expireAble} onChange={e => {
                                    setExpireAble(e.target.checked)
                                }}/>
                            </div>
                        </div>
                    </div>
                    {expireAble &&
                        <div className='input-area'>
                            <AppDateInput value={expireDate} onChange={e => {
                                typeof (e) === 'object' ? setExpireDate(e[0]) : setExpireDate(e)
                            }}/>
                        </div>
                    }
                </div>

                {!!params?.vote ?
                    <AppButton special onClick={e => {
                        save()
                    }}>{lang['Profile_Edit_Save']}</AppButton>
                    : <AppButton special onClick={e => {
                        create()
                    }}>{lang['Vote_Create_Create_Btn']}</AppButton>
                }
            </div>
        </div>
    </>)
}

export default ComponentName
