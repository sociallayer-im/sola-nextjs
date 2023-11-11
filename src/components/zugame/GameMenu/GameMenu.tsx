import {useContext, useEffect, useState} from 'react'
import styles from './GameMenu.module.scss'
import userContext from "@/components/provider/UserProvider/UserContext";
import {zuGameTeams} from "@/components/zugame/setting";
import {zugameInfo} from '@/service/solas'
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import PageBack from "@/components/base/PageBack";
import usePicture from "@/hooks/pictrue";
import Empty from "@/components/base/Empty";

function DialogLeaderboard() {
    const {openDialog} = useContext(DialogsContext)

    const Dialog = (props: { detail: any, close: () => any }) => {
        const a_list = (Object.values(props.detail.a)as number[]).reduce((a: number, b: number) => a + b, 0)
        const b_list = (Object.values(props.detail.b) as number[]).reduce((a: number, b: number) => a + b, 0)
        const c_list = (Object.values(props.detail.c)as number[]).reduce((a: number, b: number) => a + b, 0)
        const sortedList: any = [
            {team: 'a', count: a_list, profiles: Object.values(props.detail.a_profiles as any), checkinInfo: props.detail.a},
            {team: 'b', count: b_list, profiles: Object.values(props.detail.b_profiles as any ), checkinInfo: props.detail.b},
            {team: 'c', count: c_list, profiles: Object.values(props.detail.c_profiles as any), checkinInfo: props.detail.c},
        ].sort((a, b) => b.count - a.count)

        const [selected, setSelected] = useState(0)
        const {defaultAvatar} = usePicture()

        return <div className={styles['leader-board']}>
            <div className={styles['center']}>
                <PageBack title={'Leaderboard'} onClose={props.close}/>
                <div className={styles['tab-titles']}>
                    {
                        sortedList.map((item: any, index: number) => {
                            const team = zuGameTeams.find(team => team.value === item.team)!
                            return <div onClick={() => {
                                setSelected(index)
                            }}
                                        className={index === selected ? styles['tab-title-active'] : styles['tab-title']}
                                        key={item.team}>
                                <div>No. {index + 1}</div>
                                <div>{team.icon} {team.name}</div>
                            </div>
                        })
                    }
                </div>
                <div className={styles['profiles']}>
                    { sortedList[selected].profiles.length === 0 && <Empty />}
                    {
                        sortedList[selected].profiles.map((item: any, index: number) => {
                            const checkinCount =  sortedList[selected].checkinInfo[item.id.toString()]

                            return <div className={styles['profile']} key={item.id}>
                                <div className={styles['avatar-info']}>
                                    <img className={styles['avatar']} src={item.image_url || defaultAvatar(item.id)}
                                         alt=""/>
                                    <div>{item.nickname || item.username}</div>
                                </div>
                                <div className={styles['checkin-count']}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="17" viewBox="0 0 13 17" fill="none">
                                        <path d="M13 16.9209L12.0331 10.0314H0.966942L0 16.9209H4.55269V13.7649C4.55269 12.6905 5.42562 11.8176 6.5 11.8176C7.57438 11.8176 8.44731 12.6905 8.44731 13.7649V16.9209H13Z" fill="#394434"/>
                                        <path d="M9.41422 3.49174V4.3781H7.69521V3.49174H6.83571V1.92045H9.69625L8.78302 1.28926L9.69625 0.658058H6.83571V0.335744C6.83571 0.147727 6.68798 0 6.49996 0C6.31195 0 6.16422 0.147727 6.16422 0.335744V3.49174H5.30472V4.3781H3.58571V3.49174H1.8667V10.3409H11.1467V3.49174H9.41422ZM5.35843 8.66219H3.53199V6.95661C3.53199 6.44628 3.93488 6.04339 4.44521 6.04339C4.95554 6.04339 5.35843 6.44628 5.35843 6.95661V8.66219ZM9.46794 8.66219H7.64149V6.95661C7.64149 6.44628 8.04439 6.04339 8.55472 6.04339C9.06505 6.04339 9.46794 6.44628 9.46794 6.95661V8.66219Z" fill="#394434"/>
                                    </svg>
                                    <div className={styles['count']}>{checkinCount}</div>
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
        </div>
    }

    return (gameStats: any) => {
        const dialog = openDialog({
            content: (close: any) => <Dialog detail={gameStats} close={close}/>,
            size: ['100%', '100%'],
        })
    }
}

function GameMenu() {
    const [show, setShow] = useState(false)
    const {user} = useContext(userContext)
    const [team, setTeam] = useState<any>(null)
    const [gameStats, setGameStats] = useState<any>(null)
    const openDialog = DialogLeaderboard()

    useEffect(() => {
        const stats = zugameInfo().then(res => {
            setGameStats(res)
        })
        setTimeout(() => {
            const role = localStorage.getItem('zugame_team')
            if (role) {
                setTeam(zuGameTeams.find(item => item.value === role))
                setShow(true)
            }
        }, 300)
    }, [user.id])

    return (<>
        {show &&
            <div className={styles['zugame-menu']}>
                {team &&
                    <>
                        <div className={styles['role']}>
                            <div className={styles['icon']}>
                                {team.icon}
                            </div>
                            <div className={styles['name']}>
                                {team.name}
                            </div>
                            <div className={styles['des']}>
                                Your role
                            </div>
                        </div>
                        <div className={styles['menu']} onClick={() => {
                            if (gameStats) {
                                openDialog(gameStats)
                            }
                        }}>
                            <div className={styles['icon']}>
                                {'🏁'}
                            </div>
                            <div className={styles['name']}>
                                {'Leaderboard'}
                            </div>
                        </div>
                    </>
                }
            </div>
        }
    </>)
}

export default GameMenu
