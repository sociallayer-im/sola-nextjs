import {createSiweMessage} from "@/service/SIWE";
import {useContext} from "react";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import fetch from "@/utils/fetch";
import userContext from "@/components/provider/UserProvider/UserContext";
import {setAuth} from "@/utils/authStorage";

export default function useAuroWallet() {
    const _window: any = window
    const {showLoading, showToast} = useContext(DialogsContext)
    const {setProfile} = useContext(userContext)

    async function connect() {
        if (!_window.mina) {
            throw new Error('mina not found')
        }

        const unloaded = showLoading()
        try {
            const address = await _window.mina.requestAccounts()
            if (!address.length) {
               throw new Error('mina connect error')
            }

            const signed = await sign(address[0])
            console.log('signed', signed)
            const res = await fetch.post({
                url: '/api/mina/authenticate',
                data: signed
            })

            if (res.data.error) {
                throw new Error(res.data.error)
            }

            setProfile({authToken: res.data.auth_token})
            setAuth(res.data.address, res.data.auth_token!)
        } catch (e: any) {
            console.error(e)
            showToast(e.message || 'mina connect error')
        } finally {
            unloaded()
        }
    }

    async function sign(address: string) {
        const domain = window.location.host
        return await _window.mina.signMessage({
            message: `${domain} wants you to sign in with Mina account: \n ${address}.`
        })
    }

    return {connect, sign}
}
