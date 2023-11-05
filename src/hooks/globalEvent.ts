import { useState, useEffect } from 'react'

export enum EVENT {
    badgeletListUpdate = 'badgeletListUpdate',
    badgeListUpdate = 'badgeListUpdate',
    presendListUpdate = 'presendListUpdate',
    VoteListUpdate = 'voteListUpdate',
    groupListUpdate = 'groupListUpdate',
    profileUpdate = 'profileUpdate',
    groupUpdate = 'groupUpdate',
    pointItemListUpdate = 'pointItemListUpdate',
    pointItemUpdate = 'pointItemUpdate',
    badgeletDetailUpdate = 'badgeletDetailUpdate',
    nftpassItemUpdate = 'nftpassItemUpdate',
    giftItemUpdate = 'giftItemUpdate',
    badgeDetailUpdate = 'badgeDetailUpdate',
    managerListUpdate = 'managerListUpdate',
    eventCheckin = 'eventCheckin',
    markerCheckin = 'markerCheckin',
    showFollowGuide = 'showFollowGuide',
}

export default function useEvent (eventName: EVENT) {
    const [data, setData] = useState<any>(null)

    const targetOrigin = typeof window != 'undefined' ? window.location.origin : undefined

    const post = (data: any) => {
        if (targetOrigin) {
            window.postMessage({event: eventName, data }, { targetOrigin })
        }
    }

    useEffect(() => {
       if (typeof window !== 'undefined') {
           const handle = (event: MessageEvent<any>) => {
               if (event.source !== window) return
               if (event.data.event !== eventName) return
               setData({...event.data.data})
           }
           window.addEventListener('message', handle)

           return () => {
               window.removeEventListener('message', handle)
           }
       }
    }, [])

    return [data, post]
}
