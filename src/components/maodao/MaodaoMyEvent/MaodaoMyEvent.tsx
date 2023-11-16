import {Participants, Profile, queryEvent, queryMyEvent, userAppliedEvent} from "@/service/solas";
import Empty from "@/components/base/Empty";
import CardEvent from "@/components/base/Cards/CardEvent/CardEvent";
import scrollToLoad from "@/hooks/scrollToLoad";
import userContext from "@/components/provider/UserProvider/UserContext";
import React, {useContext, useEffect} from "react";
import styles from './MaodaoMyEvent.module.sass'
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";

function MaodaoMyEvent({profile, isGroup}: { profile: Profile, isGroup?: boolean }) {
    const {user} = useContext(userContext)
    const {eventGroup} = useContext(EventHomeContext)


    const getMyEvent = async (page: number) => {
        if (profile.id !== 0) {
            if (isGroup) {
                const res = await queryEvent({group_id: profile.id, page})
                return  res
            } else {
                const res = await userAppliedEvent({id: profile.id, page})
                const list = res.map((item) => {
                    return item.event
                })
                return list
            }

        } else return []
    }

    const {list, ref, refresh, loading} = scrollToLoad({
        queryFunction: getMyEvent
    })

    useEffect(() => {
        refresh()
    }, [profile.id])

    return (<div className={styles.wrapper}>
        <div className={'list-title'} style={{
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '24px',
            color: 'var(--color-text-main)',
            marginTop: '15px',
            marginBottom: '15px'
        }}>{isGroup ? "Created Events" : 'Applied Events'}</div>
        {!list.length ? <Empty/> :
            <div className={'list maodao-event'}>
                {
                    list.map((item, index) => {
                        return <CardEvent participants={[]} fixed={false} key={item.id} event={item}/>
                    })
                }
                {!loading && <div ref={ref}></div>}
            </div>
        }
    </div>)
}

export default MaodaoMyEvent
