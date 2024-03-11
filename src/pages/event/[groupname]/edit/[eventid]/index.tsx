import Edit from '@/pages/event/[groupname]/create/'

export default function Page (props: {eventId: number}) {
    return <Edit eventId={props.eventId} />
}

export const getServerSideProps: any = async (context: any) => {
    const {params} = context
    const eventId = Number(params?.eventid as string)
    return {
        props: {
            eventId
        }
    }
}
