import {getEdgeToken} from "@/service/solas";
import {useContext, useEffect, useState} from "react";
import userContext from "@/components/provider/UserProvider/UserContext";


export default function EdgeToken() {
    const {user} = useContext(userContext)

    const [balance, setBalance] = useState<number>(0)

    useEffect(() => {
        (async () => {
           try {
               const balance = await getEdgeToken({auth_token: user.authToken || ''})
               setBalance(balance)
           } catch (e) {}
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
                Balance: {balance} ∈
            </div>
        </div>
    </div>
}
