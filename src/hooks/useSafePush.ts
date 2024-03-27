import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

let onChanging = false

const useSafePush = () => {
    const handleRouteChangeStart = () => {
        onChanging = true;
    };
    const handleRouteChangeEnd = () => {
        onChanging = false;
    };


    const router = useRouter();
    // safePush is used to avoid route pushing errors when users click multiple times or when the network is slow:  "Error: Abort fetching component for route"
    const safePush = async (path: string) => {
        try {
            if (onChanging) {
                return;
            }
            await router.push(path)
        } catch (e: any) {
            console.log('[savePush]: ', e);
        }
    };

    useEffect(() => {
        router.events.on('routeChangeStart', handleRouteChangeStart);
        router.events.on('routeChangeComplete', handleRouteChangeEnd);
        router.events.on('routeChangeError', handleRouteChangeEnd);

        return () => {
            router.events.off('routeChangeStart', handleRouteChangeStart);
            router.events.off('routeChangeComplete', handleRouteChangeEnd);
            router.events.off('routeChangeError', handleRouteChangeEnd);
        };
    }, [router]);
    return { safePush };
};

export default useSafePush;
