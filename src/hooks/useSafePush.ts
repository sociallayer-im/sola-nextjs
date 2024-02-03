import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const useSafePush = () => {
    const [onChanging, setOnChanging] = useState(false);
    const handleRouteChange = () => {
        setOnChanging(false);
    };
    const router = useRouter();
    // safePush is used to avoid route pushing errors when users click multiple times or when the network is slow:  "Error: Abort fetching component for route"
    const safePush = (path: string) => {
        if (onChanging) {
            return;
        }
        setOnChanging(true);
        router.push(path)
            .catch((e: any)=> {
                console.log('[savePush]:', e)
            })
    };

    useEffect(() => {
        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router, setOnChanging]);
    return { safePush };
};

export default useSafePush;