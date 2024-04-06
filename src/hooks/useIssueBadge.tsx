import {useContext} from 'react'
import {Badge} from '../service/solas'
import DialogsContext from '../components/provider/DialogProvider/DialogsContext'
import {OpenDialogProps} from '@/components/provider/DialogProvider/DialogProvider'
import DialogIssuePrefill, {BadgeBookDialogRes} from '../components/base/Dialog/DialogIssuePrefill/DialogIssuePrefill'
import UserContext from '../components/provider/UserProvider/UserContext'
import {useRouter} from 'next/navigation'

export interface StartIssueBadgeProps {
    badges: Badge[]
    to?: string,
    group_id?: number
}

function useIssueBadge() {
    const {user} = useContext(UserContext)
    const {openDialog} = useContext(DialogsContext)
    const router = useRouter()

    function toIssuePage(props: BadgeBookDialogRes, to?: string, group_id?: number) {
        let path = `/create-${props.type}`

        if (props.type === 'private') {
            path = `/create-badge?type=private`
        }

        const split = (path: string) => {
            return path.includes('?') ? '&' : '?'
        }

        if (group_id) {
            path = path + split(path) + `group=${group_id}`
        }

        if (to) {
            path = path + split(path) + `to=${to}`
        }

        if (props.badgeId) {
            path = path + split(path) + `badge=${props.badgeId}`
        }

        if (props.badgebookId) {
            path = path + split(path) + `badgebook=${props.badgeId}`
        }

        router.push(path)
    }

    return (props: StartIssueBadgeProps) => {
        // 没有登录或者没有徽章，直接跳转到徽章发行页面
        // if (!user.id) { toIssuePage({type:'badge'}, props.to); return }
        // if (!props.badges.length) {toIssuePage({type:'badge'}, props.to); return;}

        openDialog({
            content: (close: any) => <DialogIssuePrefill
                badges={props.badges}
                profileId={user.id!}
                group_id={props?.group_id}
                onSelect={(res) => {
                    toIssuePage(res, props.to, props.group_id)
                }}
                handleClose={close}/>,
            position: 'bottom',
            size: [360, 'auto']
        } as OpenDialogProps)
    }
}

export default useIssueBadge
