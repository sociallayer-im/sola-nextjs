import { useParams } from 'next/navigation'
import CreateBadgeNonPrefill, {CreateEventPageProps} from './NonPrefill'

function CreateEvent(props: CreateEventPageProps) {
    const params = useParams()
    return  <CreateBadgeNonPrefill groupname={props?.groupname as any} eventId={params?.eventid ? Number(params?.eventid) : undefined}/>
}

export default CreateEvent

export const getServerSideProps: any = async (context: any) => {
    const {params} = context
    const groupname = params?.groupname as string
    return {
        props: {
            groupname
        }
    }
}


