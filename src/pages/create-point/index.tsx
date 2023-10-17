import {useSearchParams} from 'next/navigation'
import CreateBadgeNonPrefill from './NonPrefill'
import CreateBadgeWithPrefill from './WithPrefill'

function CreatePoint() {
    const searchParams = useSearchParams()
    const prefillBadgeId = searchParams.get('point')
    return  <>
        { prefillBadgeId
            ? <CreateBadgeWithPrefill pointId={ Number(prefillBadgeId) } />
            : <CreateBadgeNonPrefill />
        }
    </>
}

export default CreatePoint
