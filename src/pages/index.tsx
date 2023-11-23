import Page from "@/pages/event/index"
import {useRouter as useClientRouter } from "next/navigation";
import MapPage from '@/pages/event/[groupname]/map'
import {useEffect, useState} from "react";
import MaodaoHome from  '@/pages/rpc'

export default function HomePage() {
    return <>
        {
            process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap' ?
                <MapPage markerType={null}/> :
                process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao' ?
                    <MaodaoHome />
                    : <Page/>
        }
    </>
}
