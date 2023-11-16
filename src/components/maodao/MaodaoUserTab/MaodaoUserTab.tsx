import {useNavigate} from 'react-router-dom'
import {useStyletron} from 'baseui'
import React, {useState, useContext, useEffect} from 'react'
import ListNftAsset from "@/components/compose/ListNftAsset/ListNftAsset";
import MaodaoMyEvent from "@/components/maodao/MaodaoMyEvent/MaodaoMyEvent";
import AppButton from "@/components/base/AppButton/AppButton";
import solas, {Profile} from "@/service/solas";
import userContext from "@/components/provider/UserProvider/UserContext";
import langContext from "@/components/provider/LangProvider/LangContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import dynamic from "next/dynamic";
import CardBadgelet from "@/components/base/Cards/CardBadgelet/CardBadgelet";
import ListUserAssets, {ListUserAssetsMethods} from "@/components/base/ListUserAssets/ListUserAssets";

const UserRecognition = dynamic(() => import('@/components/compose/ListUserRecognition/ListUserRecognition'), {
    loading: () => <p>Loading...</p>,
})

function MaodaoUserTab({profile}: {profile: Profile}) {
    const {user} = useContext(userContext)
    const {lang} = useContext(langContext)
    const {openConnectWalletDialog} = useContext(DialogsContext)
    const [isEmptyBadge, setIsEmptyBadge] = useState(true)


    const getBadgelet = async (page: number) => {
        const publicBadgelet =  await solas.queryBadgelet({
            show_hidden: user.id === profile.id ? 1 : undefined,
            owner_id: profile.id,
            page
        })

        const privateBadgelet =  await solas.queryPrivacyBadgelet({
            show_hidden: user.id === profile.id ? 1 : undefined,
            owner_id: profile.id,
            page
        })

        const res = [...publicBadgelet, ...privateBadgelet].sort((a, b) => {
            return b.id - a.id
        })

        setIsEmptyBadge(res.length === 0 && page === 1)

        return res
    }

    const listWrapperRefBadgeLet = React.createRef<ListUserAssetsMethods>()
    useEffect(() => {
        !!listWrapperRefBadgeLet.current && listWrapperRefBadgeLet.current!.refresh()
    }, [profile])

    return (<div>
        <div className='maodao-nft'>
            <ListNftAsset profile={profile} type={'maodao'} title={'RPC'}/>
        </div>

        {!isEmptyBadge &&
            <div style={{margin: '20px 12px 0 12px'}}>
                <div className={'list-user-recognition'}>
                    <div className={'list-title'}>{lang['Badgelet_List_Title']}</div>
                    <ListUserAssets
                        queryFcn={getBadgelet}
                        onRef={listWrapperRefBadgeLet}
                        child={(item, key) => <CardBadgelet badgelet={item} key={key}/>}/>
                </div>
            </div>
        }

        {!profile?.id && profile?.id === user.id &&
            <MaodaoMyEvent profile={profile}/>
        }

        {!user.authToken &&
            <div className={'home-login-panel'} style={{margin: '0 12px'}}>
                <img src="/images/balloon.png" alt=""/>
                <div className={'text'}>{lang['Activity_login_des']}</div>
                <AppButton onClick={e => {
                    openConnectWalletDialog()
                }} special size={'compact'}>{lang['Activity_login_btn']}</AppButton>
            </div>
        }
    </div>)
}

export default MaodaoUserTab
