import {useContext, useState} from "react";
import { Fuel } from 'fuels';
import { FuelWalletConnector } from '@fuels/connectors';
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import fetch from "@/utils/fetch";
import {setAuth} from "@/utils/authStorage";
import userContext from "@/components/provider/UserProvider/UserContext";

export default function useFuelWallet() {
    const [fuel, setFuel] = useState<any>(null);
    const {showToast} = useContext(DialogsContext);
    const {setProfile} = useContext(userContext);

    const connectFuelWallet = async () => {
        const fuel = new Fuel({
            connectors: [new FuelWalletConnector()],
        });

        setFuel(fuel)
        await fuel.hasConnector()
        const hasConnector = await fuel.hasConnector();

        if (!hasConnector) {
            showToast('No connector found');
            return
        }

        try {
            await fuel.selectConnector('Fuel Wallet');
            await fuel.connect();
            const account = await fuel.currentAccount();
            if (!account) {
                throw new Error("Current account not authorized for this connection!");
            }
            const wallet = await fuel.getWallet(account);
            const domain = window.location.host
            const signature = await wallet.signMessage(`${domain} wants you to sign in with Mina account: \n ${account}`);
            const res = await fetch.post({
                url: '/api/fuel/authenticate',
                data: {
                    publicKey: account,
                    message: `${domain} wants you to sign in with Mina account: \n ${account}`,
                    signature: signature
                }
            })

            if (res.data.error) {
                throw new Error(res.data.error)
            }

            setProfile({authToken: res.data.auth_token})
            setAuth(res.data.address, res.data.auth_token!)
        } catch (e: any) {
            console.error(e)
            showToast(e.message || 'connect error')
        }
    }

    const disconnectFuelWallet = async () => {
        try {
            if (fuel) {
                await fuel.disconnect();
            }
        } catch (e) {
            console.log(e)
        }
    }

    return {fuel,connectFuelWallet, disconnectFuelWallet}
}
