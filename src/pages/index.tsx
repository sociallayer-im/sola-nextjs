import Page from "@/pages/event/index"
import {useRouter as useClientRouter } from "next/navigation";
import MapPage from '@/pages/event/[groupname]/map'

export default function HomePage (props: {domain: string}) {
    const routerClient = useClientRouter()

    const needRedirect = (props.domain.includes('zumap.org'))
    // const needRedirect = (props.domain.includes('localhost'))

    console.log(needRedirect)

    if (needRedirect && typeof window !== 'undefined') {
        routerClient.push('/event/istanbul2023/map')
    }

    return needRedirect ? <MapPage markerType={null}/> : <Page />
}

export const getServerSideProps: any = (async (context: any) => {
    const domain = context.req.rawHeaders[1]
    console.log('visit domain: ', domain)
    return { props: { domain } }
})

