import type {NextApiRequest, NextApiResponse} from 'next'
import path from "path";
import {
    createProofInstance,
    NUniqueJubmojiInCollectionProof,
    NUniqueJubmojisInCollection,
} from "@/libs/jubmoji-api/src";
import {jubmojiCheckin} from "@/service/solas";

const cardEventMap: any = {
    '0403a3bf364825e32af785d1691bd4248e39457090955ea2fff4e2e6ec1f7372b2271bcf23718d930ef8a21c22876487989eda2c2a64740910ec237ef9d100e62c': 57
}
const cards = [
    '0403a3bf364825e32af785d1691bd4248e39457090955ea2fff4e2e6ec1f7372b2271bcf23718d930ef8a21c22876487989eda2c2a64740910ec237ef9d100e62c'
]


/**
 * Demonstrates how to verify a proof from a URL.
 * collectionPubKeys, sigNullifierRandomness, N are obtained from your specific quest.
 * You must copy the verification key from https://github.com/jubmoji/jubmoji.quest/tree/main/apps/jubmoji-quest/public/circuits and set its path to pathToCircuits.
 * @param urlEncodedProof - URL-encoded proof passed in 'proof' query parameter
 * @param sigNullifierRandomness - Randomness used to generate unique signature nullifiers
 * @param N - Number of unique cards a user must have Jubmojis from
 * @param pathToCircuits - Path to the circuits directory
 * @returns True if proof is valid, false otherwise
 */

export const urlVerification = async (
    urlEncodedProof: string,
    sigNullifierRandomness: string,
    N: number,
    pathToCircuits: string
): Promise<{ res: boolean, consumedSigNullifiers?: BigInt[], marker?: number }> => {
    const decodedProof = JSON.parse(
        decodeURIComponent(urlEncodedProof)
    ) as NUniqueJubmojiInCollectionProof;

    for (let i = 0; i < cards.length; i++) {
        const proofInstance = createProofInstance(NUniqueJubmojisInCollection, {
            collectionPubKeys: [cards[i]],
            sigNullifierRandomness,
            N,
            pathToCircuits,
        });

        const handleVerify = await proofInstance.verify(
            decodedProof
        );

        if (handleVerify.verified) {
            return {
                res: true,
                consumedSigNullifiers: handleVerify.consumedSigNullifiers,
                marker: cardEventMap[cards[i]]
            }
        }
    }

    return {res: false}
};

const sigNullifierRandomness = "af528a28cc2134b8b5f25a610c8778973f082a52ca2a291578bcb321a02d"
const N = 1

type ResponseData = {
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method === 'POST') {
        const {auth_token, proof} = req.body as { auth_token?: string, proof?: string }

        if (!auth_token || !proof) {
            res.status(200).json({result: 'fail', message: 'Invalid parameters'} as any)
            return
        }

        const result = await urlVerification(
            proof!,
            sigNullifierRandomness,
            N,
            process.env.NODE_ENV === 'production' ? path.resolve('public/') + '/' : './public/',
        ).catch(err => {
            console.error('err', err)
            res.status(500).json({result: 'fail', message: err.message} as any)
        })

        if (result && result.res && result.marker) {
            console.log('consumedSigNullifiers', result)
            await jubmojiCheckin({
                reaction_type: 'message',
                auth_token,
                id: result.marker,
            }).catch((e: any) => {
                console.error('err', e)
                res.status(500).json({result: 'fail', message: e.message} as any)
            })

            res.status(200).json({result: 'ok', marker_id: result.marker} as any)
        } else {
            res.status(200).json({result: 'fail', message: 'Invalid proof'} as any)
        }
    } else {
        res.status(404).json({result: 'fail', message: 'api not exits'} as any)
    }
}
