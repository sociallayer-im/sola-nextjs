import { render, screen, userEvent , act} from '../../../../test/test-utils'
import CardInvite from './CardInvite'
import { invites, groups } from '../../../../test/mockDataForTest'

describe('CardInvite', async () => {
    it('正常渲染', () => {
        render(<CardInvite invite={invites[0]} groupName={groups[0].username} groupCover={groups[0].image_url!}/>)
        expect(screen.getByTestId('CardInvite')).toBeInTheDocument()
        expect(screen.getByText('Member of ' + groups[0].username)).toBeInTheDocument()
        expect(screen.getByTestId('CardInvite').querySelector('img')!.getAttribute('src')).toEqual(groups[0].image_url)
    })

    it('点击弹出邀请详情', async () => {
        render(<CardInvite invite={invites[0]} groupName={groups[0].username} groupCover={groups[0].image_url!}/>)
        await act(async () => {
            await userEvent.click(screen.getByTestId('CardInvite'))
        })
        expect(screen.getByText('Invite Details')).toBeInTheDocument()
    })
})
