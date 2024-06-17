import { zuAuthPopup } from "@/libs/zuauth"
import {edge_tickets} from './edge_tickets'
import {zuzalu_tickets} from './zuzalu_tickets'
import {setAuth} from "@/utils/authStorage";
import {useContext} from "react";
import userContext from "@/components/provider/UserProvider/UserContext";
import fetch from '@/utils/fetch'


function useZuAuth() {
    const {zupassLogin} = useContext(userContext)

    return async () => {
        const result: any = await zuAuthPopup({
            zupassUrl: 'https://zupass.org',
            fieldsToReveal: {
                revealAttendeeEmail: true,
                revealAttendeeName: true,
                revealEventId: true,
                revealProductId: true
            },
            watermark: '12345',
            config: [...edge_tickets, ...zuzalu_tickets],
            multi: true
        });

        if (result.type === "pcd" || result.type === "multi-pcd") {
            const response: any = await fetch.post({
                url: "/api/zupass",
                data: {pcdStr: result.pcdStr || JSON.stringify(result.pcds)}
            });

            if (response.status === 200) {
                const res = response.data
                window.localStorage.setItem('lastLoginType', 'zupass');
                setAuth(res.email, res.auth_token)
                zupassLogin()
            } else {
                throw new Error("Authentication failed");
            }
        }
    }
}

export default useZuAuth
