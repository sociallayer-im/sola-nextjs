import { useNavigate, useSearchParams } from 'react-router-dom'
import CreateBadgeNonPrefill from './NonPrefill'
import CreateBadgeWithPrefill from './WithPrefill'

function CreateNftPass() {
    const [searchParams, _] = useSearchParams()
    const prefillBadgeId = searchParams.get('nftpass')
    return  <>
        { prefillBadgeId
            ? <CreateBadgeWithPrefill nftPassId={ Number(prefillBadgeId) } />
            : <CreateBadgeNonPrefill />
        }
    </>
}

export default CreateNftPass
