import {useState, useContext, useEffect} from 'react'
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {searchEvent, Event} from '@/service/solas'
import CardEvent from "@/components/base/Cards/CardEvent/CardEvent";
import Empty from "@/components/base/Empty";

function ListSearchResultEvent(props: {keyword: string}) {
    const [result, setResult] = useState<Event[]>([])
    const {showLoading} = useContext(DialogsContext)

    const handleSearch = async (keyword: string) => {
        const unload = showLoading()
        try {
            const res = await searchEvent(keyword)
            unload()
            setResult(res)
        } catch (e: any) {
            console.error(e)
            unload()
        }
    }

    useEffect(() => {
        if (props.keyword) {
            handleSearch(props.keyword)
        }
    }, [props.keyword])

    return (<div className={'search-event-result'}>
        { !result.length && <Empty />}
        {result.map((item, index) => {
            return <CardEvent key={index} event={item}></CardEvent>
        })
        }
    </div>)
}

export default ListSearchResultEvent
