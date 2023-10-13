import { render, screen, userEvent , act} from '../../../../test/test-utils'
import CardCreateGroup from './CardCreateGroup'

describe('CardCreateGroup', async () => {
    it('正常渲染', () => {
        render(<CardCreateGroup/>)
        expect(screen.getByTestId('CardCreateGroup')).toBeInTheDocument()
    })
})
