'use client'

import './globals.scss'
import Layout from "@/components/Layout/Layout";

// providers
import LangProvider from "@/components/provider/LangProvider/LangProvider"
import DialogProvider from "@/components/provider/DialogProvider/DialogProvider"
import PageBacProvider from "@/components/provider/PageBackProvider";
import UserProvider from "@/components/provider/UserProvider/UserProvider";
import theme from "@/theme"
import {Client , Server} from 'styletron-engine-atomic'
import {Provider as StyletronProvider} from 'styletron-react'
import {BaseProvider} from 'baseui'
import {mainnet, moonbeam} from 'wagmi/chains'
import {InjectedConnector} from 'wagmi/connectors/injected'
import {publicProvider} from 'wagmi/providers/public'
import {configureChains, createClient, WagmiConfig} from 'wagmi'

const engine = typeof window === 'undefined'
    ? new Server()
    : new Client({hydrate: document.getElementsByClassName('_styletron_hydrate_')});
console.log(engine)

const inject = new InjectedConnector({
    chains: [mainnet, moonbeam],
} as any)

const {chains, provider} = configureChains(
    ([mainnet, moonbeam] as any),
    [publicProvider()],
)

const wagmiClient = createClient({
    autoConnect: true,
    connectors: [inject],
    provider,
})

export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>
        <PageBacProvider>
            <WagmiConfig client={wagmiClient as any}>
                <StyletronProvider value={engine}>
                    <BaseProvider theme={theme}>
                        <DialogProvider>
                            <UserProvider>
                                <LangProvider>
                                    <DialogProvider>
                                        <Layout>
                                            {children}
                                        </Layout>
                                    </DialogProvider>
                                </LangProvider>
                            </UserProvider>
                        </DialogProvider>
                    </BaseProvider>
                </StyletronProvider>
            </WagmiConfig>
        </PageBacProvider>
        </body>
        </html>
    )
}
