import React from 'react';
import '@/styles/index.sass'
import NextNProgress from 'nextjs-progressbar';

import Layout from "@/components/Layout/Layout";

// providers
import LangProvider from "@/components/provider/LangProvider/LangProvider"
import DialogProvider from "@/components/provider/DialogProvider/DialogProvider"
import PageBacProvider from "@/components/provider/PageBackProvider";
import UserProvider from "@/components/provider/UserProvider/UserProvider";
import theme from "@/theme"
import {Provider as StyletronProvider} from 'styletron-react'
import {BaseProvider} from 'baseui'
import {mainnet, moonbeam} from 'wagmi/chains'
import {InjectedConnector} from 'wagmi/connectors/injected'
import {publicProvider} from 'wagmi/providers/public'
import {configureChains, createConfig, WagmiConfig} from 'wagmi'
import {styletron} from '@/styletron'
import Head from 'next/head'
import MapProvider from "@/components/provider/MapProvider/MapProvider";
import EventHomeProvider from "@/components/provider/EventHomeProvider/EventHomeProvider";

const inject = new InjectedConnector({
    chains: [mainnet, moonbeam],
} as any)

const {chains, publicClient, webSocketPublicClient} = configureChains(
    [mainnet, moonbeam],
    [publicProvider()],
)

const config = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
})

function MyApp({Component, pageProps}: any) {
    return (
        <PageBacProvider>
            <Head>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
                <script src={'/jslib/google.map.js'} async></script>
                <title>Social Layer</title>
            </Head>
            <WagmiConfig config={config as any}>
                <StyletronProvider value={styletron}>
                    <BaseProvider theme={theme}>
                        <DialogProvider>
                            <UserProvider>
                                <LangProvider>
                                    <DialogProvider>
                                        <MapProvider>
                                            <EventHomeProvider>
                                                <Layout>
                                                    <NextNProgress options={{showSpinner: false}}/>
                                                    <Component {...pageProps} />
                                                </Layout>
                                            </EventHomeProvider>
                                        </MapProvider>
                                    </DialogProvider>
                                </LangProvider>
                            </UserProvider>
                        </DialogProvider>
                    </BaseProvider>
                </StyletronProvider>
            </WagmiConfig>
        </PageBacProvider>
    );
}

export default MyApp;
