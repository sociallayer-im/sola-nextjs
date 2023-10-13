import { useNavigate, useSearchParams } from 'react-router-dom'
import CreateBadgeNonPrefill from './NonPrefill'
import CreateBadgeWithPrefill from './WithPrefill'

function CreatePoint() {
    const [searchParams, _] = useSearchParams()
    const prefillBadgeId = searchParams.get('point')
    return  <>
        { prefillBadgeId
            ? <CreateBadgeWithPrefill pointId={ Number(prefillBadgeId) } />
            : <CreateBadgeNonPrefill />
        }
    </>
}

export default CreatePoint
