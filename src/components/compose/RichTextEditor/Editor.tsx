import {useContext, useEffect, useId, useRef, useState} from 'react'
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import userContext from "@/components/provider/UserProvider/UserContext";
import chooseFile from "@/utils/chooseFile";
import solas from "@/service/solas";
import {Command, EditorState, Plugin, TextSelection, Transaction} from "prosemirror-state";
import {Attrs, NodeSpec, Schema, Slice } from "prosemirror-model";
import {undo, redo} from "prosemirror-history";
import {addListNodes, liftListItem, splitListItem, wrapInList} from "./schema-list";
import {joinUp, lift, setBlockType, splitBlock, splitBlockKeepMarks, toggleMark, wrapIn} from "prosemirror-commands";
import {EditorView} from "prosemirror-view";
import {editorSetup} from "@/components/compose/RichTextEditor/setup";
import styles from "@/components/compose/RichTextEditor/RichTextEditor.module.scss";
import {PLACEMENT, StatefulPopover} from "baseui/popover";
import {StatefulMenu} from "baseui/menu";
import AppButton from "@/components/base/AppButton/AppButton";
import {defaultMarkdownParser, defaultMarkdownSerializer, schema as markdownSchema} from "./markdown/index";
import AppInput from "@/components/base/AppInput";

export interface MenuItemForm {
    name: string
    title: string
    command: Command
    icon?: string
    hide?: boolean
}

const videoNodeSpec: NodeSpec = {
    attrs: {type: {default: "video/mp4"}, src: {default: ""}},
    inline: true,
    group: "inline",
    draggable: true,
    toDOM: node => {
        const video = document.createElement("video")
        video.setAttribute('Controls', 'true')
        const source = document.createElement("source")
        source.setAttribute('src', node.attrs.src)
        source.setAttribute('type', 'video/mp4')
        video.appendChild(source)
        return {
            dom: video,
        }
    },
    parseDOM: [{
        tag: "video",
        getAttrs: (dom: HTMLElement | string) => {
            if (typeof dom === 'string') return null
            const type = dom.querySelector('source')?.getAttribute('type')
            const src = dom.querySelector('source')?.getAttribute('src')
            return {
                type,
                src
            } as Attrs
        }
    }]
}

export type MarkDownStr = string

function moveToEnd (state:EditorState, dispatch: any) {
    // Don't dispatch this command if the selection is empty
    if (state.selection.empty) return false;

    // Subtract one so that it falls within the current node
   try {
       const endPos = state.selection.$to.after() - 1;
       const selection = new TextSelection(state.doc.resolve(endPos));
       let transaction = state.tr.setSelection(selection);

       if (dispatch) dispatch(transaction.scrollIntoView());

       return true;
   } catch (e) {
       return  false
   }
}

