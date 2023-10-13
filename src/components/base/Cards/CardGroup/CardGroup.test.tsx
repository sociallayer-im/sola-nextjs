import { render, screen, userEvent , act} from '../../../../test/test-utils'
import CardGroup from './CardGroup'
import { groups, profiles } from '../../../../test/mockDataForTest'

describe('CardGroup', async () => {
    it('正常渲染', () => {
        render(<CardGroup group={groups[0]} profile={profiles[0]}/>)
        expect(screen.getByTestId('CardGroup')).toBeInTheDocument()
    })

    it('若profile是group的拥有者则显示‘拥有者’', () => {
        render(<CardGroup group={groups[0]} profile={profiles[0]}/>)
        expect(screen.getByText('Owner')).toBeInTheDocument()
    })

    it('若profile不是group的拥有者则显示‘成员’', () => {
        render(<CardGroup group={groups[0]} profile={profiles[1]}/>)
        expect(screen.getByText('Member')).toBeInTheDocument()
    })
})
