import {zuAuthPopup} from "@pcd/zuauth";
import {tickets} from './tickets'
import {setAuth} from "@/utils/authStorage";
import {useContext} from "react";
import userContext from "@/components/provider/UserProvider/UserContext";
import fetch from '@/utils/fetch'

function useZuAuth() {
    const {zupassLogin} = useContext(userContext)

    return async () => {
        const result: any = await zuAuthPopup({
            fieldsToReveal: {
                revealAttendeeEmail: true,
                revealAttendeeName: true,
                revealEventId: true,
                revealProductId: true
            },
            watermark: '12345',
            config: tickets as any
        });

        if (result.type === "pcd") {
            const response: any = await fetch.post({
                url: "/api/zupass",
                data: {pcdStr: result.pcdStr}
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
