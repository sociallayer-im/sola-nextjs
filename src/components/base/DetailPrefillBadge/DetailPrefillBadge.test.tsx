import { render, screen, userEvent , act} from '../../../test/test-utils'
import DetailPrefillBadge from './DetailPrefillBadge'
import { badges } from '../../../test/mockDataForTest'

describe('DetailPrefillBadge', () => {
    it('正常渲染', () => {
        render(<DetailPrefillBadge badge={badges[0]} />)
        screen.debug()
        expect(screen.getByTestId('DetailPrefillBadge')).toBeInTheDocument()
        expect(screen.getByTestId('DetailPrefillBadge').querySelector('img')!.getAttribute('src')).toEqual(badges[0].image_url)
        expect(screen.getByText(badges[0].name)).toBeInTheDocument()
    })
})
