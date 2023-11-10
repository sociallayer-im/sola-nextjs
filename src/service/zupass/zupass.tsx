import {EdDSATicketPCDPackage, ITicketData} from "@pcd/eddsa-ticket-pcd";
import {ArgumentTypeName} from "@pcd/pcd-types";
import {SemaphoreIdentityPCDPackage} from "@pcd/semaphore-identity-pcd";
import {
    EdDSATicketFieldsToReveal,
    ZKEdDSAEventTicketPCDArgs,
    ZKEdDSAEventTicketPCDPackage
} from "@pcd/zk-eddsa-event-ticket-pcd";
import {useContext, useEffect, useState} from "react";
import {constructZupassPcdGetRequestUrl} from "./PassportInterface";
import {openZupassPopup, useZupassPopupMessages} from "./PassportPopup";
import {supportedEvents} from "./zupass-config";
import {setAuth} from "@/utils/authStorage";
import userContext from "@/components/provider/UserProvider/UserContext";

const ZUPASS_URL = "https://zupass.org";

/**
 * Opens a Zupass popup to make a proof of a ZK EdDSA event ticket PCD.
 */
function openZKEdDSAEventTicketPopup(
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

    const proofUrl = constructZupassPcdGetRequestUrl<typeof ZKEdDSAEventTicketPCDPackage>(ZUPASS_URL, popupUrl, ZKEdDSAEventTicketPCDPackage.name, args, {
        genericProveScreen: true,
        title: "ZKEdDSA Ticket Proof",
        description: "ZKEdDSA Ticket PCD Request"
    });

    openZupassPopup(popupUrl, proofUrl);
}

type PartialTicketData = Partial<ITicketData>;

async function login() {
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
    login: () => Promise<void>;
    ticketData: PartialTicketData | undefined;
} {
    const [pcdStr] = useZupassPopupMessages();
    const [ticketData, setTicketData] = useState<PartialTicketData | undefined>(
        undefined
    );

    const {zupassLogin} = useContext(userContext)

    useEffect(() => {
        (async () => {
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
                }
            }
        })();
    }, [pcdStr]);

    return {login, ticketData};
}
