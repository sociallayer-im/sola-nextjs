import {getEventCheckLog} from "@/service/solas";
import usePicture from "../../../hooks/pictrue";
import useFormatTime from "../../../hooks/formatTime";
import useScrollToLoad from "../../../hooks/scrollToLoad";

interface ListCheckinUserProps {
    eventId: number
}

function ListCheckLog(props: ListCheckinUserProps) {
    const {defaultAvatar} = usePicture()
    const formatTime = useFormatTime()

    const getLogs = async (page: number) => {
        return await getEventCheckLog({event_id: props.eventId!, page: page})
    }

    const goToProfile = (username: string) => {
        window.location.href = `/profile/${username}`
    }

    const {list, ref} = useScrollToLoad({
        queryFunction: getLogs,
        immediate: true,
    })

    return (<div className={'checklog-user-list'}>
        {
            list.map((item, index) => {
                return <div className={'user-list-item'} key={index} onClick={e => {goToProfile(item.profile.domain?.split('.')[0]!)}}>
                    <div className={'left'}>
                        <img src={item.profile.image_url || defaultAvatar(item.profile.id)} alt="" />
                        {item.profile.domain?.split('.')[0]}
                    </div>
                    <div className={'right'}>
                        {formatTime(item.created_at)}
                        {' 打卡成功'}
                    </div>
                </div>
            })
        }
        <div ref={ref} style={{height: '12px'}}></div>
    </div>)
}

export default ListCheckLog
