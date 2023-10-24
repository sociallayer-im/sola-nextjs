import {useContext} from 'react'
import {Event, Participants, queryMyEvent}  from '@/service/solas'
import userContext from "../../provider/UserProvider/UserContext";
import HorizontalList from "../../base/HorizontalList/HorizontalList";
import CardEvent from "../../base/Cards/CardEvent/CardEvent";

function ListMyAttentedEvent(props: {emptyCallBack?: () => any}) {
    const {user} = useContext(userContext)


    const getMyEvent = async (page: number) => {
        if (user.authToken) {
            const res = await queryMyEvent({auth_token: user.authToken, page})
            const list =  res.map((item: Participants) => item.event)
            if (page === 1 && list.length === 0) {
                !!props.emptyCallBack && props.emptyCallBack()
            }
            return list
        } return []
        // return []
    }

    return (<div>
        <HorizontalList
            queryFunction={ getMyEvent }
            item={(itemData: Event) => <CardEvent event={itemData} attend={true} />}
            space={ 16 }
            itemWidth={ 300 }
            itemHeight={ 162 }
        />
    </div>)
}

export default ListMyAttentedEvent
