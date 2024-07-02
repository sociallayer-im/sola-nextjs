import {getGroupPass, GroupPass, Profile} from "@/service/solas";
import {useTime5} from "@/hooks/formatTime";
import React, {useEffect} from "react";
import usePicture from "@/hooks/pictrue";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import useZuAuth from "@/service/zupass/useZuAuth";


export default function ZupassTicket({user}: { user: Profile }) {
    const {defaultAvatar} = usePicture()
    const {showLoading, showToast} = React.useContext(DialogsContext)
    const zuAuthLogin = useZuAuth()

    const [passes, setPasses] = React.useState<GroupPass[]>([])

    useEffect(() => {
        (async () => {
            const pass = await getGroupPass({profile_id: user.id, group_id: 3409})
            setPasses(pass)
        })()
    }, [user.id])

    return <div className={'zupass-ticket-info'}>
        <div className={'title'}>
            <div className={'left'}>
                <img src="/images/edge_logo.svg" width={20} height={24}
                     alt=""/>
                {'My tickets'} {passes.length ? `(${passes.length})` : ''}
            </div>

            <div className={'right'}>
                <img src={user.image_url || defaultAvatar(user.id)}
                     width={16} height={16} alt=""/>
                {user.nickname || user.username}
            </div>
        </div>

        {
            passes.length ?
                <div>
                    {
                        passes.map((pass, index) => {
                            return <div className={'tickets'} key={index}>
                                <div className="name">{pass.zupass_product_name}</div>
                                <div className="date">
                                    {useTime5(pass.start_date!, pass.end_date!, Intl.DateTimeFormat().resolvedOptions().timeZone)}
                                </div>
                            </div>
                        })
                    }
                </div>
                : <div>
                    <div style={{fontSize: '16px', marginBottom: '12px', marginTop: '12px', fontWeight: 600}}>Add Ticket in Zupass to RSVP</div>
                    <AppButton kind={'primary'}
                               onClick={async () => {
                                   const unload = showLoading()
                                   try {
                                       await zuAuthLogin()
                                   } catch (e: any) {
                                       showToast(e.message)
                                   } finally {
                                       unload()
                                   }
                               }}>
                        Add Ticket in Zupass
                    </AppButton>
                </div>
        }
    </div>
}
