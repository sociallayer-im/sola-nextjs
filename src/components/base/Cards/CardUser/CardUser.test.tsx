import { render, screen, userEvent , act} from '../../../../test/test-utils'
import CardUser from './CardUser'
import { profiles } from '../../../../test/mockDataForTest'

describe('CardUser', async () => {
    it('正常渲染', () => {
        render(<CardUser profile={profiles[0]}/>)
        expect(screen.getByTestId('CardUser')).toBeInTheDocument()
    })

    it('显示自定义内容', () => {
        render(<CardUser
            img={() => <img src={profiles[0].image_url!} />}
            content={() => <div>{profiles[0].username}</div>}
        />)

        expect(screen.getByTestId('CardUser').querySelector('img')!.getAttribute('src')).toEqual(profiles[0].image_url)
        expect(screen.getByText(profiles[0].username!)).toBeInTheDocument()
    })
})
