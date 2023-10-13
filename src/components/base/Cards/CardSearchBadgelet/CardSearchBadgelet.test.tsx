import { render, screen, userEvent , act} from '../../../../test/test-utils'
import CardSearchBadgelet from './CardSearchBadgelet'
import { badgelets } from '../../../../test/mockDataForTest'

describe('CardSearchBadgelet', async () => {
    it('正常渲染', () => {
        render(<CardSearchBadgelet badgelet={badgelets[0]}/>)
        expect(screen.getByTestId('CardSearchBadgelet')).toBeInTheDocument()
    })
})
