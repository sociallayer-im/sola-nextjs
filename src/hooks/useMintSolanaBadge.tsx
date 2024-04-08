import {useContext, useEffect, useRef, useState} from 'react'
import {useConnection, WalletContext as solanaWalletContext} from "@solana/wallet-adapter-react";
import {
    BadgeProgram,
    IDL,
    mintProfile,
    ProfileProgram,
    PROGRAM_ID,
    solaProfile,
    solaProfileGlobal
} from "@/service/solana/src";
import * as anchor from "@coral-xyz/anchor";
import fetch from "@/utils/fetch";
import UserContext from "@/components/provider/UserProvider/UserContext";
import {PublicKey, Transaction, ComputeBudgetProgram, Connection} from "@solana/web3.js";
import * as registry from "@/service/solana/src/registry";
import {Badge, uploadImage} from "@/service/solas";
import {BN} from "bn.js";

BN.prototype.toBuffer = BN.prototype.toArray as any

export interface SolanBadgeMetadata {
    description: string
    external_url: string
    name: string
    image?: string
    owner?: string
    creator?: string
    badge_id?: number
    create_at?: string
    attributes: {
        trait_type: any
        value: any
    }[]
}

export interface SolanaBadgeLet {
    metadataDetail: SolanBadgeMetadata
    mint: PublicKey
    publicKey: PublicKey
}

