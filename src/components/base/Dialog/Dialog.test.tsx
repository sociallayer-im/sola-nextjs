import { render, screen, userEvent , act} from '../../../test/test-utils'
import Dialog from './Dialog'

describe('Dialog', () => {
    it('正常渲染', () => {
        render(<Dialog />)
        expect(screen.getByTestId('AppDialog')).toBeInTheDocument()
    })
})
