import React, {useEffect} from 'react'
import {Profile} from "@/service/solas";
import Alchemy, {NftDetail} from "@/service/alchemy/alchemy";
import ListUserAssets, {ListUserAssetsMethods} from "@/components/base/ListUserAssets/ListUserAssets";
import CardNft from "@/components/base/Cards/CardNft/CardNft";
import {queryDomainByWalletAddress} from "@/service/pns";
import {DotBitAccount, getDotBitAccount} from "@/service/dotbit";
import CardDotBit from "@/components/base/Cards/CardDotBit/CardDotBit";

function ListNftAsset({profile, type}: { profile: Profile, type: string }) {
    const getNft = async (page: number) => {
        if (profile.address && page === 1) {
            if (type === 'ens') {
                return await Alchemy.getNftBalance(profile.address, type as any)
            }
            if (type === 'pns') {
                return await queryDomainByWalletAddress(profile.address)
            }
        } else {
            return []
        }
    }

    const getDotbit = async (page: number) => {
        if (profile.address && page === 1) {
            return await getDotBitAccount(profile.address)
        } else {
            return []
        }
    }

    const listRef = React.createRef<ListUserAssetsMethods>()
    useEffect(() => {
        if (profile.id) {
            !!listRef.current && listRef.current!.refresh()
        }
    }, [profile])


    return (<>
            {type === 'dotbit' ?
                <ListUserAssets
                    queryFcn={getDotbit}
                    onRef={listRef}
                    child={(item: DotBitAccount, key) => <CardDotBit key={key} detail={item}/>}/>
                : <ListUserAssets
                    queryFcn={getNft}
                    onRef={listRef}
                    child={(item: NftDetail, key) => <CardNft key={key} detail={item}/>}/>
            }
        </>
    )
}

export default ListNftAsset
