import Empty from '@/components/base/Empty'
import AppButton, { BTN_KIND } from '@/components/base/AppButton/AppButton'
import {useRouter} from 'next/navigation'

function ErrorPage() {
    const router = useRouter()

    return (
        <>
            <div className='error-page'>
                <Empty text={'Page not found~'}></Empty>
                <AppButton kind={BTN_KIND.primary} onClick={ () => {router.push('/') } }>Back to Home</AppButton>
            </div>
        </>
    )
}

export default ErrorPage
