import {Profile, queryEvent, userAppliedEvent} from "@/service/solas";
import Empty from "@/components/base/Empty";
import CardEvent from "@/components/base/Cards/CardEvent/CardEvent";
import scrollToLoad from "@/hooks/scrollToLoad";
import React, {useEffect} from "react";
import styles from './ListGroupEvent.module.sass'
import spinnerStyles from "@/components/compose/ListNftAsset/ListNftAsset.module.sass"
import {Spinner} from "baseui/spinner";

function ListGroupEvent({profile, isGroup}: { profile: Profile, isGroup?: boolean }) {
    const [ready, setReady] = React.useState(false)


    const getMyEvent = async (page: number) => {
        const now = new Date()
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()
        if (profile.id !== 0) {
            if (isGroup) {
                const res = await queryEvent({
                        group_id: profile.id,
                        page
                    }
                )
                setReady(true)
                return res
            } else {
                const res = await userAppliedEvent({id: profile.id, page})
                const list = res.map((item) => {
                    return item.event
                })
                setReady(true)
                return list
            }

        } else {
            setReady(true)
            return []
        }
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
        {!ready && <Spinner className={spinnerStyles.spinner} $color={'#98f6db'}/>}
        {!list.length && ready ? <Empty/> :
            <div className={'list maodao-event'}>
                {
                    list.map((item, index) => {
                        return <CardEvent participants={[]} fixed={false} key={item.id} event={item}/>
                    })
                }
                {!loading && <div ref={ref} style={{height: '10px'}}></div>}
            </div>
        }
    </div>)
}

export default ListGroupEvent
