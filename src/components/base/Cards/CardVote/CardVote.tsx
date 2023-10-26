import Link from 'next/link'
import {useContext, useEffect, useState} from 'react'
import ProfileBio from "../../ProfileBio/ProfileBio";
import {
    BadgeWithBadgelets,
    castVote,
    getVoteDetail,
    Profile,
    queryBadgeDetail,
    queryUserGroup,
    queryVoteRecords,
    Vote,
    VoteRecord,
} from "@/service/solas";
import userContext from "../../../provider/UserProvider/UserContext";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import LangContext from "../../../provider/LangProvider/LangContext";
import usePicture from "../../../../hooks/pictrue";
import useTime from "../../../../hooks/formatTime";

function ProgressBar(props: { lang: string, total: number, current: number, text: string, onClick?: (optionid: number) => any, id: number, link?: string, voted?: boolean, voters?: Profile[] }) {
    const width = Math.floor(props.current / props.total * 100) + '%'
    const openUrl = function (url: string) {
        window.open(url, '_blank')
    }

    const {defaultAvatar} = usePicture()

    return (<div className={'vote-option'} onClick={e => {
        // e.stopPropagation()
        !!props.onClick && props.onClick(props.id)
    }}>
        <div className={'option-info'}>
            <div className={'text'}>
                <div>{props.text}</div>
                {!!props.link &&
                    <div className='link icon-icon_share' onClick={e => {
                        e.stopPropagation()
                        openUrl(props.link!)
                    }}/>
                }
                {!!props.voted &&
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <path d="M2 6L6 10L14 2" stroke="#6CD7B2" strokeWidth="2.4" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                }
            </div>
            <div className={'count'}>
                {props.current}
                <div className={'present'}>
                    {props.lang} , {props.total === 0 ? 0 : Math.floor(props.current / props.total * 100)}%
                </div>
            </div>
        </div>
        <div className={`vote-option-progress-bar ${props.voted ? 'voted' : ''}`}>
            <div className={'progress'} style={{width}}></div>
        </div>
        {
            !!props.voted && !!props.voters &&
            <div className={'voters'}>
                {
                    props.voters.map((voter, index) => {
                        return <Link href={`/profile/${voter.id}`} key={index}>
                            <img src={voter.image_url || defaultAvatar(voter.id)} alt=""/>
                        </Link>
                    })
                }
            </div>

        }
        {((props.text.length > 15 && window.innerWidth <= 850) || (props.text.length > 30 && window.innerWidth > 850)) &&
            <div className={'tool-tip'}>{props.text}</div>
        }
    </div>)
}

