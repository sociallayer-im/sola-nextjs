import Edit from '@/pages/event/[groupname]/create/'

export default function Page (props: {eventid : number}) {
    return <Edit eventId={props.eventid}/>
}

export const getServerSideProps: any = async (context: any) => {
    const {params} = context
    const eventid = Number(params?.eventid)
    return {
        props: {
            eventid
        }
    }
}
