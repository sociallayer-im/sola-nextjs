import type { Adapter, WalletError } from '@solana/wallet-adapter-base';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider as ReactUIWalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { type SolanaSignInInput } from '@solana/wallet-standard-features';
import { verifySignIn } from '@solana/wallet-standard-util';
import { clusterApiUrl } from '@solana/web3.js';
import { TrustWalletAdapter } from '@solana/wallet-adapter-wallets';
import { SnackbarProvider, useSnackbar } from 'notistack';
import type { FC, ReactNode } from 'react';
import React, { useCallback, useMemo } from 'react';

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const autoConnect = true;

    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = WalletAdapterNetwork.Mainnet;
    // const network = 'devnet';

    // You can also provide a custom RPC endpoint
    // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    // https://rpc.ankr.com/solana_devnet
    // http://localhost:8899
    // https://solana-devnet.g.alchemy.com/v2/1UAaWELx7H9MNYPmMUwxGTLssmWjsbh_
    const endpoint = useMemo(() => 'https://solana-devnet.g.alchemy.com/v2/1UAaWELx7H9MNYPmMUwxGTLssmWjsbh_', [network]);

    const wallets = useMemo(
        () => [
            /**
             * Wallets that implement either of these standards will be available automatically.
             *
             *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
             *     (https://github.com/solana-mobile/mobile-wallet-adapter)
             *   - Solana Wallet Standard
             *     (https://github.com/solana-labs/wallet-standard)
             *
             * If you wish to support a wallet that supports neither of those standards,
             * instantiate its legacy wallet adapter here. Common legacy adapters can be found
             * in the npm package `@solana/wallet-adapter-wallets`.
             */
            new TrustWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    const { enqueueSnackbar } = useSnackbar();
    const onError = useCallback(
        (error: WalletError, adapter?: Adapter) => {
            enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
            console.error(error, adapter);
        },
        [enqueueSnackbar]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
                <ReactUIWalletModalProvider>{children}</ReactUIWalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <SnackbarProvider>
            <WalletContextProvider>{children}</WalletContextProvider>
        </SnackbarProvider>
    );
};
