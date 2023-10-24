import {useContext} from 'react'
import {Event, Participants, queryEvent} from '@/service/solas'
import userContext from "../../provider/UserProvider/UserContext";
import CardEvent from "../../base/Cards/CardEvent/CardEvent";
import HorizontalList from "../../base/HorizontalList/HorizontalList";


function ListMyCreatedEvent(props: {emptyCallBack?: () => any, participants?: Participants[]}) {
    const {user} = useContext(userContext)


    const getMyEvent = async (page: number) => {
        if (user.id) {
            const res = await queryEvent({owner_id: user.id, page})
            if (page === 1 && res.length === 0) {
                !!props.emptyCallBack && props.emptyCallBack()
            }
            return res
        } return []
    }

    return (<div>
        <HorizontalList
            queryFunction={ getMyEvent }
            item={(itemData: Event) => <CardEvent participants={props.participants || []} event={itemData} />}
            space={ 16 }
            itemWidth={ 300 }
            itemHeight={ 162}
        />
    </div>)
}

export default ListMyCreatedEvent
