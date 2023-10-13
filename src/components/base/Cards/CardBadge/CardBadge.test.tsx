import { render, screen, userEvent , act} from '../../../../test/test-utils'
import CardBadge from './CardBadge'
import { badges } from '../../../../test/mockDataForTest'

describe('CardBadge', async () => {
    it('正常渲染', () => {
        render(<CardBadge badge={badges[0]}/>)
        expect(screen.getByTestId('CardBadge')).toBeInTheDocument()
        expect(screen.getByText(badges[0].name)).toBeInTheDocument()
        expect(screen.getByTestId('CardBadge').querySelector('img')!.getAttribute('src')).toEqual(badges[0].image_url)
    })

    it('点击弹出徽章详情', async () => {
        render(<CardBadge badge={badges[0]}/>)
        await act(async () => {
            await userEvent.click(screen.getByTestId('CardBadge'))
        })
        expect(screen.getByText('Badge Details')).toBeInTheDocument()
    })
})
