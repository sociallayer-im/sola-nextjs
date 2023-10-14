import {useSearchParams} from 'next/navigation'
import CreateBadgeNonPrefill from './NonPrefill'
import CreateBadgeWithPrefill from './WithPrefill'

function CreateNftPass() {
    const searchParams = useSearchParams()
    const prefillBadgeId = searchParams.get('nftpass')
    return  <>
        { prefillBadgeId
            ? <CreateBadgeWithPrefill nftPassId={ Number(prefillBadgeId) } />
            : <CreateBadgeNonPrefill />
        }
    </>
}

export default CreateNftPass
