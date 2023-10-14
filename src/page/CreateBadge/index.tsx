import {useSearchParams} from "next/navigation";
import CreateBadgeNonPrefill from './NonPrefill'
import CreateBadgeWithPrefill from './WithPrefill'

function CreateBadge() {
    const searchParams = useSearchParams()
    const prefillBadgeId = searchParams.get('badge')
    return  <>
        { prefillBadgeId
            ? <CreateBadgeWithPrefill badgeId={ Number(prefillBadgeId) } />
            : <CreateBadgeNonPrefill></CreateBadgeNonPrefill>
        }
    </>
}

export default CreateBadge
