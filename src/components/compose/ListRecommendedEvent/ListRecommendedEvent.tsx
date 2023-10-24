import {useContext, useState, useRef} from 'react'
import {Event, queryRecommendEvent} from '@/service/solas'
import HorizontalList from "@/components/base/HorizontalList/HorizontalList";
import CardEvent from "@/components/base/Cards/CardEvent/CardEvent";
import LangContext from "@/components/provider/LangProvider/LangContext";

function ListRecommendedEvent() {
    const {lang} = useContext(LangContext)
    const [showList, setShowList] = useState(true)
    const list = useRef<any>(null)

    const getMyEvent = async (page: number) => {
        const res = await queryRecommendEvent({page: page, rec: 'top'})
        setShowList(!(page === 1 && res.length === 0))
        return res
    }

    return (<>
        { showList &&
            <div>
                <div className={'module-title'}>
                    {lang['Activity_Commended']}
                </div>
                <HorizontalList
                    queryFunction={getMyEvent}
                    item={(itemData: Event) => <CardEvent event={itemData}/>}
                    space={16}
                    itemWidth={300}
                    itemHeight={162}
                    onRef={list}
                />
            </div>
        }
    </>)
}

export default ListRecommendedEvent
