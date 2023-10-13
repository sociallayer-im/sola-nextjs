import { render, screen, userEvent } from '../../../test/test-utils'
import AppSwiper from './AppSwiper'

describe('AppSwiper', async () => {
    it('正常渲染', () => {
        render(<AppSwiper items={[<div>1</div>, <div>2</div>, <div>3</div>]} space={12} itemWidth={100}/>)
        expect(screen.getByTestId('AppSwiper')).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument()
    })
})
