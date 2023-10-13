import { render, screen, userEvent , act} from '../../../../test/test-utils'
import CardSearchDomain from './CardSearchDomain'
import { profiles } from '../../../../test/mockDataForTest'

describe('CardSearchDomain', async () => {
    it('正常渲染', () => {
        render(<CardSearchDomain  profile={profiles[0]}/>)
        expect(screen.getByTestId('CardSearchDomain')).toBeInTheDocument()
    })

    it('关键词高亮', () => {
        render(<CardSearchDomain  profile={profiles[0]} keyword={profiles[0].username!} />)
        expect(screen.getByText(profiles[0].username!)).toHaveClass('highlight')
    })

    it('点击跳转对应profile页', async () => {
        render(<CardSearchDomain  profile={profiles[0]} keyword={profiles[0].username!} />)
        await act(async () => {
            await userEvent.click(screen.getByTestId('CardSearchDomain'))
        })

        expect(screen.getByText(`/profile/${profiles[0].username!}`)).toBeInTheDocument()
    })
})