function CardVote(props: { item: Vote }) {
    const {user} = useContext(userContext)
    const {showToast, showLoading, openConfirmDialog} = useContext(DialogsContext)
    const formatTime = useTime()
    const {lang} = useContext(LangContext)


    const [voteCount, setVoteCount] = useState<number[]>(Array(props.item.options.length).fill(0))
    const [userVote, setUserVote] = useState<number[]>([])
    const [records, setRecords] = useState<VoteRecord[]>([])
    const [voteDetail, setVoteDetail] = useState<Vote>(props.item)
    const [voters, setVoters] = useState<Profile[][]>(Array(props.item.options.length).fill([]))
    const [badge, setBadge] = useState<BadgeWithBadgelets | null>(null)
    const [canVote, setCanVote] = useState<boolean>(false)

    const ending = voteDetail.ending_time ? new Date(voteDetail.ending_time).getTime() < Date.now() : false

    async function init(options?: { id?: number, link: string | null, title: string , weight: number }[]) {
        const records = await getRecord()
        setRecords(records)

        const voterList = Array(voteDetail.options.length).fill([]);
        (options || voteDetail.options)
            .sort((a, b) => {
                return a.id! - b.id!
            })
            .map((item, index) => {
                const voter = records.filter((record) => record.vote_option_id === item.id).map(r => r.voter)
                voterList[index] = voter
            })

        setVoters(voterList)

        console.log('voteDetail.options', voteDetail.options);
        const voteCounter = (options || voteDetail.options)
            .sort((a, b) => {
                return a.id! - b.id!
            })
            .map((item, index) => {
                return item.weight
            })

        if (!badge && voteDetail.eligibile_badge_id) {
            const badge = await queryBadgeDetail({id: voteDetail.eligibile_badge_id})
            setBadge(badge)
        }

        console.log('voteCounter', voteCounter)
        setTimeout(() => {
            setVoteCount(voteCounter)
        }, 600)
    }

    const checkCanVote = async () => {
        if (!user.id) {
            setCanVote(false)
            return
        }

        if (props.item.eligibility_strategy === 'has_group_membership') {
            const userGroup = await queryUserGroup({profile_id: user.id})
            const joinedGroup = userGroup.filter((group) => group.id === props.item.group_id)
            setCanVote(!!joinedGroup.length)
            return
        }

        if (props.item.eligibility_strategy === 'has_badge' || props.item.eligibility_strategy === 'badge_count') {
            if (badge) {
                const hasBadge = badge.badgelets.find((badgelet) => badgelet.owner.id === user.id)
                setCanVote(!!hasBadge)
                return
            }
        }

        setCanVote(false)
        return
    }


    useEffect(() => {
        init()
    }, [])

    useEffect(() => {
        checkCanVote()
    }, [user.id, badge])

    const refleshVote = async () => {
        const vote = await getVoteDetail(props.item.id)
        setVoteDetail(vote!)
        setTimeout(() => {
            init(vote!.options)
        }, 600)
    }

    useEffect(() => {
        if (user.id && records.length > 0) {
            const userRecord = records.filter((record) => record.voter_id === user.id).map((record) => record.vote_options || [record.vote_option_id!])
            let _userRecord: number[] = []
            userRecord.map((record) => {
                _userRecord = [..._userRecord, ...record]
            })
           setTimeout(() => {
               setUserVote(_userRecord)
           }, 300)
        }
    }, [user.id, records])

    const getRecord = async () => {
        let res: VoteRecord[] = []
        let page = 1
        const get = () => {
            return new Promise(async (resolve, reject) => {
                const records = await queryVoteRecords({
                    proposal_id: props.item.id,
                    page: page,
                })

                res = [...res, ...records]
                page++
                if (records.length === 20) {
                    await get()
                } else {
                    resolve('')
                }
            })
        }
        await get()
        return res
    }

    const handleVote = async (optionid: number) => {
        const unload = showLoading()
        try {
            const createvote = await castVote({
                id: props.item.id,
                option: [optionid],
                auth_token: user.authToken || ''
            })
            unload()
            refleshVote()
            showToast('Vote success')
        } catch (e: any) {
            unload()
            console.error(e)
            showToast(e.message)
        }
    }

    const showConfirm = (option: any) => {
        if (!user.id) {
            showToast('Please login first')
            return
        }

        if (!canVote) {
            if (props.item.eligibility_strategy === 'has_group_membership') {
                showToast(lang['Vote_Eligibility_Member'])
                return
            }
            if (props.item.eligibility_strategy === 'has_badge') {
                showToast(lang['Vote_Eligibility_Badge']([badge?.name]))
                return
            }

            return
        }

        if (ending) {
            return
        }

        if (userVote.length) {
            showToast(lang['Vote_Already_Voted'])
            return
        }

        const dialog = openConfirmDialog({
            confirmLabel: lang['Vote_Confirm_Dialog_Confirm'],
            cancelLabel: lang['Vote_Confirm_Dialog_Cancel'],
            title:  lang['Vote_Confirm_Dialog_Title']([option.title]),
            content: lang['Vote_Confirm_Dialog_Des'],
            onConfirm: async (close: () => any) => {
                close()
                await handleVote(option.id)
            }
        })
    }


    let status = ending ? 'ending' : ''

    return (<div className={`vote-card ${status}`}>
        <Link href={`/vote/${voteDetail.id}`} scroll={true}></Link>
        <div className={'vote-title'}>
            <div>{props.item.title}</div>
            <div className={'count'}>{voteDetail.voter_count} {lang['Vote_Create_Voters']}</div>
        </div>
        <ProfileBio text={props.item.content}></ProfileBio>
        <div className={'options'}>
            {voteDetail.options
                .sort((a, b) => {
                    return a.id - b.id
                })
                .map((option, index) => {
                    return <ProgressBar
                        lang={lang['Vote_Create_Voters']}
                        text={option.title}
                        total={voteDetail.weight_count}
                        current={voteCount[index]}
                        key={option.id}
                        id={option.id}
                        voters={voteDetail.show_voter ? voters[index] : undefined}
                        voted={userVote.includes(option.id)}
                        onClick={e => {
                            showConfirm(option)
                        }}
                        link={option.link || undefined}/>
                })
            }
        </div>
        <div className={'vote-tips'}>
            { props.item.max_choice === 1 &&
                <div>· {lang['Vote_Close_Once']}</div>
            }
            {props.item.eligibility_strategy === 'has_group_membership' &&
                <div>· {lang['Vote_Eligibility_Member']}</div>
            }
            {(props.item.eligibility_strategy === 'has_badge' || props.item.eligibility_strategy === 'badge_count') &&
                <div>· {lang['Vote_Eligibility_Badge']([badge?.name])}</div>
            }
            {!!props.item.ending_time &&
                <div>· {lang['Vote_Close_Time']}{formatTime(props.item.ending_time)}</div>
            }
            {new Date(props.item.start_time).getTime() > new Date().getTime() &&
                <div>· {lang['Vote_Start_Time']}{formatTime(props.item.start_time)}</div>
            }
        </div>
    </div>)
}

export default CardVote
