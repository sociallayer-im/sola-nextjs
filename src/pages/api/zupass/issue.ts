import {NextApiRequest, NextApiResponse} from "next/dist/shared/lib/utils";
import {myProfile, queryEventDetail, queryGroupDetail} from "@/service/solas";
import podLib from "@pcd/pod";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const {event_id, auth_token} = req.body

        if (!auth_token) {
            res.status(200).send({error: "invalid auth_token"});
            return
        }

        const profile = await myProfile({auth_token, retryTimes: 3})

        if (!profile) {
            res.status(200).send({error: "profile not found"});
            return
        }

        if (!profile.email) {
            res.status(200).send({error: "Please bind a email first"});
            return
        }

        const event = await queryEventDetail({id: Number(event_id)})

        if (!event) {
            res.status(200).send({error: "event not found"});
            return
        }

        const ifJoined = event.participants?.some(p => p.profile.id === profile.id)

        if (!ifJoined) {
            res.status(200).send({error: "Please join the event first"});
            return
        }

        const group = await queryGroupDetail(event.group_id!)

        if (!group) {
            res.status(200).send({error: "group not found"});
            return
        }

        const entries: podLib.PODEntries = {
            "pod_type": {
                type: "string",
                value: `app.sola.day/attendance`,
            },
            "version": {
                type: "string",
                value: "1.0.0",
            },
            "zupass_display": {
                type: "string",
                value: "collectable",
            },
            "event_id": {
                type: "string",
                value: event.id.toString(),
            },
            "zupass_image_url": {
                type: "string",
                value: event.cover_url || group.image_url || "https://ik.imagekit.io/soladata/3tty9dpr_U5fMfNzMp",
            },
            "zupass_title": {
                type: "string",
                value: event.title,
            },
            "zupass_description": {
                type: "string",
                value: `by ${group.nickname || group.handle}`,
            },
            "start_date": {
                type: "date",
                value: new Date(event.start_time!),
            },
            "end_date": {
                type: "date",
                value: new Date(event.end_time!),
            },
            "group_id": {
                type: "string",
                value: group.id.toString(),
            },
            "group_name": {
                type: "string",
                value: group.nickname || group.handle || '',
            },
            "attendee_email": {
                type: "string",
                value: profile.email,
            },
            "attendee_username": {
                type: "string",
                value: profile.nickname || profile.handle || '',
            },
        }
        const _signedPod = podLib.POD.sign(entries, process.env.ZUPASS_PRIVATE_KEY!);

        res.status(200).send({
            entries: entries,
            signature: _signedPod.signature,
            signerPublicKey: _signedPod.signerPublicKey,
        });

    } catch (e: any) {
        console.error(`[ERROR] ${e}`);
        res.status(400).send("issue POD failed");
    }
}
