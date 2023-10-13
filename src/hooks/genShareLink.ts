import { useContext } from 'react'
import langContext from '../components/provider/LangProvider/LangContext'

function useGenShareLink () {
    const { lang } = useContext(langContext)

    function genPresendShareLink (preendId: number, code?: string) {
       return  code
            ? `${window.location.protocol}//${window.location.host}/presend/${preendId}_${code}`
            : `${window.location.protocol}//${window.location.host}/presend/${preendId}`
    }

    function genBadgeShareLink (badgeId: number) {
        return `${window.location.protocol}//${window.location.host}/badge/${badgeId}`
    }

    function genBadgeletLink (badgeIdlet: number) {
        return `${window.location.protocol}//${window.location.host}/badgelet/${badgeIdlet}`
    }

    function genInviteLink (groupId: number, inviteId: number) {
        return `${window.location.protocol}//${window.location.host}/invite/${groupId}/${inviteId}`
    }

    return { genPresendShareLink, genInviteLink, genBadgeShareLink, genBadgeletLink }
}

export default useGenShareLink
