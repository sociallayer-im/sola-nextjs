import CreateInvite from "@/pages/create-invite/[groupId]/create-invite";
import VitaliaCreateInvite from '@/pages/vitalia/invite/index'

export default function CreateInvitePage () {
    return process.env.NEXT_PUBLIC_SPECIAL_VERSION == 'vitalia' ?
        <VitaliaCreateInvite /> :
        <CreateInvite />
}
