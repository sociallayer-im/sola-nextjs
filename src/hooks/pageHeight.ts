import {useEffect, useState} from 'react'

export const usePageHeight = () => {
    const height = typeof window !== 'undefined' ? window.innerHeight : 667
    const [windowHeight, setWindowHeight] = useState(height)
    const [heightWithoutNav, setHeightWithoutNav] = useState(height - 48)

    useEffect(() => {
       if (typeof window !== 'undefined') {
           const listener = () => {
               setWindowHeight(window.innerHeight)
               setHeightWithoutNav(window.innerHeight - 48)
           }

           window.addEventListener('resize', listener, false)
           window.addEventListener('orientationchange', listener, false)

           return () => {
               window.removeEventListener('resize', listener, false)
               window.removeEventListener('orientationchange', listener, false)
           }
       }
    }, [])


    return { windowHeight, heightWithoutNav }
}

export default usePageHeight
