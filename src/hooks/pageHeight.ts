import {useEffect, useState} from 'react'

const windowObj:any = typeof window !== 'undefined' ? window : undefined

export const usePageHeight = () => {
    //const height = typeof window !== 'undefined' ? window.innerHeight : 667
    const [windowHeight, setWindowHeight] = useState(2000)
    const [heightWithoutNav, setHeightWithoutNav] = useState(2000 - 48)

    useEffect(() => {
        const listener = () => {
            setWindowHeight(windowObj.innerHeight)
            setHeightWithoutNav(windowObj.innerHeight - 48)
        }

        if (windowObj) {
            listener()

            windowObj.addEventListener('resize', listener, false)
            windowObj.addEventListener('orientationchange', listener, false)

           return () => {
               windowObj.removeEventListener('resize', listener, false)
               windowObj.removeEventListener('orientationchange', listener, false)
           }
       }
    }, [windowObj])


    return { windowHeight, heightWithoutNav }
}

export default usePageHeight
