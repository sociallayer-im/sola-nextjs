import Page from "@/pages/event/index"
import {useRouter as useClientRouter } from "next/navigation";
import MapPage from '@/pages/event/[groupname]/map'
import {useEffect, useState} from "react";

export default function HomePage () {
    console.log('zumap', process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap')
    return <>
        {
            process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap' ?  <MapPage markerType={null}/> : <Page />
        }
    </>
}
