import { useNavigate, useSearchParams } from 'react-router-dom'
import CreateBadgeNonPrefill from './NonPrefill'
import CreateBadgeWithPrefill from './WithPrefill'

function CreateBadge() {
    const [searchParams, _] = useSearchParams()
    const prefillBadgeId = searchParams.get('gift')
    return  <>
        { prefillBadgeId
            ? <CreateBadgeWithPrefill badgeId={ Number(prefillBadgeId) } />
            : <CreateBadgeNonPrefill></CreateBadgeNonPrefill>
        }
    </>
}

export default CreateBadge