function useMintSolana() {
    const connectionContextState = useConnection()
    const solanaWallet = useContext<any>(solanaWalletContext)
    const programRef = useRef<any>(null)
    const {user} = useContext(UserContext)

    const [ready, setReady] = useState(false)

    useEffect(() => {
        console.log('Solana Wallet => ', solanaWallet)
        console.log('Solana connection =>', connectionContextState)
        if (solanaWallet.connected) {
            connectionContextState.connection.getAccountInfo(solanaWallet.publicKey).then((data) => {
                console.log('System Account info => ', data)
            })

            connectionContextState.connection.getParsedAccountInfo(solaProfileGlobal()[0]).then((data) => {
                console.log('Sola Account info =>', data)
            })

            const provider = new anchor.AnchorProvider(
                connectionContextState.connection,
                solanaWallet,
                anchor.AnchorProvider.defaultOptions()
            );

            programRef.current = new anchor.Program(IDL, PROGRAM_ID, provider);
            setReady(true)
            console.log('Program => ', programRef.current)
        }

    }, [connectionContextState, solanaWallet])

    // ok
    const getProfile = async (publicKey: PublicKey): Promise<number | null>  => {
        try {
            const program = programRef.current
            const profileProgram = new ProfileProgram(program);
            const profileId = await profileProgram.featchDefaultProfileId(new PublicKey(publicKey));
            return profileId.toNumber()
        } catch (e: any) {
            console.error(e)
            return null
        }
    }

    // ok
    const burnProfile = async (solarProfileId: number) => {
        try {
            const program = programRef.current
            const profileProgram = new ProfileProgram(program);
            const burnIx = await profileProgram.burnProfile(new BN(solarProfileId), solanaWallet.publicKey);

            const tx = await solanaWallet.sendTransaction(
                new Transaction()
                    .add(burnIx),
                connectionContextState.connection,
                {skipPreflight: true}
            );
            console.log('mint badge tx => ', tx)
        } catch (e: any) {
            throw e
        }
    }

    // ok
    const createProfile = async () => {
        if (!user.id || !user.wallet) {
            throw new Error('User not connect wallet')
        }


        const opt = {
            "profileId": user.id,
            "name": user.userName,
            "creators": [
                {
                    address: solanaWallet.publicKey,
                    share: 50
                }
            ],
            "curator": user.sol_address,
            "sellerFeeBasisPoints": 100,
            "symbol": 'USER',
            "uri": `${location.origin}/profile/${user.id}`,
            "isMutable": true,
            "to": user.sol_address
        }

        console.log('create profile opt => ', opt)

        const res = await fetch.post({
            url: 'https://pnsgraph.pns.link/mint-default-profile',
            data: opt
        })
        console.log(res)
    }

    // ok
    const mintBadge = async (badge: Badge,
                             solarProfileId: number,
                             to: string,
                             toUsername: string) => {
        console.log('mint badge => ', badge)
        console.log('mint solarProfileId => ', solarProfileId)
        console.log('mint to => ', to)
        let profileId = await getProfile(solanaWallet.publicKey)
        if (profileId === null) {
            await createProfile()
            profileId = await getProfile(solanaWallet.publicKey)
        }

        const metadata: SolanBadgeMetadata = {
            "description": badge.content || '',
            "external_url": `${location.origin}/badge/${badge.id}`,
            "image": badge.image_url,
            "name": badge.name,
            "owner": toUsername,
            "creator": badge.creator!.username!,
            "badge_id": badge.id,
            "create_at": new Date().toISOString(),
            "attributes": [
                {
                    "trait_type": "Name",
                    "value": badge.name
                },
                {
                    "trait_type": "Reason",
                    "value": badge.content
                },
                {
                    "trait_type": "Owner",
                    "value":toUsername
                },
                {
                    "trait_type": "Creator",
                    "value": badge.creator!.username
                },
                {
                    "trait_type": "Group",
                    "value": badge.group ? badge.group.username! : ''
                },
                {
                    "trait_type": "Image",
                    "value": badge.image_url
                }
            ]
        }

        const blob = new Blob([JSON.stringify(metadata, null, 2)], {type: 'application/json'});

        const uri = await uploadImage({
            file: blob,
            uploader: user.userName!,
            auth_token: user.authToken!
        })

        console.log('uri', uri)
        const badgeProgram = new BadgeProgram(programRef.current);

        const mintBadgeIx = await badgeProgram.mintBadge(
            new BN(solarProfileId),
            new BN(new Date().getTime()), // 这里需要填badgelet id。但是由于sola 逻辑问题，暂时用时间戳代替
            new BN(badge.id),
            {
                image: badge.image_url,
                name: badge.name,
                creators: [
                    {
                        address: solanaWallet.publicKey,
                        share: 100,
                    },
                ],
                sellerFeeBasisPoints: 0,
                symbol: "SOLAR",
                uri: uri,
                isMutable: true,
                weights: new BN(0),
                schema: "testSchema",
            } as any,
            solanaWallet.publicKey,
            new PublicKey(to),
            solanaWallet.publicKey
        );

        const tx = await solanaWallet.sendTransaction(
            new Transaction()
                .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
                .add(mintBadgeIx),
            connectionContextState.connection,
            {skipPreflight: false}
        );
        console.log('mint badge tx => ', tx)
        return tx
    }

    // ok
    const registBadge = async (solarBadge: Badge, solaProfileId: number) => {
        let profileId = await getProfile(solanaWallet.publicKey)
        if (profileId === null) {
            await createProfile()
            profileId = await getProfile(solanaWallet.publicKey)
        }

        console.log('controller => ', profileId)
        const profileProgram = new ProfileProgram(programRef.current);
        const registerIx = await profileProgram.register(
            new BN(solarBadge.id),
            new BN(profileId!),
            {
                fungible: false,
                transferable: true,
                revocable: false,
                address: solanaWallet.publicKey,
                schema: "solar badge class",
            },
            solanaWallet.publicKey
        );

        const tx = await solanaWallet.sendTransaction(
            new Transaction()
                .add(registerIx),
            connectionContextState.connection,
            {skipPreflight: true}
        );
        console.log('regist class id tx => ', tx)
        return tx
    }

    const getUserBadgelet = async (pubkeyStr: string) => {
        const provider = new anchor.AnchorProvider(
            new Connection('https://solana-devnet.g.alchemy.com/v2/1UAaWELx7H9MNYPmMUwxGTLssmWjsbh_'),
            solanaWallet,
            anchor.AnchorProvider.defaultOptions()
        );

        const program = new anchor.Program(IDL, PROGRAM_ID, provider);
        const badgeProgram = new BadgeProgram(program);
        const badgelet: any = await badgeProgram.featchBadges(new PublicKey(pubkeyStr));
        console.log('badgelet => ', badgelet)
        return badgelet as SolanaBadgeLet[]
    }

    return {
        ready,
        mintBadge,
        getUserBadgelet,
        registBadge,
        burnProfile
    }
}

export default useMintSolana
