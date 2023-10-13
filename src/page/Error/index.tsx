import Layout from '../../components/Layout/Layout'
import Empty from '../../components/base/Empty'
import './Error.less'
import AppButton, { BTN_KIND } from '../../components/base/AppButton/AppButton'
import {useRouter} from 'next/navigation'

function ErrorPage() {
    const router = useRouter()

    return (
        <Layout>
            <div className='error-page'>
                <Empty text={'Page not found~'}></Empty>
                <AppButton kind={BTN_KIND.primary} onClick={ () => {router.push('/') } }>Back to Home</AppButton>
            </div>
        </Layout>
    )
}

export default ErrorPage
