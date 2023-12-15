import {EdDSATicketPCDPackage, ITicketData} from "@pcd/eddsa-ticket-pcd";
import {ArgumentTypeName} from "@pcd/pcd-types";
import {SemaphoreIdentityPCDPackage} from "@pcd/semaphore-identity-pcd";
// import {
//     EdDSATicketFieldsToReveal,
//     ZKEdDSAEventTicketPCDArgs,
//     ZKEdDSAEventTicketPCDPackage
// } from "@pcd/zk-eddsa-event-ticket-pcd";
import {useContext, useEffect, useState} from "react";
import {constructZupassPcdGetRequestUrl} from "./PassportInterface";
import {openZupassPopup} from "./PassportPopup";
import {supportedEvents} from "./zupass-config";
import {setAuth} from "@/utils/authStorage";
import userContext from "@/components/provider/UserProvider/UserContext";
import {useRouter} from "next/navigation";

const ZUPASS_URL = "https://zupass.org";

type  EdDSATicketFieldsToReveal = any
type   ZKEdDSAEventTicketPCDArgs = any

/**
 * Opens a Zupass popup to make a proof of a ZK EdDSA event ticket PCD.
 */
async function openZKEdDSAEventTicketPopup(
    fieldsToReveal: EdDSATicketFieldsToReveal,
    watermark: bigint,
    validEventIds: string[],
    validProductIds: string[]
) {

    const args: ZKEdDSAEventTicketPCDArgs = {
        ticket: {
            argumentType: ArgumentTypeName.PCD,
            pcdType: EdDSATicketPCDPackage.name,
            value: undefined,
            userProvided: true,
            validatorParams: {
                eventIds: validEventIds,
                productIds: validProductIds,
                notFoundMessage: "No eligible PCDs found"
            }
        },
        identity: {
            argumentType: ArgumentTypeName.PCD,
            pcdType: SemaphoreIdentityPCDPackage.name,
            value: undefined,
            userProvided: true
        },
        validEventIds: {
            argumentType: ArgumentTypeName.StringArray,
            value: validEventIds.length != 0 ? validEventIds : undefined,
            userProvided: false
        },
        fieldsToReveal: {
            argumentType: ArgumentTypeName.ToggleList,
            value: fieldsToReveal,
            userProvided: false
        },
        watermark: {
            argumentType: ArgumentTypeName.BigInt,
            value: watermark.toString(),
            userProvided: false
        },
        externalNullifier: {
            argumentType: ArgumentTypeName.BigInt,
            value: watermark.toString(),
            userProvided: false
        }
    };

    const popupUrl = window.location.origin + "/zupass/popup";

    const {ZKEdDSAEventTicketPCDPackage} = (await import('@pcd/zk-eddsa-event-ticket-pcd'))

    const proofUrl = constructZupassPcdGetRequestUrl<typeof ZKEdDSAEventTicketPCDPackage>(ZUPASS_URL, popupUrl, ZKEdDSAEventTicketPCDPackage.name, args, {
        genericProveScreen: true,
        title: "ZKEdDSA Ticket Proof",
        description: "ZKEdDSA Ticket PCD Request"
    });

    openZupassPopup(popupUrl, proofUrl);
}

type PartialTicketData = Partial<ITicketData>;

export async function login() {
    window.localStorage.setItem('zupass_return', window.location.href)
    const nonce = await (
        await fetch("/api/zupass/nonce", {credentials: "include"})
    ).text();
    openZKEdDSAEventTicketPopup(
        {
            revealAttendeeEmail: true,
            revealEventId: true,
            revealProductId: true
        },
        BigInt(nonce),
        supportedEvents,
        []
    );
}

export function useZupass(): {
    ticketData: PartialTicketData | undefined;
    zupassAuth: (pcdStr: string) => Promise<void>;
} {
    const [ticketData, setTicketData] = useState<PartialTicketData | undefined>(
        undefined
    );

    const router = useRouter()

    const {zupassLogin} = useContext(userContext)

    const zupassAuth = async function (pcdStr: string) {
        if (pcdStr) {
            const response = await fetch("/api/zupass/authenticate", {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                },
                body: pcdStr
            });

            if (response.status === 200) {
                // setTicketData(await response.json());
                const res = await response.json()
                window.localStorage.setItem('lastLoginType', 'zupass');
                setAuth(res.email, res.auth_token)
                zupassLogin()
                const return_url = window.localStorage.getItem('zupass_return')
                if (return_url) {
                    window.localStorage.removeItem('zupass_return')
                    router.push(return_url.replace(window.location.origin, ''))
                } else {
                    router.push('/')
                }
            }
        }
    }

    return {zupassAuth, ticketData};
}
