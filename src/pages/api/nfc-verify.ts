import type {NextApiRequest, NextApiResponse} from 'next'

import {
    createProofInstance,
    NUniqueJubmojiInCollectionProof,
    NUniqueJubmojisInCollection,
} from "@/libs/jubmoji-api/src";

/**
 * Demonstrates how to verify a proof from a URL.
 * collectionPubKeys, sigNullifierRandomness, N are obtained from your specific quest.
 * You must copy the verification key from https://github.com/jubmoji/jubmoji.quest/tree/main/apps/jubmoji-quest/public/circuits and set its path to pathToCircuits.
 * @param urlEncodedProof - URL-encoded proof passed in 'proof' query parameter
 * @param collectionPubKeys - Public keys of cards in the collection from https://github.com/jubmoji/jubmoji.quest/blob/main/packages/jubmoji-api/src/data/cardPubKeys.ts
 * @param sigNullifierRandomness - Randomness used to generate unique signature nullifiers
 * @param N - Number of unique cards a user must have Jubmojis from
 * @param pathToCircuits - Path to the circuits directory
 * @returns True if proof is valid, false otherwise
 */

export const urlVerification = async (
    urlEncodedProof: string,
    collectionPubKeys: string[],
    sigNullifierRandomness: string,
    N: number,
    pathToCircuits: string
): Promise<{ res: boolean, consumedSigNullifiers?: BigInt[] }> => {
    const decodedProof = JSON.parse(
        decodeURIComponent(urlEncodedProof)
    ) as NUniqueJubmojiInCollectionProof;

    const proofInstance = createProofInstance(NUniqueJubmojisInCollection, {
        collectionPubKeys,
        sigNullifierRandomness,
        N,
        pathToCircuits,
    });
    console.log('=======', proofInstance)
    const {verified, consumedSigNullifiers} = await proofInstance.verify(
        decodedProof
    );
    if (!verified) {
        return {res: false};
    }

    // TODO: Check that consumedSigNullifiers have not been used before

    // TODO: Update nullifier list with consumedSigNullifiers

    return {consumedSigNullifiers, res: true}
};

const urlEncode = '%257B%2522serializedMembershipProofs%2522%253A%255B%2522%257B%255C%2522R%255C%2522%253A%255C%2522%257B%255C%255C%255C%2522x%255C%255C%255C%2522%253A%255C%255C%255C%25221ebe1f05b5cca85ed51558ac61517948e44449f29ff8b8d2a786fdc1437d56e8%255C%255C%255C%2522%252C%255C%255C%255C%2522y%255C%255C%255C%2522%253A%255C%255C%255C%2522332f3cd6a5fecc60a482a13697c619292988367f38b584365669e3444ebae0d%255C%255C%255C%2522%257D%255C%2522%252C%255C%2522msgHash%255C%2522%253A%255C%25224d8d8e712c1f3d57af775b21130ac3065e94d23eedfde044320161056909c28%255C%2522%252C%255C%2522zkp%255C%2522%253A%257B%255C%2522proof%255C%2522%253A%257B%255C%2522pi_a%255C%2522%253A%255B%255C%252212905031605671510471089000321790970878974875924285454914719373012466268002881%255C%2522%252C%255C%2522972179031344866123438345312174535255944789698911085950964034013766365662225%255C%2522%252C%255C%25221%255C%2522%255D%252C%255C%2522pi_b%255C%2522%253A%255B%255B%255C%252217001512766073475891208309990378121510791661690843480738410664523063042242143%255C%2522%252C%255C%252214730010772161963467648360766360664519699282582012505445046396534223373049070%255C%2522%255D%252C%255B%255C%252211732988293611252658378178944079059674485704787655311518274386506734193635175%255C%2522%252C%255C%252217615758640998795293041853797708770960053225287377834304387564047568380809488%255C%2522%255D%252C%255B%255C%25221%255C%2522%252C%255C%25220%255C%2522%255D%255D%252C%255C%2522pi_c%255C%2522%253A%255B%255C%252220184812336411922726800623700054051074562694790491689408786126787096153478749%255C%2522%252C%255C%252213014589490528894402667880536994978871004900067354087920901418431151444823939%255C%2522%252C%255C%25221%255C%2522%255D%252C%255C%2522protocol%255C%2522%253A%255C%2522groth16%255C%2522%252C%255C%2522curve%255C%2522%253A%255C%2522bn128%255C%2522%257D%252C%255C%2522publicSignals%255C%2522%253A%255B%255C%252211343521353445205678712392621989614358776102862778008496373570070057787556897%255C%2522%252C%255C%2522319259654117538709240551994991610672818289807964607655658618729741554084098%255C%2522%252C%255C%252212025261489538133196163379134824446117922864283320349922252353471382441435462%255C%2522%252C%255C%25227853244697412789567401147482856404710664020580053742301829709084729082153145%255C%2522%252C%255C%252216937500500604759995675570802115084972366285446478308199402400904447617497608%255C%2522%252C%255C%252214550501894204566965036958645360828904226582948180285591120882274650928299192%255C%2522%252C%255C%252214615768351878744894965252981438093930348550176146019604959537891714827481752%255C%2522%252C%255C%25229591943279121628355220046000782951608790671440115362970589544618060776634017%255C%2522%252C%255C%25221210030876194374647482234541663178009512136864574997739373008376882634797%255C%2522%255D%257D%257D%2522%255D%257D'
const collectionPubKeys = ["0403a3bf364825e32af785d1691bd4248e39457090955ea2fff4e2e6ec1f7372b2271bcf23718d930ef8a21c22876487989eda2c2a64740910ec237ef9d100e62c"]
const sigNullifierRandomness = "af528a28cc2134b8b5f25a610c8778973f082a52ca2a291578bcb321a02d"
const N = 1
// const pathToCircuits = './'
//
// const verify = urlVerification(
//     decodeURI(urlEncode),
//     collectionPubKeys,
//     sigNullifierRandomness,
//     N,
//     pathToCircuits
// ).then(res => {
//     console.log('res', res)
// })


type ResponseData = {
    message: string
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method === 'POST') {
        const {auth_token, proof} = req.body as { auth_token?: string, proof?: string }

        if (!auth_token || !proof) {
            res.status(200).json({result: 'fail', message: 'Invalid parameters'} as any)
        }

        const verify = urlVerification(
            proof!,
            collectionPubKeys,
            sigNullifierRandomness,
            N,
            './public/',
        )
            .then(result => {
                if (result.res) {
                    console.log('consumedSigNullifiers', result.consumedSigNullifiers)
                    // todo find marker
                    // todo handle chackin
                    res.status(200).json({result: 'ok', marker_id: 3} as any )
                } else {
                    res.status(200).json({result: 'fail', message: 'Invalid proof'} as any)
                }
            })
            .catch(err => {
                console.error('err', err)
                res.status(500).json({result: 'fail', message: err.message} as any)
            })
    }
    else {
        res.status(404).json({result: 'fail', message: 'api not exits'} as any)
    }
}
