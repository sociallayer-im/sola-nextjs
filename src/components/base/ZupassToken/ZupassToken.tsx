import {getGroupPass, getZupassToken, GroupPass, Profile} from "@/service/solas";
import {useEffect, useContext, useState} from "react";
import usePicture from "@/hooks/pictrue";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext"
import useZuAuth from "@/service/zupass/useZuAuth"
import userContext from "@/components/provider/UserProvider/UserContext";


export default function ZupassToken() {
    const {defaultAvatar} = usePicture()
    const {showLoading, showToast} = useContext(DialogsContext)
    const zuAuthLogin = useZuAuth()
    const {user} = useContext(userContext)

    const [balance, setBalance] = useState<number>(0)

    useEffect(() => {
        (async () => {
            const balance = await getZupassToken({auth_token: user.authToken || ''})
            setBalance(balance)
        })()
    }, [user.id])

    return <div className={'zupass-ticket-info'}>
        <div className={'title'}>
            <div className={'left'}>
                <img src="/images/edge_logo.svg" width={20} height={24}
                     alt=""/>
                {'Community token'}
            </div>
        </div>

        <div className={'tokens'}>
            <div className="date" style={{padding: 0}}>
                {user.email}
            </div>
        </div>

        <div className={'tokens'}>
            <div className="date">
                Balance:  {balance} EDGE
            </div>
        </div>
    </div>
}
