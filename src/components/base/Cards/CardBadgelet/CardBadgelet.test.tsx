import { render, screen, userEvent , act} from '../../../../test/test-utils'
import CardBadgelet from './CardBadgelet'
import { badgelets } from '../../../../test/mockDataForTest'

describe('CardBadgelet', async () => {
    it('正常渲染', () => {
        render(<CardBadgelet badgelet={badgelets[0]}/>)
        expect(screen.getByTestId('CardBadgelet')).toBeInTheDocument()
        expect(screen.getByText(badgelets[0].badge.name)).toBeInTheDocument()
        expect(screen.getByTestId('CardBadgelet').querySelector('img')!.getAttribute('src')).toEqual(badgelets[0].badge.image_url)
    })

    it('点击弹出徽章详情', async () => {
        render(<CardBadgelet badgelet={badgelets[0]}/>)
        await act(async () => {
            await userEvent.click(screen.getByTestId('CardBadgelet'))
        })
        expect(screen.getByText('Badge Details')).toBeInTheDocument()
    })
})
