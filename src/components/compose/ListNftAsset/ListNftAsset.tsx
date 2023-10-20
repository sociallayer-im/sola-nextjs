import React, {useEffect} from 'react'
import {Profile} from "@/service/solas";
import Alchemy, {NftDetail} from "@/service/alchemy/alchemy";
import ListUserAssets, {ListUserAssetsMethods} from "@/components/base/ListUserAssets/ListUserAssets";
import CardNft from "@/components/base/Cards/CardNft/CardNft";
import {queryDomainByWalletAddress} from "@/service/pns";
import {DotBitAccount, getDotBitAccount} from "@/service/dotbit";
import CardDotBit from "@/components/base/Cards/CardDotBit/CardDotBit";
import styles from './ListNftAsset.module.sass'
import {Spinner} from "baseui/spinner";

function ListNftAsset({profile, type}: { profile: Profile, type: string }) {
    const [ready, setReady] = React.useState(false)

    const getNft = async (page: number): Promise<NftDetail[]> => {
        if (profile.address && page === 1) {
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
        if (profile.id) {
            !!listRef.current && listRef.current!.refresh()

            const a = Alchemy.getSeedaoNft('0x332345477db00239f88ca2eb015b159750cf3c44').then(res=> {
                console.log('getSeedaoNftgetSeedaoNft==', res)
            })
        }
    }, [profile])


    return (<div className={styles.wrapper}>
            {!ready && <Spinner className={styles.spinner} $color={'#98f6db'}/>}
            {type === 'dotbit' ?
                <ListUserAssets
                    queryFcn={getDotbit}
                    onRef={listRef}
                    child={(item: DotBitAccount, key) => <CardDotBit key={key} detail={item}/>}/>
                : <ListUserAssets
                    queryFcn={getNft}
                    onRef={listRef}
                    child={(item: NftDetail, key) => <CardNft key={key}
                                                              type={type === 'maodao' ? 'badge': 'nft'}
                                                              detail={item}/>}/>
            }
        </div>
    )
}

export default ListNftAsset
