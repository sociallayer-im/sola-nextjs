import {useSearchParams} from "next/navigation";
import CreateBadgeNonPrefill from './NonPrefill'
import CreateBadgeWithPrefill from './WithPrefill'

function CreateBadge() {
    const [searchParams, _] = useSearchParams()
    const prefillBadgeId = searchParams.get('private')
    return  <>
        { prefillBadgeId
            ? <CreateBadgeWithPrefill privateId={ Number(prefillBadgeId) } />
            : <CreateBadgeNonPrefill></CreateBadgeNonPrefill>
        }
    </>
}

export default CreateBadge
