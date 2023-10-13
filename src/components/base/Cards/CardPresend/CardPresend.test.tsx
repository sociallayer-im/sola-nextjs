import { render, screen, userEvent , act} from '../../../../test/test-utils'
import CardPresend from './CardPresend'
import { presends } from '../../../../test/mockDataForTest'

describe('CardPresend', async () => {
    it('正常渲染', () => {
        render(<CardPresend presend={presends[0]}/>)
        expect(screen.getByTestId('CardPresend')).toBeInTheDocument()
        expect(screen.getByText(presends[0].badge.name)).toBeInTheDocument()
        expect(screen.getByTestId('CardPresend').querySelector('img')!.getAttribute('src')).toEqual(presends[0].badge.image_url)
    })

    it('点击弹出展示详情', async () => {
        render(<CardPresend presend={presends[0]}/>)
        await act(async () => {
            await userEvent.click(screen.getByTestId('CardPresend'))
        })
        expect(screen.getByText('Presend Details')).toBeInTheDocument()
    })
})
