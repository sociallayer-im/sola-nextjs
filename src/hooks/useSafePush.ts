import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const useSafePush = () => {
    const [onChanging, setOnChanging] = useState(false);
    const handleRouteChange = () => {
        // console.log('handleRouteChangeComplete')
        setOnChanging(false);
    };
    const handleRouteChangeStart = () => {
        // console.trace('handleRouteChangeStart')
        setOnChanging(true);
    };

    const router = useRouter();
    // safePush is used to avoid route pushing errors when users click multiple times or when the network is slow:  "Error: Abort fetching component for route"
    const safePush = (path: string) => {
        if (onChanging) {
            return;
        }
        router.push(path)
            .catch((e: any)=> {
                console.log('[safePush]:', e)
            })
    };

    useEffect(() => {
        router.events.on('routeChangeComplete', handleRouteChange);
        router.events.on('routeChangeError', handleRouteChange);
        router.events.on('routeChangeStart', handleRouteChangeStart);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
            router.events.off('routeChangeError', handleRouteChange);
            router.events.off('routeChangeStart', handleRouteChangeStart);
        };
    }, [router, setOnChanging]);
    return { safePush };
};

export default useSafePush;