function RichTextEditor({
                            initText,
                            onChange,
                            height,
                            maxHeight
                        }: { height: number, maxHeight?: number, initText?: MarkDownStr, onChange?: (text: MarkDownStr) => any }) {
    const editorRef = useRef<any>(null)
    const editorViewRef = useRef<any>(null)
    const [editorState, setEditorState] = useState<any>(null)
    const [editorMenuCommand, setEditorMenuCommand] = useState<{ markerMenu: MenuItemForm[], listMenu: MenuItemForm[], insertMenu: MenuItemForm[], historyMenu: MenuItemForm[], otherMenu: MenuItemForm[] }>({
        markerMenu: [],
        listMenu: [],
        insertMenu: [],
        otherMenu: [],
        historyMenu: []
    })
    const {openDialog, showLoading, showToast} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const editorId = useId()

    const selectFile = async (cb: (url: string) => any) => {
        try {
            const file = await chooseFile({accepts: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']})
            const reader = new FileReader()
            reader.readAsDataURL(file[0])
            reader.onload = async (file) => {
                const baseData = reader.result as string;

                //base64-->blob
                let byteString;
                if (baseData!.split(',')[0].indexOf('base64') >= 0)
                    byteString = atob(baseData.split(',')[1]);//base64 解码
                else {
                    byteString = unescape(baseData.split(',')[1]);
                }
                const mimeString = baseData.split(',')[0].split(':')[1].split(';')[0];//mime类型 -- image/png
                const ia = new Uint8Array(byteString.length);//创建视图
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                let blob = new Blob([ia], {type: 'image/png'});

                const unload = showLoading()
                try {
                    const newImage = await solas.uploadImage({
                        file: blob,
                        uploader: user.wallet || user.email || '',
                        auth_token: user.authToken || ''
                    })
                    unload()
                    cb(newImage);
                } catch (e: any) {
                    console.log('[selectFile]: ', e)
                    unload()
                    showToast(e.message || 'Upload fail')
                    cb('');
                }
            }
        } catch (e: any) {
            console.log('[selectFile]: ', e)
            showToast(e.message || 'Upload fail')
            cb('');
        }
    }

    useEffect(() => {
        if (editorRef.current && typeof window !== 'undefined') {
            const mySchema = new Schema({
                nodes: addListNodes(markdownSchema.spec.nodes, "paragraph block*", "block"),
                marks: markdownSchema.spec.marks
            })

            const UpdateEditorView = new Plugin({
                view(editorView) {
                    return {
                        update(view, prevState) {
                            setEditorState(view.state)
                            const res = defaultMarkdownSerializer.serialize(view.state.doc)
                            onChange && onChange(res)
                        }
                    }
                }
            })

            const markerMenu: MenuItemForm[] = [
                {name: 'B', title: 'Bold', command: toggleMark(markdownSchema.marks.strong), icon: 'editor-icon-bold'},
                {name: 'I', title: 'Italic', command: toggleMark(markdownSchema.marks.em), icon: 'editor-icon-italic'},
                {
                    name: 'Quote',
                    title: 'Quote',
                    command: wrapIn(markdownSchema.nodes.blockquote),
                    icon: 'editor-icon-quote'
                },
            ]

            const listMenu: MenuItemForm[] = [
                {
                    name: 'Ordered List',
                    title: 'Ordered List',
                    command:  wrapInList(markdownSchema.nodes.ordered_list),
                    icon: 'editor-icon-ordered-list'
                },
                {
                    name: 'Bullet List',
                    title: 'BulletList',
                    command: wrapInList(markdownSchema.nodes.bullet_list),
                    icon: 'editor-icon-unordered-list'
                }
            ]

            const insertMenu: MenuItemForm[] = [
                {
                    name: 'Link',
                    title: 'Link',
                    icon: 'editor-icon-link',
                    command: (editorState, dispatch, editorView) => {
                        let {from, $from, to, empty} = editorState.selection
                        let isInLink: undefined | boolean = false
                        if (empty) {
                            const node = editorState.doc.nodeAt(from)
                            isInLink = node?.marks.some(mark => mark.type === markdownSchema.marks.link)
                        }
                        const enable = !isInLink && !editorState.doc.rangeHasMark(from, to, markdownSchema.marks.link)
                        if (enable && dispatch) {
                            openDialog({
                                size: [340, 'auto'],
                                position: 'bottom',
                                content: (close: () => any) => {
                                    return <DialogInsertLink close={close} onConfig={(href, title) => {
                                        if (!empty) {
                                            toggleMark(markdownSchema.marks.link, {
                                                href,
                                                title
                                            })(editorState, dispatch, editorView)
                                        } else {
                                            const schema = editorState.schema
                                            const node = schema.text(title, [markdownSchema.marks.link.create({
                                                title,
                                                href
                                            })])
                                            dispatch && dispatch(editorState.tr.replaceSelectionWith(node, false))
                                        }
                                        close()
                                        editorView?.focus()
                                    }}/>
                                }
                            })
                            return true
                        } else return enable && !dispatch;
                    }
                },
                {
                    name: 'Upload Image',
                    title: 'Url Image',
                    hide: true,
                    command: (state, dispatch, view) => {
                        const canInsert = () => {
                            let $from = state.selection.$from
                            for (let d = $from.depth; d >= 0; d--) {
                                let index = $from.index(d)
                                if ($from.node(d).canReplaceWith(index, index, markdownSchema.nodes.image)) return true
                            }
                            return false
                        }

                        const available = canInsert()

                        if (view && dispatch && available) {
                            selectFile(imgUrl => {
                                if (imgUrl) {
                                    const attr = {
                                        src: imgUrl,
                                        title: '',
                                    }
                                    dispatch && dispatch(state.tr.replaceSelectionWith(markdownSchema.nodes.image.createAndFill(attr)!))
                                    view && view.focus()
                                }
                            })
                            return true
                        } else {
                            return available
                        }
                    }
                },
                {
                    name: 'Url Image',
                    title: 'Url Image',
                    command: (state, dispatch, view) => {
                        const canInsert = () => {
                            let $from = state.selection.$from
                            for (let d = $from.depth; d >= 0; d--) {
                                let index = $from.index(d)
                                if ($from.node(d).canReplaceWith(index, index, markdownSchema.nodes.image)) return true
                            }
                            return false
                        }

                        const available = canInsert()

                        if (view && dispatch && available) {
                            openDialog({
                                size: [340, 'auto'],
                                position: 'bottom',
                                content: (close: () => any) => <DialogInsertImage
                                    close={close}
                                    onConfig={(src, title) => {
                                        const attr = {
                                            src,
                                            title,
                                        }
                                        dispatch && dispatch(state.tr.replaceSelectionWith(markdownSchema.nodes.image.createAndFill(attr)!))
                                        view && view.focus()
                                        close()
                                    }}
                                />
                            })
                            return true
                        } else {
                            return available
                        }
                    },
                    hide: true
                }
            ]

            const historyMenu: MenuItemForm[] = [
                {
                    name: 'Undo',
                    title: 'Undo',
                    icon: 'editor-icon-undo',
                    command: (state, dispatch) => {
                        return undo(state, dispatch)
                    }
                },
                {
                    name: 'Redo',
                    title: 'Redo',
                    icon: 'editor-icon-redo',
                    command: (state, dispatch) => {
                        return redo(state, dispatch)
                    }
                }
            ]

            const otherMenu: MenuItemForm[] = [
                {hide: true, name: 'Code', title: 'Code', command: toggleMark(markdownSchema.marks.code)},
                {
                    hide: true,
                    name: 'Code Block',
                    title: 'CodeBlock',
                    command: setBlockType(markdownSchema.nodes.code_block)
                },
                {
                    hide: true,
                    name: 'Plant Text',
                    title: 'PlantText',
                    command: setBlockType(markdownSchema.nodes.paragraph)
                },
                {hide: true, name: 'Lift out', title: 'Lift out of enclosing block', command: lift},
                {
                    hide: true,
                    name: 'Video', title: 'Video', command: (state, dispatch, view) => {
                        const canInsert = () => {
                            let $from = state.selection.$from
                            for (let d = $from.depth; d >= 0; d--) {
                                let index = $from.index(d)
                                if ($from.node(d).canReplaceWith(index, index, markdownSchema.nodes.image)) return true
                            }
                            return false
                        }

                        const available = canInsert()

                        if (view && dispatch && available) {
                            const attr = {
                                src: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Schlossbergbahn.webm',
                            }
                            dispatch && dispatch(state.tr.replaceSelectionWith(markdownSchema.nodes.video.createAndFill(attr)!))
                            view && view.focus()
                            return true
                        } else {
                            return available
                        }
                    }
                }
            ]


            editorViewRef.current = new EditorView(document.querySelector(`#${CSS.escape(editorId)}`), {
                state: EditorState.create({
                    doc: defaultMarkdownParser.parse(initText || '')!,
                    plugins: [UpdateEditorView, ...editorSetup({schema: markdownSchema})],
                })
            })
            setEditorState(editorViewRef.current.state)
            setEditorMenuCommand({
                markerMenu,
                listMenu,
                insertMenu,
                historyMenu,
                otherMenu
            })
        }

        return () => {
            editorViewRef.current?.destroy()
        }
    }, [editorRef, user])

    return (<div className={styles['page']}>
        <div className={styles['editor-wrapper']}>
            <div className={'menubar'}>
                {editorMenuCommand.markerMenu.length > 0 &&
                    editorMenuCommand.markerMenu.filter(item => !item.hide).map((item, index) => {
                        return <MenuButton menuItemForm={item} key={index}
                                           editorView={editorViewRef.current || undefined}
                                           editorState={editorState || undefined}/>
                    })
                }
                <span className={'split'}/>
                {editorMenuCommand.listMenu.length > 0 &&
                    editorMenuCommand.listMenu.filter(item => !item.hide).map((item, index) => {
                        return <MenuButton menuItemForm={item} key={index}
                                           editorView={editorViewRef.current || undefined}
                                           editorState={editorState || undefined}/>
                    })
                }
                <span className={'split'}/>
                {editorMenuCommand.insertMenu.length > 0 &&
                    editorMenuCommand.insertMenu.filter(item => !item.hide).map((item, index) => {
                        return <MenuButton menuItemForm={item} key={index}
                                           editorView={editorViewRef.current || undefined}
                                           editorState={editorState || undefined}/>
                    })
                }
                <StatefulPopover
                    autoFocus={false}
                    returnFocus={false}
                    popoverMargin={-115}
                    placement={PLACEMENT.topLeft}
                    content={({close}: any) => <StatefulMenu
                        onItemSelect={({item}: any) => {
                            const targetCommand = editorMenuCommand.insertMenu.find(i => i.name === item.name)
                            if (!!targetCommand && targetCommand.command(editorState, undefined, editorViewRef.current)) {
                                targetCommand.command(editorState, editorViewRef.current?.dispatch, editorViewRef.current)
                            }
                            close()
                        }}
                        items={[
                            {
                                label: "Url",
                                name: 'Url Image'
                            },
                            {
                                label: "Upload",
                                name: 'Upload Image'
                            }
                        ]}/>}>
                    <div className={'menu-item'}><i className={'editor-icon-photo'}/></div>
                </StatefulPopover>
                <span className={'split'}/>
                {editorMenuCommand.historyMenu.length > 0 &&
                    editorMenuCommand.historyMenu.filter(item => !item.hide).map((item, index) => {
                        return <MenuButton menuItemForm={item} key={index}
                                           editorView={editorViewRef.current || undefined}
                                           editorState={editorState || undefined}/>
                    })
                }
            </div>
            <div ref={editorRef} id={editorId}
                 className={'editor'}
                 style={{minHeight: `${height}px`, maxHeight: maxHeight ? `${maxHeight}px` : 'initial'}}/>
        </div>
    </div>)
}

export default RichTextEditor


function MenuButton({
                        menuItemForm,
                        editorState,
                        editorView
                    }: { menuItemForm: MenuItemForm, editorState?: EditorState, editorView?: EditorView }) {
    const [enable, setEnable] = useState<boolean>(false)

    useEffect(() => {
        if (editorState) {
            const isAvailable = menuItemForm.command(editorState, undefined, editorView)
            setEnable(isAvailable)
        } else {
            setEnable(false)
        }
    }, [editorState])

    return <div className={enable ? 'menu-item' : 'menu-item disable'} title={menuItemForm.title} onClick={() => {
        if (editorState && editorView) {
            editorView?.focus()
            menuItemForm.command(editorState, editorView.dispatch, editorView)
        }
    }}>
        {
            menuItemForm.icon ? <i className={menuItemForm.icon}></i> : menuItemForm.name
        }
    </div>
}

function DialogInsertLink(props: { close?: () => any, onConfig?: (href: string, title: string) => any }) {
    const [href, setHref] = useState<string>('')
    const [title, setTitle] = useState<string>('')
    const [errMsg, setErrMsg] = useState<string>('')

    return <div className={styles['dialog-insert-link']}>
        <div className={styles['title']}>Insert Link</div>
        <div className={styles['sub-title']}>Link</div>
        <AppInput autoFocus value={href} onChange={e => {
            setHref(e.target.value)
        }}/>
        <div className={styles['err']}>{errMsg}</div>
        <div className={styles['sub-title']}>Text (Optional)</div>
        <AppInput value={title} onChange={e => {
            setTitle(e.target.value)
        }}/>
        <div className={styles['btns']}>
            <AppButton onClick={e => {
                props.close && props.close()
            }}>Cancel</AppButton>
            <AppButton
                disabled={!href}
                special onClick={e => {
                if (!href.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
                    setErrMsg('Invalid url')
                } else {
                    setErrMsg('')
                    props.onConfig && props.onConfig(href, title || href)
                }
            }}>Confirm</AppButton>
        </div>
    </div>
}

function DialogInsertImage(props: { close?: () => any, onConfig?: (src: string, title: string) => any }) {

    const [src, setSrc] = useState<string>('')
    const [title, setTitle] = useState<string>('')
    const [errMsg, setErrMsg] = useState<string>('')

    return <div className={styles['dialog-insert-link']}>
        <div className={styles['title']}>Insert Image</div>
        <div className={styles['sub-title']}>Url</div>
        <AppInput autoFocus value={src} onChange={e => {
            setSrc(e.target.value)
        }}/>
        <div className={styles['err']}>{errMsg}</div>

        <div className={styles['sub-title']}>Tittle (Optional)</div>
        <AppInput value={title} onChange={e => {
            setTitle(e.target.value)
        }}/>

        <div className={styles['btns']}>
            <AppButton onClick={e => {
                props.close && props.close()
            }}>Cancel</AppButton>
            <AppButton
                disabled={!src}
                special onClick={e => {
                if (!src.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
                    setErrMsg('Invalid url')
                } else {
                    setErrMsg('')
                    props.onConfig && props.onConfig(src, title)
                }
            }}>Confirm</AppButton>
        </div>
    </div>

}

