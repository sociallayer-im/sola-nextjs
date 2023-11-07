import React, {useEffect, useRef} from 'react'
import {Profile} from "@/service/solas";
import Alchemy, {NftDetail} from "@/service/alchemy/alchemy";
import ListUserAssets, {ListUserAssetsMethods} from "@/components/base/ListUserAssets/ListUserAssets";
import CardNft from "@/components/base/Cards/CardNft/CardNft";
import {queryDomainByWalletAddress} from "@/service/pns";
import {DotBitAccount, getDotBitAccount} from "@/service/dotbit";
import CardDotBit from "@/components/base/Cards/CardDotBit/CardDotBit";
import styles from './ListNftAsset.module.sass'
import {Spinner} from "baseui/spinner";

function ListNftAsset({profile, type, manual, title=''}: { profile: Profile, type: string, title?: string, manual?:boolean }) {
    const [ready, setReady] = React.useState(false)
    const profileRef = useRef<null | Profile>(null)

    const getNft = async (page: number): Promise<NftDetail[]> => {
        if (profile.id === 0 && !profile.address) {
            setReady(true)
            return []
        }

        if (profile.address && page <= 1) {
            try {
                if (type === 'ens') {
                    return await Alchemy.getEnsBalance(profile.address)
                } else if (type === 'pns') {
                    return await queryDomainByWalletAddress(profile.address)
                } else if (type === 'maodao') {
                    return await Alchemy.getMaodaoNft(profile.address)
                } else if (type === 'seedao') {
                    return await Alchemy.getSeedaoNft(profile.address)
                }else return []
            } finally {
                setReady(true)
            }
        } else {
            setReady(true)
            return [] as NftDetail[]
        }
    }

    const getDotbit = async (page: number): Promise<DotBitAccount[]> => {
        try {
            if (profile.address && page === 1) {
                return await getDotBitAccount(profile.address)
            }

            return [] as DotBitAccount[]
        } finally {
            setReady(true)
        }
    }

    const listRef = React.createRef<ListUserAssetsMethods>()
    useEffect(() => {
        listRef.current && listRef.current!.refresh()
    }, [profile])


    return (
        <>
            {title &&
                <div className={'list-title'} style={{ fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color:'var(--color-text-main)',
                    marginTop: '15px',
                    marginBottom: '15px'}}>{title}</div>
            }
            <div className={styles.wrapper}>
                {!ready && <Spinner className={styles.spinner} $color={'#98f6db'}/>}
                {type === 'dotbit' ?
                    <ListUserAssets
                        queryFcn={getDotbit}
                        onRef={listRef}
                        child={(item: DotBitAccount, key) => <CardDotBit key={key} detail={item}/>}/>
                    : <ListUserAssets
                        queryFcn={getNft}
                        onRef={listRef}
                        immediate={true}
                        child={(item: NftDetail, key) => <CardNft key={key}
                                                                  type={type === 'maodao' ? 'badge': 'nft'}
                                                                  detail={item}/>}/>
                }
            </div>
        </>
    )
}

export default ListNftAsset
