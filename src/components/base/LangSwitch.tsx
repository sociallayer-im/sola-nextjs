import { useContext } from 'react'
import LangContext, { LangType } from '../provider/LangProvider/LangContext'
import MenuItem from './MenuItem'
import { StatefulPopover, PLACEMENT } from 'baseui/popover'
import { useStyletron } from 'baseui'

function LangSwitch () {
    const { langType, switchLang } = useContext(LangContext)
    const [css] = useStyletron()

    const menuContent = (close: any) => <>
        <MenuItem selected={langType === LangType.en}
                  onClick={ () => { switchLang(LangType.en); close() } }>
            { LangType.en.toUpperCase() }
        </MenuItem>
        <MenuItem selected={langType === LangType.cn}
                  onClick={ () => { switchLang(LangType.cn); close() } }>
            { LangType.cn.toUpperCase() }
        </MenuItem>
    </>

    const overridesStyle = {
        Body : {
            style: {
                'z-index': 999
            }
        }}

    return (
    <StatefulPopover
        overrides={overridesStyle}
        placement={PLACEMENT.bottom}
        returnFocus
        content={({close}) => menuContent(close) }
        autoFocus>
        <div className={css({cursor: 'pointer', color: 'var(--color-text-main)'})}>
            { langType.toUpperCase() }
        </div>
    </StatefulPopover>
    )
}

export default LangSwitch
