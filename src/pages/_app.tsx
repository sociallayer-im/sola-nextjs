import React from 'react';
import '@/styles/index.sass'

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
import {configureChains, createClient, WagmiConfig} from 'wagmi'
import {styletron} from '@/styletron'

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



function MyApp({Component, pageProps}: any) {
  return (
      <PageBacProvider>
          <WagmiConfig client={wagmiClient as any}>
              <StyletronProvider value={styletron}>
                  <BaseProvider theme={theme}>
                      <DialogProvider>
                          <UserProvider>
                              <LangProvider>
                                  <DialogProvider>
                                      <Layout>
                                          <Component {...pageProps} />
                                      </Layout>
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
