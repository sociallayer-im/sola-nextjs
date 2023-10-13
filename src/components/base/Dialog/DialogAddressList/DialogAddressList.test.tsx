import { render, screen, userEvent , act, waitFor } from "../../../../test/test-utils"
import { vi } from 'vitest'
import DialogAddressList, { AddressListProps } from './DialogAddressList'
import server from '../../../../test/mockAPI'
import UserContext from '../../../provider/UserProvider/UserContext'
import {useContext, useEffect} from 'react'
import { profiles } from '../../../../test/mockDataForTest'

const TestDialogAddressList = (props: AddressListProps<string>) => {
    const { setUser } = useContext(UserContext)

    useEffect(() => {
        setUser({
            id: profiles[0].id,
            userName: profiles[0].username!,
            avatar: profiles[0].image_url,
            domain: profiles[0].domain,
            email: profiles[0].email,
            wallet: profiles[0].address,
            twitter: profiles[0].twitter,
        })
    }, [])

    return <DialogAddressList {...props} />
}

describe('DialogAddressList', () => {
    beforeAll(() => server.listen())
    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it('正常渲染', async () => {
        const handleClick = vi.fn()
        const handleChange = vi.fn()

        await render(<TestDialogAddressList
            handleClose={ handleClick }
            value={[]}
            onChange={ handleChange }
        />)

        const div = await waitFor(() => screen.getByTestId('AddressList'))
        expect(div).toBeInTheDocument()
    })

    it('切换tab', async  () => {
        const handleClick = vi.fn()
        const handleChange = vi.fn()

        await render(<TestDialogAddressList
            handleClose={ handleClick }
            value={[]}
            onChange={ handleChange }
        />)

        // 等待数据加载完成
        await waitFor(() => screen.getByTestId('AddressList'))

        // 点击切换’Follower‘ tab
        await act(async () => {
            await userEvent.click(screen.getByText('Follower'))
        })
        expect(screen.getByText(profiles[0].username!)).toBeInTheDocument()
    })
})
