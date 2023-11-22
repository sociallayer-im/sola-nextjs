import '@/styles/index.sass'

import UserProvider from "@/components/provider/UserProvider/UserProvider";
import {configureChains, createConfig, WagmiConfig} from "wagmi";
import {mainnet} from "wagmi/chains";
import {publicProvider} from 'wagmi/providers/public'

function UserProviderTest(props: {children: any}) {

    const {chains, publicClient, webSocketPublicClient} = configureChains(
        [mainnet],
        [publicProvider()],
    )

    const config = createConfig({
        autoConnect: true,
        publicClient,
        webSocketPublicClient,
    })


    return <WagmiConfig config={config as any}>
        <UserProvider>
            {props.children}
        </UserProvider>
    </WagmiConfig>
}

export default UserProviderTest
