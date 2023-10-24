import { useParams } from 'next/navigation'
import CreateBadgeNonPrefill from './NonPrefill'

function CreateEvent() {
    const params = useParams()
    return  <CreateBadgeNonPrefill eventId={params?.eventid ? Number(params?.eventid) : undefined}/>
}

export default CreateEvent
