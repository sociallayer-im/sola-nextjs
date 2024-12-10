import {connect, Zapp} from "@parcnet-js/app-connector"
import {pod} from "../../node_modules/@parcnet-js/podspec/dist/index";
import {useContext} from "react";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import fetch from "@/utils/fetch";
import UserContext from "@/components/provider/UserProvider/UserContext";

const Collection = "Social Layer Event Attendance"

const solarZapp: Zapp = {
    name: "Social Layer",
    permissions: {
        REQUEST_PROOF: {collections: [Collection]},
        SIGN_POD: {},
        READ_POD: {collections: [Collection]},
        INSERT_POD: {collections: [Collection]},
        DELETE_POD: {collections: [Collection]},
        READ_PUBLIC_IDENTIFIERS: {}
    }
}


export const useZupassTicket = () => {
    const {showLoading, showToast} = useContext(DialogsContext)
    const {user} = useContext(UserContext)

    const claimPOD = async (event_id: number) => {
        if (!user?.authToken) {
            showToast('Please login first')
            return
        }

        const unloading = showLoading()
        try {
            const res = await fetch.post({
                url: '/api/zupass/issue',
                data: {
                    event_id,
                    auth_token: user?.authToken || ''
                }
            })

            if (res.data.error) {
                showToast(res.data.error)
                return
            }

            const {entries, signature, signerPublicKey} = res.data

            const clientUrl = "https://zupass.org"
            const element = document.getElementById('zapp-connector')
            const z = await connect(solarZapp, element!, clientUrl);


            // check if already claimed
            const query = pod({
                entries: {
                    event_id: {type: "string"},
                }
            });

            const result = await z.pod.collection(Collection).query(query);
            if (result.length > 0) {
                const ifExist = result.some(pod => {
                    return pod.signature === signature
                })

                if (ifExist) {
                    showToast('You have already claimed this POD')
                    return
                }
            }

            await z.pod.collection(Collection).insert({
                entries: {
                    ...entries,
                    start_date: {type: "date", value: new Date(entries.start_date.value)},
                    end_date: {type: "date", value: new Date(entries.end_date.value)}
                },
                signature,
                signerPublicKey
            });
            showToast('Claimed POD successfully')
            setTimeout(() => {
                location.href='https://zupass.org'
            }, 1000)
        } catch (e: any) {
            console.error(e)
            showToast(e.message || 'Failed to claim POD')
        } finally {
            unloading()
        }
    }

    return {claimPOD}
}
